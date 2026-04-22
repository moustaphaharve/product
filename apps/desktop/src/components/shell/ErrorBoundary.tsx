import React from "react";
import { Button } from "@product/ui";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-bg-primary">
          <div className="max-w-md text-center flex flex-col items-center gap-3 p-6 rounded-xl border border-border-primary/50 bg-bg-secondary">
            <div className="text-lg">Something went wrong.</div>
            <div className="text-sm text-text-secondary font-mono">
              {this.state.error?.message ?? "Unknown error"}
            </div>
            <Button
              variant="primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Reload view
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
