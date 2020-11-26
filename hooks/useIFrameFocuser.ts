import { focusClosestFocusableElement } from '@/utils/elements';
import { useEffect } from 'react';

const useIFrameFocuser = (): void => {
  const focusIFrameContainer = () => {
    if (document.activeElement instanceof HTMLIFrameElement) {
      focusClosestFocusableElement(document.activeElement);
    }
  };

  useEffect(() => {
    window.addEventListener('blur', focusIFrameContainer);

    return () => {
      window.removeEventListener('blur', focusIFrameContainer);
    };
  }, []);
};

export default useIFrameFocuser;
