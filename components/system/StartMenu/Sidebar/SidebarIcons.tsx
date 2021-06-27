import { useTheme } from "styled-components";

export const AllApps = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M0 22v-6h6v6H0zm2-4v2h2v-2H2zm-2-4V8h6v6H0zm2-4v2h2v-2H2zM0 6V0h6v6H0zm2-4v2h2V2H2zm8 10v-2h18v2H10zm14 6v2H10v-2h14zM10 2h22v2H10V2zM0 30v-6h6v6H0zm2-4v2h2v-2H2zm8 2v-2h18v2H10z" />
  </svg>
);

export const SideMenu = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M32 10H0V8h32v2zm0 16H0v-2h32v2zm0-8.016H0V16h32v1.984z" />
  </svg>
);

export const Documents = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <path d="M28 8.578V32H2V0h17.422zM20 8h4.578L20 3.422V8zm6 22V10h-8V2H4v28h22z" />
  </svg>
);

export const Power = (): JSX.Element => {
  const { colors } = useTheme();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        stroke={colors.text}
        d="M17 16h-2V0h2v16zm3.313-11.312q2.156.688 3.945 2t3.063 3.078 1.977 3.875.703 4.359q0 1.938-.5 3.727t-1.414 3.344-2.188 2.828-2.828 2.188-3.344 1.414-3.727.5-3.727-.5-3.344-1.414-2.828-2.188-2.188-2.828-1.414-3.344-.5-3.727q0-2.25.703-4.359t1.977-3.875 3.063-3.078 3.945-2l.625 1.891q-1.859.609-3.391 1.734t-2.625 2.625-1.695 3.305-.602 3.758q0 1.656.43 3.188t1.211 2.867 1.875 2.43 2.43 1.875 2.867 1.211 3.188.43 3.188-.43 2.867-1.211 2.43-1.875 1.875-2.43 1.211-2.867.43-3.188q0-1.953-.602-3.758t-1.695-3.305-2.625-2.625-3.391-1.734z"
      />
    </svg>
  );
};
