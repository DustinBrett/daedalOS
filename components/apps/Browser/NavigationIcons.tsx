import { memo, useMemo } from "react";

type ArrowProps = {
  direction: "left" | "right";
};

export const Arrow = memo<ArrowProps>(({ direction }) => {
  const style = useMemo(
    () => (direction === "right" ? { transform: "scaleX(-1)" } : undefined),
    [direction]
  );

  return (
    <svg style={style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
});

export const Refresh = memo(() => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
));

export const Stop = memo(() => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
));
