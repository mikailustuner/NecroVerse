/**
 * Network utilities for ActionScript loadVariables, loadMovie, etc.
 */

export interface HTTPRequest {
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  data?: string | FormData | URLSearchParams;
  timeout?: number;
}

export interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
}

/**
 * HTTP client for ActionScript network operations
 */
export class NetworkClient {
  /**
   * Load variables from URL (ActionScript loadVariables)
   */
  async loadVariables(url: string, target?: any, method: "GET" | "POST" = "GET"): Promise<Record<string, string>> {
    try {
      const response = await this.request({
        url,
        method,
      });

      // Parse URL-encoded data
      const variables: Record<string, string> = {};
      const pairs = response.data.split("&");
      
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key) {
          variables[decodeURIComponent(key)] = decodeURIComponent(value || "");
        }
      }

      // Set variables in target object
      if (target && typeof target === "object") {
        Object.assign(target, variables);
      }

      return variables;
    } catch (error) {
      console.error("Failed to load variables:", error);
      return {};
    }
  }

  /**
   * Load movie from URL (ActionScript loadMovie)
   */
  async loadMovie(url: string, target?: any): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // If target is provided, it would typically be a movie clip
      // For now, we just return the data
      return arrayBuffer;
    } catch (error) {
      console.error("Failed to load movie:", error);
      return null;
    }
  }

  /**
   * Make HTTP request
   */
  async request(config: HTTPRequest): Promise<HTTPResponse> {
    const controller = new AbortController();
    const timeoutId = config.timeout
      ? setTimeout(() => controller.abort(), config.timeout)
      : null;

    try {
      const response = await fetch(config.url, {
        method: config.method || "GET",
        headers: config.headers || {},
        body: config.data,
        signal: controller.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const data = await response.text();

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        data,
      };
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      throw error;
    }
  }

  /**
   * Download file
   */
  async downloadFile(url: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || url.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download file:", error);
      throw error;
    }
  }

  /**
   * Upload file
   */
  async uploadFile(url: string, file: File | Blob, fieldName: string = "file"): Promise<HTTPResponse> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      return await this.request({
        url,
        method: "POST",
        data: formData,
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
      throw error;
    }
  }
}

/**
 * Cookie management
 */
export class CookieManager {
  /**
   * Set cookie
   */
  setCookie(name: string, value: string, days?: number, path: string = "/"): void {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value}${expires}; path=${path}`;
  }

  /**
   * Get cookie
   */
  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    
    return null;
  }

  /**
   * Delete cookie
   */
  deleteCookie(name: string, path: string = "/"): void {
    this.setCookie(name, "", -1, path);
  }

  /**
   * Get all cookies
   */
  getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieStrings = document.cookie.split(";");
    
    for (const cookieString of cookieStrings) {
      const [name, value] = cookieString.trim().split("=");
      if (name) {
        cookies[name] = decodeURIComponent(value || "");
      }
    }
    
    return cookies;
  }
}

