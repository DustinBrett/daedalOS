import { css } from "styled-components";

// Still read by assistive technology, without taking up any space
const VisuallyHidden = css`
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export default VisuallyHidden;
