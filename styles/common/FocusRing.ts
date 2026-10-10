import { css } from "styled-components";

// Like the Windows 10 focus visual, an outer & inner rectangle of contrasting
// colors, inset so clipping containers can't hide it
const FocusRing = css`
  box-shadow: inset 0 0 0 3px var(--focus-inner, rgb(0 0 0));
  outline: 2px solid var(--focus-outer, rgb(255 255 255));
  outline-offset: -2px;
`;

export default FocusRing;
