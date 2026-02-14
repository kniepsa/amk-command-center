import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Skip auth for login endpoint and API routes
  if (
    event.url.pathname === "/login" ||
    event.url.pathname.startsWith("/api/")
  ) {
    return resolve(event);
  }

  // Check for session cookie
  const sessionCookie = event.cookies.get("session");

  // If no session cookie, try HTTP Basic Auth (for initial login)
  if (!sessionCookie) {
    const auth = event.request.headers.get("authorization");

    // If no auth header, redirect to login or return 401
    if (!auth) {
      // For browser requests (HTML), redirect to login page
      const acceptHeader = event.request.headers.get("accept") || "";
      if (acceptHeader.includes("text/html")) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/login",
          },
        });
      }

      // For API requests, return 401
      return new Response("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
        },
      });
    }

    // Parse the Basic auth credentials
    const [scheme, encoded] = auth.split(" ");

    if (scheme !== "Basic" || !encoded) {
      return new Response("Invalid authentication scheme", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
        },
      });
    }

    // Decode base64 credentials
    let credentials: string[];
    try {
      credentials = atob(encoded).split(":");
    } catch (error) {
      return new Response("Invalid credentials format", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
        },
      });
    }
    const [username, password] = credentials;

    // Get password from environment variable
    const correctPassword = process.env.PASSWORD || "changeme";

    // Verify password (username can be anything)
    if (password !== correctPassword) {
      return new Response("Invalid credentials", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Command Center - Private Access"',
        },
      });
    }

    // Authentication successful - set session cookie
    const response = await resolve(event);
    response.headers.set(
      "Set-Cookie",
      "session=authenticated; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400",
    );
    return response;
  }

  // Session cookie exists - validate it
  if (sessionCookie === "authenticated") {
    return resolve(event);
  }

  // Invalid session - redirect to login
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
    },
  });
};
