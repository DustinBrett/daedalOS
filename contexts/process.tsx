import type { FC } from 'react';
import processDirectory from 'utils/processDirectory';

const ProcessLoader: FC = () => (
  <>
    {Object.entries(processDirectory).map(([id, { Component }]) => (
      <Component key={id} />
    ))}
  </>
);

export default ProcessLoader;
