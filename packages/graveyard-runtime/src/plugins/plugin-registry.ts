/**
 * Plugin Registry
 * Manages plugin registration and discovery
 */

import { Plugin, PluginMetadata, PluginContext } from "./plugin-api";
import { File, ConversionResult } from "../types";

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  /**
   * Register a plugin
   */
  async register(plugin: Plugin): Promise<void> {
    const { id } = plugin.metadata;
    
    if (this.plugins.has(id)) {
      throw new Error(`Plugin ${id} is already registered`);
    }

    // Initialize plugin
    if (plugin.initialize) {
      await plugin.initialize(this.context);
    }

    this.plugins.set(id, plugin);
    this.context.logger.info(`Plugin registered: ${plugin.metadata.name} v${plugin.metadata.version}`);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Dispose plugin
    if (plugin.dispose) {
      await plugin.dispose();
    }

    this.plugins.delete(pluginId);
    this.context.logger.info(`Plugin unregistered: ${pluginId}`);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins
   */
  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins that support a format
   */
  getPluginsForFormat(format: string): Plugin[] {
    return Array.from(this.plugins.values()).filter((plugin) =>
      plugin.metadata.supportedFormats.includes(format)
    );
  }

  /**
   * Get plugins that can export to a format
   */
  getPluginsForExport(format: string): Plugin[] {
    return Array.from(this.plugins.values()).filter((plugin) =>
      plugin.metadata.outputFormats.includes(format)
    );
  }

  /**
   * Convert file using appropriate plugin
   */
  async convertFile(file: File, options?: any): Promise<ConversionResult> {
    const format = this.detectFormat(file.name);
    const plugins = this.getPluginsForFormat(format);

    if (plugins.length === 0) {
      return {
        success: false,
        metadata: {
          name: file.name,
          type: format,
          size: file.size,
          converted: false,
        },
        error: `No plugin found for format: ${format}`,
      };
    }

    // Try plugins in order
    for (const plugin of plugins) {
      if (plugin.convert) {
        try {
          const result = await plugin.convert(file, options);
          if (result.success) {
            return result;
          }
        } catch (error) {
          this.context.logger.error(`Plugin ${plugin.metadata.id} failed:`, error);
        }
      }
    }

    return {
      success: false,
      metadata: {
        name: file.name,
        type: format,
        size: file.size,
        converted: false,
      },
      error: "All plugins failed to convert file",
    };
  }

  /**
   * Export file using appropriate plugin
   */
  async exportFile(file: File, format: string, options?: any): Promise<ConversionResult> {
    const plugins = this.getPluginsForExport(format);

    if (plugins.length === 0) {
      return {
        success: false,
        metadata: {
          name: file.name,
          type: format,
          size: file.size,
          converted: false,
        },
        error: `No plugin found for export format: ${format}`,
      };
    }

    // Try plugins in order
    for (const plugin of plugins) {
      if (plugin.export) {
        try {
          const result = await plugin.export(file, format, options);
          if (result.success) {
            return result;
          }
        } catch (error) {
          this.context.logger.error(`Plugin ${plugin.metadata.id} failed:`, error);
        }
      }
    }

    return {
      success: false,
      metadata: {
        name: file.name,
        type: format,
        size: file.size,
        converted: false,
      },
      error: "All plugins failed to export file",
    };
  }

  /**
   * Detect file format from filename
   */
  private detectFormat(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return ext;
  }

  /**
   * Load plugin from URL
   */
  async loadPlugin(url: string): Promise<Plugin> {
    // In a full implementation, this would:
    // 1. Fetch the plugin script from URL
    // 2. Execute it in a sandboxed environment
    // 3. Extract the plugin instance
    // 4. Validate the plugin
    
    throw new Error("loadPlugin() not yet implemented");
  }

  /**
   * Load plugin from module
   */
  async loadPluginFromModule(module: any): Promise<Plugin> {
    // Extract plugin from module
    const plugin = module.default || module.plugin || module;
    
    if (!plugin || typeof plugin !== "object") {
      throw new Error("Invalid plugin module");
    }

    if (!plugin.metadata) {
      throw new Error("Plugin missing metadata");
    }

    return plugin;
  }

  /**
   * Get plugin metadata
   */
  getPluginMetadata(pluginId: string): PluginMetadata | undefined {
    const plugin = this.plugins.get(pluginId);
    return plugin?.metadata;
  }

  /**
   * List all registered plugins
   */
  listPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }
}

