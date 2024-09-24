/* eslint-disable import/no-extraneous-dependencies */
import { type AppProps } from "next/app";
import { ErrorBoundary } from "components/pages/ErrorBoundary";
import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import { ViewportProvider } from "contexts/viewport";
// eslint-disable-next-line import/order
import { ChakraProvider } from "@chakra-ui/react";
import "styles/global.css"

const App = ({ Component, pageProps }: AppProps): React.ReactElement => (
  <ChakraProvider>
    <ViewportProvider>
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
    </ViewportProvider>
  </ChakraProvider>
);

export default App;
