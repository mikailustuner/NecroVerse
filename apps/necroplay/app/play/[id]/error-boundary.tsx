"use client";

import { Component, ReactNode } from "react";
import { ErrorDisplay } from "@ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RuntimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("RuntimeErrorBoundary caught an error:", error, errorInfo);
    
    // Log error to Supabase if available
    if (typeof window !== "undefined" && (window as any).supabase) {
      (window as any).supabase
        .from("graveyard_logs")
        .insert({
          level: "error",
          message: error.message,
          context: {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
          },
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })
        .catch((err: any) => {
          console.error("Failed to log error to Supabase:", err);
        });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0a0612] flex items-center justify-center">
          <ErrorDisplay error={this.state.error} onRetry={this.handleRetry} />
        </div>
      );
    }

    return this.props.children;
  }
}

