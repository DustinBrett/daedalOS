import StyledPeakWindow from 'components/system/Taskbar/TaskbarEntry/Peak/StyledPeakWindow';
import useWindowActions from 'components/system/Window/Titlebar/useWindowActions';
import { CloseIcon } from 'components/system/Window/Titlebar/WindowActionIcons';
import { useProcesses } from 'contexts/process';
import { toPng } from 'html-to-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from 'styles/common/Button';
import { MILLISECONDS_IN_SECOND } from 'utils/constants';

type WindowPeak = {
  PeakComponent?: React.ComponentType;
  peakEvents: {
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  };
};

const useWindowPeak = (id: string): WindowPeak => {
  const {
    processes: {
      [id]: { componentWindow = undefined, minimized = false, title = '' } = {}
    }
  } = useProcesses();
  const mouseTimer = useRef<NodeJS.Timer | null>(null);
  const previewTimer = useRef<NodeJS.Timer | null>(null);
  const [showPeak, setShowPeak] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const { onClose } = useWindowActions(id);
  const PeakWindow = (): JSX.Element => (
    <StyledPeakWindow>
      <img alt={title} src={previewSrc} />
      <Button onClick={onClose} title="Close">
        <CloseIcon />
      </Button>
    </StyledPeakWindow>
  );
  const onMouseEnter = () => {
    if (componentWindow) {
      const renderFrame = () =>
        toPng(componentWindow).then((dataUrl) => {
          const previewImage = new Image();

          previewImage.src = dataUrl;
          previewImage.onload = () => setPreviewSrc(dataUrl);
        });

      mouseTimer.current = setTimeout(() => {
        renderFrame();
        setShowPeak(true);
        previewTimer.current = setInterval(renderFrame, MILLISECONDS_IN_SECOND);
      }, MILLISECONDS_IN_SECOND / 2);
    }
  };
  const onMouseLeave = useCallback(() => {
    if (mouseTimer?.current) clearTimeout(mouseTimer.current);
    if (previewTimer?.current) clearInterval(previewTimer.current);

    setShowPeak(false);
    setPreviewSrc('');
  }, []);

  useEffect(() => {
    if (minimized) {
      setShowPeak(false);
      setPreviewSrc('');
    }
  }, [minimized]);

  useEffect(() => onMouseLeave, [onMouseLeave]);

  return {
    PeakComponent: showPeak && previewSrc ? PeakWindow : undefined,
    peakEvents: minimized
      ? {}
      : {
          onMouseEnter,
          onMouseLeave
        }
  };
};

export default useWindowPeak;
