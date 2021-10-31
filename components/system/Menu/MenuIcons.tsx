import { useTheme } from "styled-components";

type SvgProps = {
  className?: string;
};

export const ChevronRight = (props: SvgProps): JSX.Element => (
  <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.047 30.547L22.578 16 8.047 1.453 9.453.047 25.422 16 9.453 31.953l-1.406-1.406z" />
  </svg>
);

export const Checkmark = (props: SvgProps): JSX.Element => {
  const { colors } = useTheme();

  return (
    <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M28.703 8.703l-16.703 16.719-8.703-8.719 1.406-1.406 7.297 7.281 15.297-15.281z"
        stroke={colors.text}
        strokeWidth="2"
      />
    </svg>
  );
};
