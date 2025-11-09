/**
 * Plugin API
 * Defines the interface for custom converter plugins
 */

import { File, ConversionResult, FileMetadata } from "../types";

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  supportedFormats: string[];
  outputFormats: string[];
}

/**
 * Plugin context
 */
export interface PluginContext {
  logger: {
    info: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    error: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
}

/**
 * Plugin interface
 */
export interface Plugin {
  /**
   * Plugin metadata
   */
  metadata: PluginMetadata;

  /**
   * Initialize plugin
   */
  initialize?(context: PluginContext): Promise<void>;

  /**
   * Convert file
   */
  convert?(file: File, options?: any): Promise<ConversionResult>;

  /**
   * Export file to format
   */
  export?(file: File, format: string, options?: any): Promise<ConversionResult>;

  /**
   * Validate file
   */
  validate?(file: File): Promise<boolean>;

  /**
   * Cleanup plugin
   */
  dispose?(): Promise<void>;
}

/**
 * Base plugin class
 */
export abstract class BasePlugin implements Plugin {
  abstract metadata: PluginMetadata;
  protected context?: PluginContext;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
  }

  async convert(file: File, options?: any): Promise<ConversionResult> {
    throw new Error("convert() not implemented");
  }

  async export(file: File, format: string, options?: any): Promise<ConversionResult> {
    throw new Error("export() not implemented");
  }

  async validate(file: File): Promise<boolean> {
    return false;
  }

  async dispose(): Promise<void> {
    // Default: no cleanup needed
  }
}

