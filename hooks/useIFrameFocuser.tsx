import { focusClosestFocusableElement } from '@/utils/elements';
import { useEffect } from 'react';

const useIFrameFocuser = (): void => {
  useEffect(() => {
    window.addEventListener('blur', () => {
      if (document.activeElement instanceof HTMLIFrameElement) {
        focusClosestFocusableElement(document.activeElement);
      }
    });
  }, []);
};

export default useIFrameFocuser;
