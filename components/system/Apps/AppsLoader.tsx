import { ProcessConsumer } from "contexts/process";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { memo } from "react";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const AppsLoader: FC = () => (
  <ProcessConsumer>
    {({ processes = {} }) => (
      <AnimatePresence initial={false} presenceAffectsLayout={false}>
        {Object.entries(processes).map(
          ([id, { closing, Component, hasWindow }]) =>
            id &&
            Component &&
            !closing && (
              <RenderComponent
                key={id}
                Component={Component}
                hasWindow={hasWindow}
                id={id}
              />
            )
        )}
      </AnimatePresence>
    )}
  </ProcessConsumer>
);

export default memo(AppsLoader);
