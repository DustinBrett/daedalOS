import type React from "react";
import { Component } from "react";

type ErrorBoundaryProps = {
  reloadOnError?: boolean;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  React.PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  public constructor(props: React.PropsWithChildren<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  public shouldComponentUpdate(): boolean {
    return false;
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public render(): React.ReactNode {
    const {
      props: { children, reloadOnError },
      state: { hasError },
    } = this;

    if (hasError && reloadOnError) {
      window.location.reload();
    }

    // eslint-disable-next-line unicorn/no-null
    return hasError ? null : children;
  }
}
