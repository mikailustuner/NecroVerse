import { Window } from '@amiron/intuition';

export type ApplicationFactory = () => Window;

/**
 * Lazy loader for application modules using dynamic imports.
 * Applications are only loaded when first launched, reducing initial bundle size.
 */
export class ApplicationLoader {
  private loadedModules: Map<string, ApplicationFactory> = new Map();
  private loadingPromises: Map<string, Promise<ApplicationFactory>> = new Map();
  
  /**
   * Register an application with lazy loading
   * @param id Application identifier
   * @param importFn Dynamic import function that returns the application module
   */
  register(id: string, importFn: () => Promise<{ default: ApplicationFactory }>): void {
    // Store the import function, but don't execute it yet
    this.loadingPromises.set(id, 
      importFn().then(module => {
        const factory = module.default;
        this.loadedModules.set(id, factory);
        this.loadingPromises.delete(id);
        return factory;
      })
    );
  }
  
  /**
   * Register a pre-loaded application (no lazy loading)
   */
  registerSync(id: string, factory: ApplicationFactory): void {
    this.loadedModules.set(id, factory);
  }
  
  /**
   * Launch an application by ID
   * @returns Promise that resolves to the application window
   */
  async launch(id: string): Promise<Window | null> {
    // Check if already loaded
    const loaded = this.loadedModules.get(id);
    if (loaded) {
      return loaded();
    }
    
    // Check if currently loading
    const loading = this.loadingPromises.get(id);
    if (loading) {
      const factory = await loading;
      return factory();
    }
    
    console.warn(`Application not registered: ${id}`);
    return null;
  }
  
  /**
   * Preload an application without launching it
   */
  async preload(id: string): Promise<void> {
    if (this.loadedModules.has(id)) {
      return; // Already loaded
    }
    
    const loading = this.loadingPromises.get(id);
    if (loading) {
      await loading;
    }
  }
  
  /**
   * Preload multiple applications in parallel
   */
  async preloadMultiple(ids: string[]): Promise<void> {
    await Promise.all(ids.map(id => this.preload(id)));
  }
  
  /**
   * Check if an application is loaded
   */
  isLoaded(id: string): boolean {
    return this.loadedModules.has(id);
  }
  
  /**
   * Check if an application is currently loading
   */
  isLoading(id: string): boolean {
    return this.loadingPromises.has(id);
  }
  
  /**
   * Get list of all registered application IDs
   */
  getRegisteredApps(): string[] {
    const loaded = Array.from(this.loadedModules.keys());
    const loading = Array.from(this.loadingPromises.keys());
    return [...new Set([...loaded, ...loading])];
  }
  
  /**
   * Unload an application to free memory
   */
  unload(id: string): void {
    this.loadedModules.delete(id);
  }
}

// Global application loader instance
export const globalAppLoader = new ApplicationLoader();
