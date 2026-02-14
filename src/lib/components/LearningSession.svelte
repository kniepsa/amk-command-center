<script lang="ts">
  import { browser } from '$app/environment';

  interface Course {
    id: string;
    name: string;
    icon: string;
    description: string;
    duration: string;
    frameworks: string[];
    topics: string[];
  }

  interface Lesson {
    day: number;
    title: string;
    framework: string;
    content: string;
    keyTakeaways: string[];
    practiceExercise: string;
    nextLesson: string;
  }

  interface ActiveCourse {
    courseId: string;
    courseName: string;
    courseIcon: string;
    currentDay: number;
    totalDays: number;
    startDate: string;
    lesson: Lesson;
  }

  let showCourseSelection = $state(false);
  let courses = $state<Course[]>([]);
  let activeCourse = $state<ActiveCourse | null>(null);
  let isLoading = $state(true);

  // Load active course or show selection
  $effect(() => {
    if (browser) {
      loadActiveCourse();
    }
  });

  async function loadActiveCourse() {
    try {
      const res = await fetch('/api/learning/current');
      if (res.ok) {
        activeCourse = await res.json();
        showCourseSelection = false;
      } else if (res.status === 404) {
        // No active course - show selection
        await loadCourses();
        showCourseSelection = true;
      }
    } catch (err) {
      console.error('Failed to load active course:', err);
      await loadCourses();
      showCourseSelection = true;
    } finally {
      isLoading = false;
    }
  }

  async function loadCourses() {
    try {
      const res = await fetch('/api/learning/courses');
      courses = (await res.json()).courses;
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  }

  async function startCourse(courseId: string) {
    try {
      const res = await fetch('/api/learning/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (res.ok) {
        await loadActiveCourse();
      }
    } catch (err) {
      console.error('Failed to start course:', err);
    }
  }

  function markComplete() {
    // TODO: Mark day as complete, advance to next day
    console.log('Lesson complete');
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center p-12">
    <div class="text-cloud-400">Loading...</div>
  </div>
{:else if showCourseSelection}
  <!-- Course Selection -->
  <div class="p-6 space-y-6">
    <div class="text-center mb-8">
      <h3 class="text-2xl font-bold text-cloud-800 mb-2">Choose Your Learning Path</h3>
      <p class="text-cloud-600">30-day micro-learning curriculum with daily frameworks</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each courses as course}
        <button
          onclick={() => startCourse(course.id)}
          class="bg-white rounded-lg border-2 border-cloud-200 p-6 text-left hover:border-electric-500 transition-all hover:shadow-lg group"
        >
          <div class="flex items-start gap-4 mb-4">
            <span class="text-4xl">{course.icon}</span>
            <div class="flex-1">
              <h4 class="text-lg font-bold text-cloud-800 mb-1">{course.name}</h4>
              <p class="text-sm text-cloud-600">{course.description}</p>
              <p class="text-xs text-cloud-400 mt-2">{course.duration}</p>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <p class="text-xs font-semibold text-cloud-400 uppercase mb-2">Key Frameworks</p>
              <div class="flex flex-wrap gap-2">
                {#each course.frameworks as framework}
                  <span class="px-2 py-1 bg-cloud-50 text-cloud-600 text-xs rounded">{framework}</span>
                {/each}
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-cloud-100">
            <span class="text-sm font-medium text-electric-600 group-hover:text-electric-700">
              Start Course →
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
{:else if activeCourse}
  <!-- Daily Lesson -->
  <div class="p-6 space-y-6">
    <!-- Progress Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <span class="text-3xl">{activeCourse.courseIcon}</span>
        <div>
          <h3 class="text-xl font-bold text-cloud-800">{activeCourse.courseName}</h3>
          <p class="text-sm text-cloud-600">Day {activeCourse.currentDay} of {activeCourse.totalDays}</p>
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-cloud-400 uppercase mb-1">Progress</div>
        <div class="w-32 h-2 bg-cloud-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-electric-500 transition-all"
            style="width: {(activeCourse.currentDay / activeCourse.totalDays) * 100}%"
          ></div>
        </div>
      </div>
    </div>

    <!-- Lesson Content -->
    <div class="bg-white rounded-lg border border-cloud-200 p-6">
      <div class="mb-6">
        <div class="text-xs font-semibold text-electric-600 uppercase mb-2">Today's Framework</div>
        <h4 class="text-2xl font-bold text-cloud-800 mb-1">{activeCourse.lesson.title}</h4>
        <p class="text-sm text-cloud-600">{activeCourse.lesson.framework}</p>
      </div>

      <!-- Markdown Content -->
      <div class="prose prose-sm max-w-none mb-6">
        {@html activeCourse.lesson.content.split('\n').map(line => {
          if (line.startsWith('# ')) return `<h1 class="text-xl font-bold mt-6 mb-3">${line.slice(2)}</h1>`;
          if (line.startsWith('## ')) return `<h2 class="text-lg font-bold mt-5 mb-2">${line.slice(3)}</h2>`;
          if (line.startsWith('### ')) return `<h3 class="text-base font-semibold mt-4 mb-2">${line.slice(4)}</h3>`;
          if (line.startsWith('**') && line.endsWith('**')) return `<p class="font-semibold mt-3 mb-1">${line.slice(2, -2)}</p>`;
          if (line.startsWith('- ')) return `<li class="ml-4">${line.slice(2)}</li>`;
          if (line.startsWith('→ ')) return `<p class="ml-6 text-electric-600">${line.slice(2)}</p>`;
          if (line.trim() === '') return '<br/>';
          return `<p class="mb-2">${line}</p>`;
        }).join('\n')}
      </div>

      <!-- Key Takeaways -->
      <div class="bg-electric-50 border-l-4 border-electric-500 p-4 mb-6">
        <p class="text-xs font-semibold text-electric-700 uppercase mb-3">Key Takeaways</p>
        <ul class="space-y-2">
          {#each activeCourse.lesson.keyTakeaways as takeaway}
            <li class="flex items-start gap-2">
              <span class="text-electric-600 mt-0.5">✓</span>
              <span class="text-sm text-cloud-700">{takeaway}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Practice Exercise -->
      <div class="bg-cloud-50 rounded-lg p-4 mb-6">
        <p class="text-xs font-semibold text-cloud-700 uppercase mb-2">Practice Exercise</p>
        <p class="text-sm text-cloud-800">{activeCourse.lesson.practiceExercise}</p>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-4 border-t border-cloud-200">
        <div class="text-xs text-cloud-500">
          Next: {activeCourse.lesson.nextLesson}
        </div>
        <button
          onclick={markComplete}
          class="px-6 py-2 bg-electric-600 hover:bg-electric-700 text-white text-sm font-medium rounded transition-colors"
        >
          Mark Complete & Continue
        </button>
      </div>
    </div>
  </div>
{/if}
