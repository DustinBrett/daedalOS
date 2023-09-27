import contextFactory from "contexts/contextFactory";
import useViewportContextState from "contexts/viewport/useViewportContextState";

const { Provider, useContext } = contextFactory(useViewportContextState);

export { Provider as ViewportProvider, useContext as useViewport };
