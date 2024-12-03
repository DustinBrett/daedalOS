import { memo, useMemo } from "react";

export const Back = memo(() => (
  <svg viewBox="-8 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" />
  </svg>
));

export const Forward = memo(() => (
  <svg viewBox="8 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18l6-6-6-6" />
  </svg>
));

export const Refresh = memo(() => (
  <svg
    className="refresh"
    viewBox="-10 -13 52 52"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2l9 4.9V17L12 22l-9-4.9V7z" />
  </svg>
));

export const GoTo = memo(() => (
  <svg className="go-to" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M31.906 16 17.203 30.703l-1.406-1.406L28.094 17H0v-2h28.094L15.797 2.703l1.406-1.406z" />
  </svg>
));

type DownProps = { flip?: boolean };

export const Down = memo<DownProps>(({ flip }) => {
  const style = useMemo(
    () =>
      flip ? { transform: "scaleY(-1)", transition: "all 0.2s" } : undefined,
    [flip]
  );

  return (
    <svg style={style} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
});

export const Up = memo(() => {
  const style = useMemo(() => ({ marginTop: "-1px" }), []);

  return (
    <svg style={style} viewBox="0 -7 32 32" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/>
    </svg>
  );
});

export const Search = memo(() => (
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 0q1.516 0 2.922.391T26.547 1.5t2.227 1.727 1.727 2.227 1.109 2.625.391 2.922-.391 2.922-1.109 2.625-1.727 2.227-2.227 1.727-2.625 1.109-2.922.391q-1.953 0-3.742-.656t-3.289-1.891L1.703 31.705q-.297.297-.703.297t-.703-.297T0 31.002t.297-.703l12.25-12.266q-1.234-1.5-1.891-3.289T10 11.002q0-1.516.391-2.922T11.5 5.455t1.727-2.227 2.227-1.727T18.079.392t2.922-.391zm0 20q1.859 0 3.5-.711t2.859-1.93 1.93-2.859T30 11t-.711-3.5-1.93-2.859-2.859-1.93T21 2t-3.5.711-2.859 1.93-1.93 2.859T12 11t.711 3.5 1.93 2.859 2.859 1.93T21 20z" />
  </svg>
));
