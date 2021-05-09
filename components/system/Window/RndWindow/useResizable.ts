import { useEffect, useState } from 'react';
import type { Props } from 'react-rnd';
import { DEFAULT_WINDOW_SIZE } from 'utils/constants';

export type Size = NonNullable<Props['size']>;

type Resizable = [Size, React.Dispatch<React.SetStateAction<Size>>];

const useResizable = (
  autoSizing = false,
  size = DEFAULT_WINDOW_SIZE
): Resizable => {
  const [{ height, width }, setSize] = useState<Size>(size);

  useEffect(() => {
    if (autoSizing) setSize(size);
  }, [autoSizing, size]);

  return [{ height, width }, setSize];
};

export default useResizable;
