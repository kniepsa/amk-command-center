/**
 * Transcription API Interface
 * AI-powered speech-to-text for voice input (OpenAI Whisper, etc.)
 *
 * USE CASES:
 * - Voice input for morning/evening reviews
 * - Quick task creation via voice
 * - Meeting notes transcription
 * - Lesson notes via voice
 */

import type { Result } from "./storage.api";

export type TranscriptionProvider =
  | "openai-whisper"
  | "local-whisper"
  | "google-speech"
  | "azure-speech";

export type AudioFormat = "webm" | "mp3" | "wav" | "m4a" | "ogg";

export interface TranscriptionRequest {
  audio: Blob | File; // Audio file to transcribe
  format?: AudioFormat; // Optional, usually detected automatically
  language?: string; // ISO 639-1 code (e.g., 'en', 'de')
  prompt?: string; // Optional context to improve accuracy
  temperature?: number; // 0-1, controls randomness (0 = deterministic)
}

export interface TranscriptionResult {
  id: string;
  text: string; // Transcribed text
  language: string; // Detected language
  duration: number; // Audio duration in seconds
  confidence?: number; // 0-1, transcription confidence
  segments?: TranscriptionSegment[]; // Word-level timestamps
  provider: TranscriptionProvider;
  created: string;
  processingTime: number; // Milliseconds
}

export interface TranscriptionSegment {
  id: number;
  start: number; // Start time in seconds
  end: number; // End time in seconds
  text: string;
  confidence?: number;
}

export interface TranscriptionConfig {
  provider: TranscriptionProvider;
  apiKey?: string;
  model?: string; // e.g., 'whisper-1', 'base', 'small', 'medium', 'large'
  defaultLanguage?: string;
  autoDetectLanguage?: boolean;
  enablePunctuation?: boolean;
  enableTimestamps?: boolean;
  maxFileSizeMB?: number;
  timeout?: number; // Milliseconds
}

export interface StreamingTranscriptionOptions {
  onPartialResult?: (text: string) => void; // Real-time partial results
  onFinal?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
  language?: string;
}

export interface TranscriptionStats {
  totalTranscriptions: number;
  totalDuration: number; // Total audio hours transcribed
  averageConfidence: number;
  averageProcessingTime: number; // Milliseconds
  costEstimate?: number; // USD
  byProvider: Record<TranscriptionProvider, number>;
}

export interface TranscriptionAPI {
  // ===== Configuration =====

  /**
   * Get current transcription configuration
   */
  getConfig(): Promise<Result<TranscriptionConfig>>;

  /**
   * Update transcription configuration
   */
  updateConfig(
    config: Partial<TranscriptionConfig>,
  ): Promise<Result<TranscriptionConfig>>;

  /**
   * Test provider connection and API key
   */
  testConnection(provider?: TranscriptionProvider): Promise<Result<boolean>>;

  // ===== Transcription =====

  /**
   * Transcribe audio file
   */
  transcribe(
    request: TranscriptionRequest,
  ): Promise<Result<TranscriptionResult>>;

  /**
   * Transcribe audio with real-time streaming
   */
  transcribeStream(
    audioStream: MediaStream,
    options?: StreamingTranscriptionOptions,
  ): Promise<Result<TranscriptionResult>>;

  /**
   * Transcribe from URL
   */
  transcribeFromUrl(
    url: string,
    options?: Partial<TranscriptionRequest>,
  ): Promise<Result<TranscriptionResult>>;

  /**
   * Batch transcribe multiple files
   */
  batchTranscribe(
    requests: TranscriptionRequest[],
  ): Promise<Result<TranscriptionResult[]>>;

  // ===== History & Management =====

  /**
   * Get transcription history
   */
  getHistory(limit?: number): Promise<Result<TranscriptionResult[]>>;

  /**
   * Get transcription by ID
   */
  getTranscription(id: string): Promise<Result<TranscriptionResult | null>>;

  /**
   * Delete transcription
   */
  deleteTranscription(id: string): Promise<Result<void>>;

  /**
   * Clear all transcription history
   */
  clearHistory(): Promise<Result<void>>;

  // ===== Utilities =====

  /**
   * Validate audio file (format, size, duration)
   */
  validateAudio(
    file: File,
  ): Promise<Result<{ valid: boolean; error?: string }>>;

  /**
   * Get supported audio formats
   */
  getSupportedFormats(): Promise<Result<AudioFormat[]>>;

  /**
   * Estimate transcription cost
   */
  estimateCost(
    durationSeconds: number,
    provider?: TranscriptionProvider,
  ): Promise<Result<number>>;

  // ===== Smart Features =====

  /**
   * Extract structured data from transcription
   * (e.g., extract tasks, gratitude, food items from voice input)
   */
  extractStructuredData(
    transcription: string,
    dataType: "tasks" | "gratitude" | "food" | "habits" | "custom",
  ): Promise<Result<Record<string, unknown>>>;

  /**
   * Summarize long transcription
   */
  summarize(transcription: string, maxLength?: number): Promise<Result<string>>;

  /**
   * Translate transcription to another language
   */
  translate(
    transcription: string,
    targetLanguage: string,
  ): Promise<Result<string>>;

  // ===== Analytics =====

  /**
   * Get transcription statistics
   */
  getStats(): Promise<Result<TranscriptionStats>>;
}
