import styles from '@/styles/System/WindowManager/WindowManager.module.scss';

import type { Process } from '@/utils/process';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import useWindow from '@/hooks/useWindow';

const Window = dynamic(import('@/components/System/WindowManager/Window'));

const ProcessWindow: React.FC<Process> = ({
  loader: { loader: App, loadedAppOptions, loaderOptions },
  bgColor,
  icon,
  name,
  url,
  windowed,
  ...processProps
}) => {
  const { motions, settings } = useWindow({
    processProps,
    loaderOptions
  });
  const { height, width, zIndex } = settings;
  const AppComponent = <App url={url} {...loadedAppOptions} {...settings} />;

  return (
    <motion.article
      className={styles.animatedWindows}
      style={{ height, width, zIndex }}
      {...motions}
    >
      {windowed ? (
        <Window icon={icon} name={name} bgColor={bgColor} {...settings}>
          {AppComponent}
        </Window>
      ) : (
        AppComponent
      )}
    </motion.article>
  );
};

export default ProcessWindow;
