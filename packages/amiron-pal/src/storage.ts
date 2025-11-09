export interface FileEntry {
  name: string;
  type: 'file' | 'directory' | 'application';
  size: number;
  created: Date;
  modified: Date;
}

export interface FileSystem {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  listDir(path: string): Promise<FileEntry[]>;
  createDir(path: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

export class IndexedDBFileSystem implements FileSystem {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'amiron-fs';
  private readonly STORE_NAME = 'files';
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'path' });
        }
      };
    });
  }
  
  async readFile(path: string): Promise<Uint8Array> {
    if (!this.db) throw new Error('FileSystem not initialized');
    
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const request = store.get(path);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          reject(new Error(`File not found: ${path}`));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async writeFile(path: string, data: Uint8Array): Promise<void> {
    if (!this.db) throw new Error('FileSystem not initialized');
    
    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const request = store.put({
      path,
      data,
      modified: new Date(),
    });
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async listDir(path: string): Promise<FileEntry[]> {
    if (!this.db) throw new Error('FileSystem not initialized');
    
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result;
        const entries: FileEntry[] = results
          .filter((item: any) => item.path.startsWith(path))
          .map((item: any) => ({
            name: item.path.split('/').pop() || '',
            type: 'file' as const,
            size: item.data.length,
            created: new Date(item.modified),
            modified: new Date(item.modified),
          }));
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async createDir(path: string): Promise<void> {
    // IndexedDB doesn't need explicit directory creation
    return Promise.resolve();
  }
  
  async deleteFile(path: string): Promise<void> {
    if (!this.db) throw new Error('FileSystem not initialized');
    
    const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);
    const request = store.delete(path);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
