import { useCallback, useState } from 'react';
import type { RndResizeCallback } from 'react-rnd';
import { useTheme } from 'styled-components';

type Size = {
  height: string;
  width: string;
};

type Resizable = Size & {
  updateSize: RndResizeCallback;
};

const defaultWindowSize = {
  height: '200px',
  width: '250px'
};

const useResizable = (maximized = false): Resizable => {
  const { sizes } = useTheme();
  const [{ height, width }, setSize] = useState<Size>(defaultWindowSize);
  const updateSize = useCallback<RndResizeCallback>(
    (
      _event,
      _direction,
      { style: { height: elementHeight, width: elementWidth } }
    ) => setSize({ height: elementHeight, width: elementWidth }),
    []
  );

  return {
    height: maximized ? `calc(100% - ${sizes.taskbar.height})` : height,
    width: maximized ? '100%' : width,
    updateSize
  };
};

export default useResizable;
