import { memo } from "react";

export const MinimizeIcon = memo(() => (
  <svg viewBox="0 0 10 1" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0h10v1H0z" />
  </svg>
));

export const MaximizeIcon = memo(() => (
  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0v10h10V0H0zm1 1h8v8H1V1z" />
  </svg>
));

export const MaximizedIcon = memo(() => (
  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.1 0v2H0v8.1h8.2v-2h2V0H2.1zm5.1 9.2H1.1V3h6.1v6.2zm2-2.1h-1V2H3.1V1h6.1v6.1z" />
  </svg>
));

export const CloseIcon = memo(() => (
  <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.2.7L9.5 0 5.1 4.4.7 0 0 .7l4.4 4.4L0 9.5l.7.7 4.4-4.4 4.4 4.4.7-.7-4.4-4.4z" />
  </svg>
));
