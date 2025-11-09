/**
 * Structured error logging utility
 * Logs errors to Supabase graveyard_logs table
 */

export interface LogEntry {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  context?: Record<string, any>;
  stack?: string;
  timestamp: Date;
}

export class Logger {
  private static logs: LogEntry[] = [];
  private static supabaseClient: any = null;
  private static fileId: string | null = null;

  /**
   * Initialize logger with Supabase client
   */
  static init(supabaseClient: any, fileId?: string): void {
    this.supabaseClient = supabaseClient;
    this.fileId = fileId || null;
  }

  /**
   * Log an error
   */
  static error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level: "error",
      message,
      context: {
        ...context,
        errorName: error?.name,
        errorMessage: error?.message,
      },
      stack: error?.stack,
      timestamp: new Date(),
    };

    this.logs.push(entry);
    console.error(`[Logger] ${message}`, error, context);

    // Log to Supabase if available
    this.logToSupabase(entry);
  }

  /**
   * Log a warning
   */
  static warn(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level: "warn",
      message,
      context,
      timestamp: new Date(),
    };

    this.logs.push(entry);
    console.warn(`[Logger] ${message}`, context);

    // Log to Supabase if available
    this.logToSupabase(entry);
  }

  /**
   * Log an info message
   */
  static info(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level: "info",
      message,
      context,
      timestamp: new Date(),
    };

    this.logs.push(entry);
    console.log(`[Logger] ${message}`, context);

    // Log to Supabase if available
    this.logToSupabase(entry);
  }

  /**
   * Log a debug message
   */
  static debug(message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level: "debug",
      message,
      context,
      timestamp: new Date(),
    };

    this.logs.push(entry);
    if (process.env.NODE_ENV === "development") {
      console.debug(`[Logger] ${message}`, context);
    }
  }

  /**
   * Get all logs
   */
  static getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  static clear(): void {
    this.logs = [];
  }

  /**
   * Log to Supabase
   */
  private static async logToSupabase(entry: LogEntry): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      const { error } = await this.supabaseClient.from("graveyard_logs").insert({
        file_id: this.fileId,
        level: entry.level,
        message: entry.message,
        context: entry.context || {},
        stack: entry.stack || null,
        timestamp: entry.timestamp.toISOString(),
      });

      if (error) {
        console.error("Failed to log to Supabase:", error);
      }
    } catch (error) {
      console.error("Error logging to Supabase:", error);
    }
  }
}

