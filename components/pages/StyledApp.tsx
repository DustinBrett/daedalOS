import { type FeatureBundle, LazyMotion, MotionConfig } from "motion/react";
import { StyleSheetManager, ThemeProvider } from "styled-components";
import { useThemeName } from "contexts/session";
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
  const themeName = useThemeName();

  return (
    <StyleSheetManager enableVendorPrefixes>
      <ThemeProvider theme={themes[themeName] || themes[DEFAULT_THEME]}>
        <GlobalStyle />
        <LazyMotion features={motionFeatures} strict>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </StyleSheetManager>
  );
};

export default StyledApp;
