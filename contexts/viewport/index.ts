import contextFactory from "contexts/contextFactory";
import useViewportContextState from "contexts/viewport/useViewportContextState";

const { Provider, useContext } = contextFactory(useViewportContextState);

export { useContext as useViewport, Provider as ViewportProvider };
