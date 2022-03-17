import Metadata from "components/pages/Metadata";
import StyledApp from "components/pages/StyledApp";
import { FileSystemProvider } from "contexts/fileSystem";
import { MenuProvider } from "contexts/menu";
import { ProcessProvider } from "contexts/process";
import { SessionProvider } from "contexts/session";
import type {
  AppContext,
  AppInitialProps,
  AppProps as NextAppProps,
} from "next/app";
import NextApp from "next/app";
import { DESKTOP_PATH, SHORTCUT_ICON } from "utils/constants";
import { getPublicDirectoryIcons } from "utils/functions";

export type AppProps = {
  preloadIcons: string[];
};

const App = ({
  Component,
  pageProps,
  preloadIcons,
}: AppProps & NextAppProps): React.ReactElement => (
  <ProcessProvider>
    <FileSystemProvider>
      <SessionProvider>
        <StyledApp>
          <Metadata preloadIcons={preloadIcons} />
          <MenuProvider>
            <Component {...pageProps} />
          </MenuProvider>
        </StyledApp>
      </SessionProvider>
    </FileSystemProvider>
  </ProcessProvider>
);

App.getInitialProps = async (
  appContext: AppContext
): Promise<AppInitialProps & AppProps> => ({
  ...(await NextApp.getInitialProps(appContext)),
  preloadIcons: [
    SHORTCUT_ICON,
    ...(await getPublicDirectoryIcons(DESKTOP_PATH)),
  ],
});

export default App;
