import RenderProcess from 'components/system/Processes/RenderProcess';
import { ProcessConsumer } from 'contexts/process';
import { AnimatePresence } from 'framer-motion';

const ProcessLoader = (): JSX.Element => (
  <ProcessConsumer>
    {({ processes }) => (
      <AnimatePresence>
        {Object.entries(processes)
          .filter(([_id, { closing }]) => !closing)
          .map(([id, { Component, hasWindow }]) => (
            <RenderProcess
              key={id}
              Component={Component}
              hasWindow={hasWindow}
              id={id}
            />
          ))}
      </AnimatePresence>
    )}
  </ProcessConsumer>
);

export default ProcessLoader;
