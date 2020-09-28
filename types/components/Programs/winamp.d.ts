export type WebampStoreAction = { type: string; windowId: string };

export type WebampStore = {
  store: {
    dispatch: (action: WebampStoreAction) => void;
  };
};

export type PrivateOptions = {
  __initialWindowLayout: {
    [windowId: string]: {
      position: {
        x: number;
        y: number;
      };
    };
  };
};
