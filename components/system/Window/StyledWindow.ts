import { m as motion } from "motion/react";
import styled from "styled-components";
import StyledLoading from "components/system/Apps/StyledLoading";

type StyledWindowProps = {
  $backgroundBlur?: string;
  $backgroundColor?: string;
  $isForeground: boolean;
  $isLightBg?: boolean;
};

const StyledWindow = styled(motion.section)<StyledWindowProps>`
  background-color: ${({ $backgroundColor, theme }) =>
    $backgroundColor || theme.colors.window.background};
  box-shadow: ${({ $isForeground, theme }) =>
    $isForeground
      ? theme.colors.window.shadow
      : theme.colors.window.shadowInactive};
  contain: strict;
  height: 100%;
  outline: ${({ $isForeground, theme }) =>
    `${theme.sizes.window.outline} solid ${
      $isForeground
        ? theme.colors.window.outline
        : theme.colors.window.outlineInactive
    }`};
  overflow: hidden;
  position: absolute;
  width: 100%;

  /* Like the Windows light theme, focus visuals invert on light content */
  ${({ $isLightBg }) =>
    $isLightBg &&
    `> div > :not(header) {
      --focus-inner: rgb(255 255 255);
      --focus-outer: rgb(0 0 0);
    }`}

  header + * {
    height: ${({ theme }) => `calc(100% - ${theme.sizes.titleBar.height}px)`};
  }

  ${StyledLoading} {
    backdrop-filter: ${({ $backgroundBlur }) =>
      $backgroundBlur ? `blur(${$backgroundBlur})` : undefined};
  }
`;

export default StyledWindow;
