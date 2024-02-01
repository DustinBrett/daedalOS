import { css } from "styled-components";
import { THIN_SCROLLBAR_WIDTH } from "utils/constants";

export const ThinScrollBars = css`
  @supports not selector(::-webkit-scrollbar) {
    scrollbar-width: thin;
  }

  &::-webkit-scrollbar {
    width: ${THIN_SCROLLBAR_WIDTH}px;
  }
`;
