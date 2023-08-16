import useViewportContextState from "contexts/viewport/useViewportContextState";
import contextFactory from "contexts/contextFactory";

const { Provider, useContext } = contextFactory(useViewportContextState);

export { Provider as ViewportProvider, useContext as useViewport };
