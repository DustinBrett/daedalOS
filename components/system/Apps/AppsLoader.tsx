import { ProcessConsumer } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const AppsLoader = (): JSX.Element => (
  <ProcessConsumer>
    {({ processes = {} }) => (
      <AnimatePresence>
        {Object.entries(processes)
          .filter(([, { closing }]) => !closing)
          .map(([id, { Component, hasWindow }]) => (
            <RenderComponent
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

export default AppsLoader;
