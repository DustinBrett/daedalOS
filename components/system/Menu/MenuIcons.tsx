import { memo } from "react";
import { useTheme } from "styled-components";

type SvgProps = {
  className?: string;
};

export const ChevronRight = memo<SvgProps>(({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8.047 30.547L22.578 16 8.047 1.453 9.453.047 25.422 16 9.453 31.953l-1.406-1.406z" />
  </svg>
));

export const Checkmark = memo<SvgProps>(({ className }) => {
  const { colors } = useTheme();

  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28.703 8.703l-16.703 16.719-8.703-8.719 1.406-1.406 7.297 7.281 15.297-15.281z"
        stroke={colors.text}
        strokeWidth="2"
      />
    </svg>
  );
});

export const Circle = memo<SvgProps>(({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 10q1.234 0 2.328.469t1.914 1.289 1.289 1.914T22 16q0 1.25-.469 2.336t-1.289 1.906-1.914 1.289T16 22q-1.25 0-2.336-.469t-1.906-1.289-1.289-1.906T10 16q0-1.234.469-2.328t1.289-1.914 1.906-1.289T16 10z" />
  </svg>
));

export const Share = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 24l2-2v6h-24v-20h2v18h20v-2zM20 16q-2 0-3.914 0.398t-3.695 1.172-3.398 1.891-2.992 2.539v-2q0-1.938 0.5-3.727t1.414-3.344 2.188-2.828 2.828-2.188 3.344-1.414 3.727-0.5v-6l11 11-11 11v-6zM21.578 8q-0.875 0-1.641 0.016t-1.516 0.102-1.5 0.281-1.594 0.539q-1.359 0.563-2.523 1.438t-2.078 1.992-1.547 2.422-0.93 2.742q2.625-1.75 5.609-2.641t6.141-0.891h2v3.172l6.172-6.172-6.172-6.172v3.172h-0.422z" />
  </svg>
));
