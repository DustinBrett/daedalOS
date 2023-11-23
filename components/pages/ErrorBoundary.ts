import { Component } from "react";

type ErrorBoundaryProps = {
  FallbackRender?: React.ReactNode;
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
      props: { children, FallbackRender },
      state: { hasError },
    } = this;

    if (hasError && !FallbackRender && !("__nextDevClientId" in window)) {
      window.location.reload();
    }

    return hasError ? FallbackRender : children;
  }
}
