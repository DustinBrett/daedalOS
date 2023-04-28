import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import type { AppProps } from "next/app";

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <ProcessProvider>
    <FileSystemProvider>
      <SessionProvider>
        <ErrorBoundary>
          <Metadata />
          <StyledApp>
            <MenuProvider>
              <Component {...pageProps} />
            </MenuProvider>
          </StyledApp>
        </ErrorBoundary>
      </SessionProvider>
    </FileSystemProvider>
  </ProcessProvider>
);

export default App;
