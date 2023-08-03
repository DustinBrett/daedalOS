import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { memo } from "react";
import { useProcesses } from "contexts/process";

const RenderComponent = dynamic(
  () => import("components/system/Apps/RenderComponent")
);

const AppsLoader: FC = () => {
  const { processes = {} } = useProcesses();

  return (
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
  );
};

export default memo(AppsLoader);
