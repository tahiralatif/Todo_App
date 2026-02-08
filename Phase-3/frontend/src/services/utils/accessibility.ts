// Accessibility utilities for the application

/**
 * Gets the current reduced motion preference
 * @returns boolean indicating if reduced motion is preferred
 */
export const getReducedMotionPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

/**
 * Adds an event listener for reduced motion preference changes
 * @param callback Function to call when preference changes
 * @returns Function to remove the event listener
 */
export const subscribeToReducedMotionChanges = (callback: (reducedMotion: boolean) => void) => {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches);
  };

  mediaQuery.addEventListener('change', handleChange);

  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};

/**
 * Focuses an element with an option to prevent scrolling
 * @param element Element to focus
 * @param preventScroll Whether to prevent scrolling to the element
 */
export const focusElement = (element: HTMLElement | null, preventScroll: boolean = false) => {
  if (element) {
    element.focus({ preventScroll });
  }
};

/**
 * Traps focus within a container - useful for modals and dialogs
 * @param container Container element to trap focus within
 * @param firstFocusElement Element to focus initially (defaults to first focusable element)
 */
export const trapFocus = (container: HTMLElement, firstFocusElement?: HTMLElement) => {
  if (!container) return;

  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = firstFocusElement || focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);

  firstElement?.focus();

  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Announces a message to screen readers
 * @param message Message to announce
 */
export const announceToScreenReader = (message: string) => {
  // Create or reuse an aria-live region for announcements
  let liveRegion = document.getElementById('aria-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.id = 'aria-live-region';
    liveRegion.style.position = 'absolute';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.padding = '0';
    liveRegion.style.margin = '-1px';
    liveRegion.style.overflow = 'hidden';
    liveRegion.style.clip = 'rect(0, 0, 0, 0)';
    liveRegion.style.whiteSpace = 'nowrap';
    liveRegion.style.border = '0';

    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;

  // Clear the message after a delay so it can be announced again
  setTimeout(() => {
    liveRegion!.textContent = '';
  }, 1000);
};