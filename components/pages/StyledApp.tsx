import { useSession } from "contexts/session";
import type { FeatureBundle } from "framer-motion";
import { LazyMotion } from "framer-motion";
import { memo } from "react";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import GlobalStyle from "styles/GlobalStyle";
import themes from "styles/themes";
import { DEFAULT_THEME } from "utils/constants";

const motionFeatures = async (): Promise<FeatureBundle> =>
  (
    await import(
      /* webpackMode: "eager" */
      "styles/motionFeatures"
    )
  ).default;

const StyledApp: FC = ({ children }) => {
  const { themeName } = useSession();

  return (
    <StyleSheetManager enableVendorPrefixes>
      <ThemeProvider theme={themes[themeName] || themes[DEFAULT_THEME]}>
        <GlobalStyle />
        <LazyMotion features={motionFeatures} strict>
          {children}
        </LazyMotion>
      </ThemeProvider>
    </StyleSheetManager>
  );
};

export default memo(StyledApp);
