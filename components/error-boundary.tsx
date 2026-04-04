"use client";

import React from "react";

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    let message = "Unexpected error";
    if (typeof error === "object" && error !== null && "message" in error) {
      const m = (error as { message?: unknown }).message;
      message = typeof m === "string" ? m : "Unexpected error";
    }
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    if (typeof window !== "undefined") {
      const w = window as unknown as { __onwyndAddToast?: (t: { message: string; variant?: "error"; duration?: number }) => void };
      if (typeof w.__onwyndAddToast === "function") {
        w.__onwyndAddToast({ message: "An error occurred: " + (this.state.message ?? ""), variant: "error", duration: 6000 });
      }
    }
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-lg border p-6 space-y-4">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-md border" onClick={() => location.reload()}>Reload</button>
              <button className="px-3 py-1.5 rounded-md border" onClick={() => this.setState({ hasError: false, message: undefined })}>Try Again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
