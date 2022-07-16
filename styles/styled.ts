import "styled-components";

import type colors from "styles/defaultTheme/colors";
import type formats from "styles/defaultTheme/formats";
import type sizes from "styles/defaultTheme/sizes";
import type StartButtonIcon from "styles/defaultTheme/StartButtonIcon";

declare module "styled-components" {
  export interface DefaultTheme {
    StartButtonIcon: typeof StartButtonIcon;
    colors: typeof colors;
    formats: typeof formats;
    sizes: typeof sizes;
  }
}
