import { useEffect, useRef } from 'react';

/**
 * Custom hook to handle the native back button to close modals/menus.
 * @param isOpen - Boolean indicating if the modal/menu is open.
 * @param onClose - Function to call when the back button is pressed.
 */
export function useBackToClose(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Increment global modal counter
    if (typeof window !== 'undefined') {
      const currentCount = (window as any)._activeModals || 0;
      (window as any)._activeModals = currentCount + 1;
      
      // Lock scroll if this is the first modal
      if (currentCount === 0) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      }
    }

    const stateId = `modal_${Math.random().toString(36).substring(7)}`;
    
    // Push a new state to the history when the modal opens
    window.history.pushState({ modalId: stateId }, '');

    const handlePopState = (event: PopStateEvent) => {
      // If the back button is pressed, close the modal
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      // Decrement global modal counter
      if (typeof window !== 'undefined') {
        const currentCount = (window as any)._activeModals || 1;
        const newCount = Math.max(0, currentCount - 1);
        (window as any)._activeModals = newCount;
        
        // Unlock scroll only if no more modals are active
        if (newCount === 0) {
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
        }
      }
      
      window.removeEventListener('popstate', handlePopState);
      
      // Use setTimeout to avoid race conditions where another component
      // might have just pushed a new state
      setTimeout(() => {
        if (window.history.state?.modalId === stateId) {
          window.history.back();
        }
      }, 0);
    };
  }, [isOpen]);
}
