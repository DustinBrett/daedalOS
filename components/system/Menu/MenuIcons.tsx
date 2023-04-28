import { useTheme } from "styled-components";

type SvgProps = {
  className?: string;
};

export const ChevronRight: FC<SvgProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8.047 30.547L22.578 16 8.047 1.453 9.453.047 25.422 16 9.453 31.953l-1.406-1.406z" />
  </svg>
);

export const Checkmark: FC<SvgProps> = ({ className }) => {
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
};

export const Circle: FC<SvgProps> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 10q1.234 0 2.328.469t1.914 1.289 1.289 1.914T22 16q0 1.25-.469 2.336t-1.289 1.906-1.914 1.289T16 22q-1.25 0-2.336-.469t-1.906-1.289-1.289-1.906T10 16q0-1.234.469-2.328t1.289-1.914 1.906-1.289T16 10z" />
  </svg>
);
