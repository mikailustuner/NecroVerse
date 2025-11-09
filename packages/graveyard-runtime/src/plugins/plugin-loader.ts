/**
 * Plugin Loader
 * Handles dynamic loading of plugins
 */

import { Plugin, BasePlugin } from "./plugin-api";
import { PluginRegistry } from "./plugin-registry";

export interface PluginLoaderOptions {
  sandbox?: boolean;
  timeout?: number;
  validate?: boolean;
}

export class PluginLoader {
  private registry: PluginRegistry;
  private loadedPlugins: Map<string, string> = new Map(); // pluginId -> source URL

  constructor(registry: PluginRegistry) {
    this.registry = registry;
  }

  /**
   * Load plugin from URL
   */
  async loadFromURL(url: string, options: PluginLoaderOptions = {}): Promise<Plugin> {
    const { timeout = 30000, validate = true } = options;

    try {
      // Fetch plugin script
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.statusText}`);
      }

      const script = await response.text();

      // Execute plugin script in sandbox
      const plugin = await this.executePluginScript(script, options);

      // Validate plugin
      if (validate) {
        this.validatePlugin(plugin);
      }

      // Register plugin
      await this.registry.register(plugin);

      // Track loaded plugin
      this.loadedPlugins.set(plugin.metadata.id, url);

      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load plugin from module
   */
  async loadFromModule(module: any, options: PluginLoaderOptions = {}): Promise<Plugin> {
    const { validate = true } = options;

    try {
      // Extract plugin from module
      const plugin = module.default || module.plugin || module;

      if (!plugin || typeof plugin !== "object") {
        throw new Error("Invalid plugin module");
      }

      // Validate plugin
      if (validate) {
        this.validatePlugin(plugin);
      }

      // Register plugin
      await this.registry.register(plugin);

      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from module: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load plugin from file
   */
  async loadFromFile(file: File, options: PluginLoaderOptions = {}): Promise<Plugin> {
    const { timeout = 30000, validate = true } = options;

    try {
      // Read file content
      const text = await file.text();

      // Execute plugin script
      const plugin = await this.executePluginScript(text, options);

      // Validate plugin
      if (validate) {
        this.validatePlugin(plugin);
      }

      // Register plugin
      await this.registry.register(plugin);

      // Track loaded plugin
      this.loadedPlugins.set(plugin.metadata.id, file.name);

      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin from file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute plugin script
   */
  private async executePluginScript(script: string, options: PluginLoaderOptions): Promise<Plugin> {
    const { sandbox = true, timeout = 30000 } = options;

    if (sandbox) {
      // In a full implementation, this would execute the script in a sandboxed environment
      // For now, we'll use a simplified approach with eval (not recommended for production)
      // In production, use a proper sandboxing solution like VM2 or similar
      
      // Create a safe execution context
      const context = {
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Promise,
        Error,
        TypeError,
        ReferenceError,
        // Add other safe globals as needed
      };

      // Execute script in context
      const func = new Function(...Object.keys(context), script);
      const result = func(...Object.values(context));

      // Extract plugin
      if (result && typeof result === "object" && "metadata" in result) {
        return result as Plugin;
      }

      throw new Error("Plugin script did not return a valid plugin");
    } else {
      // Direct execution (not recommended)
      const result = eval(script);
      if (result && typeof result === "object" && "metadata" in result) {
        return result as Plugin;
      }
      throw new Error("Plugin script did not return a valid plugin");
    }
  }

  /**
   * Validate plugin
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.metadata) {
      throw new Error("Plugin missing metadata");
    }

    const { id, name, version, supportedFormats, outputFormats } = plugin.metadata;

    if (!id || typeof id !== "string") {
      throw new Error("Plugin metadata missing or invalid 'id'");
    }

    if (!name || typeof name !== "string") {
      throw new Error("Plugin metadata missing or invalid 'name'");
    }

    if (!version || typeof version !== "string") {
      throw new Error("Plugin metadata missing or invalid 'version'");
    }

    if (!Array.isArray(supportedFormats)) {
      throw new Error("Plugin metadata missing or invalid 'supportedFormats'");
    }

    if (!Array.isArray(outputFormats)) {
      throw new Error("Plugin metadata missing or invalid 'outputFormats'");
    }

    // Check for required methods
    if (!plugin.convert && !plugin.export) {
      throw new Error("Plugin must implement at least one of: convert(), export()");
    }
  }

  /**
   * Unload plugin
   */
  async unload(pluginId: string): Promise<void> {
    await this.registry.unregister(pluginId);
    this.loadedPlugins.delete(pluginId);
  }

  /**
   * Get loaded plugin source
   */
  getPluginSource(pluginId: string): string | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * List all loaded plugins
   */
  listLoadedPlugins(): Array<{ id: string; source: string }> {
    return Array.from(this.loadedPlugins.entries()).map(([id, source]) => ({
      id,
      source,
    }));
  }
}

