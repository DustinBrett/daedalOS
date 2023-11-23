import { memo } from "react";

export const Down = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="m30.297 7.297 1.406 1.406L16 24.406.297 8.703l1.406-1.406L16 21.594z" />
  </svg>
));

export const Up = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M30.547 23.953 16 9.422 1.453 23.953.047 22.547 16 6.578l15.953 15.969z" />
  </svg>
));
