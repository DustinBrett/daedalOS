import { Component } from "react";
import { isDev } from "utils/functions";

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

  public override shouldComponentUpdate(): boolean {
    return false;
  }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override render(): React.ReactNode {
    const {
      props: { children, FallbackRender },
      state: { hasError },
    } = this;

    if (hasError && !FallbackRender && !isDev()) {
      window.location.reload();
    }

    return hasError ? FallbackRender : children;
  }
}
