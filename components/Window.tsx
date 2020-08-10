export type WindowObject = {
  id: number,
  title: string
};

export function Window({ title }: WindowObject) {
  return <div>{ title }</div>;
};
