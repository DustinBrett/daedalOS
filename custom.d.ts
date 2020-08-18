const { FC, SVGAttributes } = import('react');

declare module '*.svg' {
  const content: FC<SVGAttributes<SVGElement>>;
  export default content;
}
