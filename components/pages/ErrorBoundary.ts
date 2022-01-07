import { Component } from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public render(): React.ReactNode {
    const { hasError } = this.state;

    if (hasError && !("__REACT_DEVTOOLS_GLOBAL_HOOK__" in window)) {
      window.location.reload();

      return undefined;
    }

    const { children } = this.props;

    return children;
  }
}
