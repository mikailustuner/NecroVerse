/**
 * Example Plugin
 * Demonstrates how to create a custom converter plugin
 */

import { BasePlugin, PluginMetadata, PluginContext } from "../plugin-api";
import { File, ConversionResult } from "../../types";

export class ExamplePlugin extends BasePlugin {
  metadata: PluginMetadata = {
    id: "example-plugin",
    name: "Example Plugin",
    version: "1.0.0",
    description: "An example plugin for demonstration",
    author: "Necroverse Team",
    supportedFormats: ["example"],
    outputFormats: ["example-output"],
  };

  async initialize(context: PluginContext): Promise<void> {
    await super.initialize(context);
    this.context?.logger.info("Example plugin initialized");
  }

  async convert(file: File, options?: any): Promise<ConversionResult> {
    this.context?.logger.info(`Converting file: ${file.name}`);

    // Example conversion logic
    try {
      const arrayBuffer = await file.arrayBuffer();

      return {
        success: true,
        metadata: {
          name: file.name,
          type: "example-output",
          size: file.size,
          converted: true,
          conversionUrl: "",
        },
        outputUrl: "",
      };
    } catch (error) {
      return {
        success: false,
        metadata: {
          name: file.name,
          type: "example",
          size: file.size,
          converted: false,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async export(file: File, format: string, options?: any): Promise<ConversionResult> {
    this.context?.logger.info(`Exporting file: ${file.name} to ${format}`);

    // Example export logic
    return this.convert(file, options);
  }

  async validate(file: File): Promise<boolean> {
    // Example validation
    return file.name.endsWith(".example");
  }

  async dispose(): Promise<void> {
    this.context?.logger.info("Example plugin disposed");
  }
}

