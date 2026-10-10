import { PREVENT_SCROLL } from "utils/constants";

const KEYBOARD_ATTRIBUTE = "data-keyboard";

const NAVIGATION_KEYS = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ContextMenu",
  "End",
  "Home",
  "PageDown",
  "PageUp",
  "Tab",
]);

const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

export const isEditableElement = (element: unknown): boolean =>
  element instanceof HTMLTextAreaElement ||
  (element instanceof HTMLElement && element.isContentEditable) ||
  (element instanceof HTMLInputElement &&
    !NON_TEXT_INPUT_TYPES.has(element.type));

export const isKeyboardNavigating = (): boolean =>
  document.documentElement.hasAttribute(KEYBOARD_ATTRIBUTE);

const showFocusVisuals = (): void =>
  document.documentElement.setAttribute(KEYBOARD_ATTRIBUTE, "");

const onNavigationKeyDown = (event: KeyboardEvent): void => {
  const { altKey, isTrusted, key, shiftKey, target } = event;

  if (
    !isTrusted ||
    isKeyboardNavigating() ||
    !(
      NAVIGATION_KEYS.has(key) ||
      (shiftKey && key === "F10") ||
      (altKey && key === " ")
    )
  ) {
    return;
  }

  // Moving the caret of a text box isn't navigating, unless the page used the
  // key itself, as when going from a search box to its results
  if (key === "Tab" || !isEditableElement(target)) showFocusVisuals();
  else {
    setTimeout(() => {
      if (event.defaultPrevented) showFocusVisuals();
    }, 0);
  }
};

// The frame with focus, from inside of which no key events come here
let frameWithFocus: HTMLIFrameElement | undefined;

const FRAME_CHECK_MS = 100;

const onPointerDown = ({ isTrusted }: PointerEvent): void => {
  if (isTrusted) {
    document.documentElement.removeAttribute(KEYBOARD_ATTRIBUTE);
    frameWithFocus = undefined;
  }
};

const focusHistory: HTMLElement[] = [];

// The element that last had focus in each window, and on the desktop
const lastFocusedIn = new WeakMap<Element, HTMLElement>();

export const isVisibleElement = (element: HTMLElement): boolean =>
  element.getClientRects().length > 0;

const RING_SELECTOR = "[role=dialog]";

export const DESKTOP_SELECTOR = "main > ol[aria-label]";

const SHELL_SELECTOR = `${DESKTOP_SELECTOR}, main > nav[aria-label=Taskbar]`;

// Desktop icons behind windows can't be seen, so Tab passes them by
const isBehindWindow = (element: HTMLElement): boolean => {
  if (!element.closest(DESKTOP_SELECTOR)) return false;

  const { height, left, top, width } = element.getBoundingClientRect();
  const topElement = document.elementFromPoint(
    left + width / 2,
    top + height / 2
  );

  return Boolean(topElement && !topElement.closest(DESKTOP_SELECTOR));
};

const TABBABLE_SELECTOR =
  "a[href],audio[controls],button:not([disabled]),details>summary:first-of-type,iframe,input:not([disabled]),ruffle-player,select:not([disabled]),textarea:not([disabled]),video[controls],[contenteditable]:not([contenteditable='false']),[tabindex]:not([tabindex='-1'])";

// Flash's player counts too, as its tab stop is within its shadow root
const isTabbable = (element: HTMLElement): boolean =>
  (element.tabIndex >= 0 || Boolean(element.shadowRoot)) &&
  !element.closest("[inert]") &&
  isVisibleElement(element) &&
  !isBehindWindow(element);

const getCandidates = (containers: (HTMLElement | null)[]): HTMLElement[] =>
  containers.flatMap((container) => [
    ...(container?.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR) || []),
  ]);

const getTabbables = (containers: (HTMLElement | null)[]): HTMLElement[] =>
  getCandidates(containers).filter(isTabbable);

const SCROLLING_OVERFLOWS = new Set(["auto", "scroll"]);

// Scrolls only the nearest scrolling list, just enough to show the element, as
// scrollIntoView would also scroll the clipped windows around it
export const scrollIntoList = (element: HTMLElement): void => {
  let list = element.parentElement;

  while (list && !SCROLLING_OVERFLOWS.has(getComputedStyle(list).overflowY)) {
    list = list.parentElement;
  }

  if (!list) return;

  const { bottom, top } = element.getBoundingClientRect();
  const listRect = list.getBoundingClientRect();
  // Below what covers the top of a list, like the sticky column headers
  const listTop =
    listRect.top +
    (Number.parseFloat(getComputedStyle(list).scrollPaddingTop) || 0);

  if (top < listTop) list.scrollBy(0, top - listTop);
  else if (bottom > listRect.bottom) list.scrollBy(0, bottom - listRect.bottom);
};

// Like Tab into a frame, focus goes to its first or last tab stop when it can
// be reached, as focusing the frame itself leaves nothing visibly focused
const getFrameTabbable = (
  frame: HTMLIFrameElement,
  backward: boolean
): HTMLElement | undefined => {
  let tabbables: HTMLElement[] = [];

  try {
    tabbables = getTabbables(
      frame.contentDocument ? [frame.contentDocument.body] : []
    );
  } catch {
    // WebKit throws, rather than giving null, for some other-origin frames
  }

  return backward ? tabbables[tabbables.length - 1] : tabbables[0];
};

// Focuses the next element of a ring after another, or the one before it when
// going back, going around at the ends & past any that can't take focus
const focusRingNext = (
  containers: (HTMLElement | null)[],
  from: HTMLElement,
  backward = false
): boolean => {
  const tabbables = getTabbables(containers);
  const index = tabbables.findIndex(
    (element) =>
      from.contains(element) ||
      from.compareDocumentPosition(element) === Node.DOCUMENT_POSITION_FOLLOWING
  );
  const start = index === -1 ? tabbables.length : index;
  const before = tabbables.slice(0, start);
  const after = tabbables.slice(start).filter((element) => element !== from);
  const next = [
    ...(backward
      ? [...before.reverse(), ...after.reverse()]
      : [...after, ...before]),
    from,
  ].find((element) => {
    (
      (element instanceof HTMLIFrameElement &&
        getFrameTabbable(element, backward)) ||
      element
    ).focus(PREVENT_SCROLL);

    return document.activeElement === element;
  });

  if (next) scrollIntoList(next);

  return Boolean(next);
};

// Wraps Tab around at either end of the tab stops within containers
export const loopFocus = (
  event: KeyboardEvent | React.KeyboardEvent,
  containers: (HTMLElement | null)[]
): void => {
  if (event.key !== "Tab") return;

  const { activeElement } = document;
  const candidates = getCandidates(containers);
  // Only the end being tabbed towards is needed, so only it is checked
  const edge = (event.shiftKey ? candidates : candidates.reverse()).find(
    isTabbable
  );
  const atEnd =
    activeElement === edge ||
    (event.shiftKey && containers.includes(activeElement as HTMLElement));

  if (
    atEnd &&
    activeElement instanceof HTMLElement &&
    focusRingNext(containers, activeElement, event.shiftKey)
  ) {
    event.preventDefault();
  }
};

// Like Windows, Tab stays within the active window or flyout, while the
// desktop & taskbar take turns, so nothing behind them is ever reached
const getTabRing = (element: Element): HTMLElement[] => {
  // Only browsers that ignore inert, like Chrome before 102, let focus into a
  // minimized window
  if (element.closest("[inert]")) return [];

  const ring = element.closest<HTMLElement>(RING_SELECTOR);

  if (ring) return [ring];

  const shell = [...document.querySelectorAll<HTMLElement>(SHELL_SELECTOR)];

  return shell.some((part) => part.contains(element)) ? shell : [];
};

// Runs once the page is done with a key, unless something there kept it for
// itself, as apps like Vim do with Tab
export const whenUnhandled = (
  event: KeyboardEvent,
  callback: () => void
): void => {
  const onKeyDown = (lastEvent: KeyboardEvent): void => {
    if (lastEvent !== event) return;

    window.removeEventListener("keydown", onKeyDown);
    if (!event.defaultPrevented) callback();
  };

  window.addEventListener("keydown", onKeyDown);
  setTimeout(() => window.removeEventListener("keydown", onKeyDown), 0);
};

type TabMove = {
  backward: boolean;
  from: HTMLElement;
  ring: HTMLElement[];
};

// Where Tab moves focus from, as browsers can still take it past the ends of a
// ring, like Safari skipping its links
let tabMove: TabMove | undefined;

const onTabKeyDown = (event: KeyboardEvent): void => {
  const { activeElement } = document;

  if (
    event.isTrusted &&
    event.key === "Tab" &&
    !event.ctrlKey &&
    !event.metaKey &&
    activeElement instanceof HTMLElement
  ) {
    const ring = getTabRing(activeElement);

    if (ring.length === 0) return;

    whenUnhandled(event, () => {
      loopFocus(event, ring);

      if (!event.defaultPrevented) {
        tabMove = { backward: event.shiftKey, from: activeElement, ring };
        setTimeout(() => {
          tabMove = undefined;
        }, 0);
      }
    });
  }
};

const rememberFocus = (element: HTMLElement): void => {
  if (element !== focusHistory[0]) {
    focusHistory.unshift(element);
    focusHistory.length = Math.min(focusHistory.length, 10);
  }

  const container = element.closest(`${RING_SELECTOR}, ${DESKTOP_SELECTOR}`);

  if (container) lastFocusedIn.set(container, element);
};

// Remembers a frame having focus, unless Tab took focus into one outside of
// its ring, as Safari can by going from text box to text box
const rememberFrame = (move?: TabMove): void => {
  if (
    move &&
    document.activeElement instanceof HTMLIFrameElement &&
    !move.ring.some((container) => container.contains(document.activeElement))
  ) {
    frameWithFocus = undefined;
    focusRingNext(move.ring, move.from, move.backward);
  }

  const { activeElement } = document;

  if (activeElement instanceof HTMLIFrameElement) {
    frameWithFocus = activeElement;
    rememberFocus(activeElement);
  }
};

// Focus going into a frame has no focusin here, only focus leaving, after
// which some browsers take a moment to show the frame as active
const onFocusLeave = ({ relatedTarget }: FocusEvent): void => {
  if (relatedTarget) return;

  const move = tabMove;

  rememberFrame();
  setTimeout(() => rememberFrame(move), 0);
};

// No keys come from a frame, so a tab stop taking focus from one is a Tab out,
// backward when it comes before the frame, unless it's the page's first stop
const tabbedFromFrame = (target: HTMLElement): TabMove | undefined => {
  const frame = frameWithFocus;
  const ring = frame ? getTabRing(frame) : [];

  if (
    !frame ||
    ring.length === 0 ||
    target instanceof HTMLIFrameElement ||
    target.tabIndex < 0 ||
    !isVisibleElement(frame)
  ) {
    return undefined;
  }

  showFocusVisuals();

  const firstTabbable = getCandidates([document.body]).find(isTabbable);

  return {
    backward:
      frame.compareDocumentPosition(target) !==
        Node.DOCUMENT_POSITION_FOLLOWING &&
      Boolean(
        firstTabbable &&
        firstTabbable !== target &&
        target.compareDocumentPosition(firstTabbable) !==
          Node.DOCUMENT_POSITION_FOLLOWING
      ),
    from: frame,
    ring,
  };
};

const onFocusIn = (event: FocusEvent): void => {
  const { target } = event;

  if (!(target instanceof HTMLElement)) return;

  const move = tabMove || tabbedFromFrame(target);

  tabMove = undefined;
  frameWithFocus = target instanceof HTMLIFrameElement ? target : undefined;

  if (
    move &&
    (!move.ring.some((container) => container.contains(target)) ||
      isBehindWindow(target)) &&
    focusRingNext(move.ring, move.from, move.backward)
  ) {
    // Unseen by the page, so nothing outside of the ring gets activated
    event.stopImmediatePropagation();
    return;
  }

  rememberFocus(target);
};

// Elements in minimized windows are inert, so focusing them does nothing
const canRestoreFocus = (element: unknown): element is HTMLElement =>
  element instanceof HTMLElement &&
  element !== document.body &&
  !element.closest("[inert]") &&
  isVisibleElement(element);

export const getFocusedBefore = (
  container?: HTMLElement | null
): HTMLElement | undefined =>
  focusHistory.find(
    (element) => canRestoreFocus(element) && !container?.contains(element)
  );

// Like Windows activating a window, focus goes back to whichever of its
// elements had it last when using the keyboard, or else to the container
export const focusWithin = (container?: HTMLElement | null): void => {
  const lastFocused = container ? lastFocusedIn.get(container) : undefined;

  (isKeyboardNavigating() &&
  lastFocused &&
  container?.contains(lastFocused) &&
  isVisibleElement(lastFocused)
    ? lastFocused
    : container
  )?.focus(PREVENT_SCROLL);
};

// Like Windows, the desktop has focus when no window does
export const focusDesktop = (): HTMLElement | null => {
  const desktop = document.querySelector<HTMLElement>(DESKTOP_SELECTOR);

  if (!desktop?.contains(document.activeElement)) focusWithin(desktop);

  return desktop;
};

export const restoreFocus = (
  element?: Element | null,
  container?: HTMLElement | null
): void => {
  const target = canRestoreFocus(element)
    ? element
    : getFocusedBefore(container);

  if (target) target.focus(PREVENT_SCROLL);
  else focusDesktop();
};

// Removing what has focus drops it to the body, so for the keyboard it's put
// back after the removal, unless something else took focus by then
export const whenFocusLost = (focus: () => void): void => {
  requestAnimationFrame(() => {
    if (isKeyboardNavigating() && document.activeElement === document.body) {
      focus();
    }
  });
};

let disabledElement: HTMLElement | undefined;

// A focused button being disabled drops focus to the body, so focus moves to
// its container instead to stay in the same window, then back once enabled
const keepFocusWhenDisabled = (mutations: MutationRecord[]): void => {
  mutations.forEach(({ target }) => {
    if (!(target instanceof HTMLElement)) return;

    const container = target.parentElement?.closest<HTMLElement>("[tabindex]");

    if (target.hasAttribute("disabled")) {
      // Once focus settles, as what focus is leaving can be disabled meanwhile
      setTimeout(() => {
        const { activeElement } = document;

        if (
          target.hasAttribute("disabled") &&
          target === focusHistory[0] &&
          (activeElement === document.body || activeElement === target)
        ) {
          disabledElement = target;
          container?.focus(PREVENT_SCROLL);
        }
      }, 0);
    } else if (target === disabledElement) {
      disabledElement = undefined;
      if (document.activeElement === container) target.focus(PREVENT_SCROLL);
    }
  });
};

// Like Windows, focus visuals stay hidden until the keyboard is used to
// navigate, and hide again on the next pointer interaction
export const trackKeyboardNavigation = (): (() => void) => {
  const options = { capture: true, passive: true };
  const disabledObserver = new MutationObserver(keepFocusWhenDisabled);
  // Focus going from one frame to another sends nothing here either
  const frameTimer = window.setInterval(() => {
    if (frameWithFocus) rememberFrame();
  }, FRAME_CHECK_MS);

  disabledObserver.observe(document.body, {
    attributeFilter: ["disabled"],
    subtree: true,
  });
  window.addEventListener("blur", onFocusLeave, { passive: true });
  window.addEventListener("focusin", onFocusIn, options);
  window.addEventListener("focusout", onFocusLeave, options);
  window.addEventListener("keydown", onNavigationKeyDown, options);
  window.addEventListener("pointerdown", onPointerDown, options);
  document.addEventListener("keydown", onTabKeyDown);

  return () => {
    disabledObserver.disconnect();
    window.clearInterval(frameTimer);
    window.removeEventListener("blur", onFocusLeave);
    window.removeEventListener("focusin", onFocusIn, options);
    window.removeEventListener("focusout", onFocusLeave, options);
    window.removeEventListener("keydown", onNavigationKeyDown, options);
    window.removeEventListener("pointerdown", onPointerDown, options);
    document.removeEventListener("keydown", onTabKeyDown);
  };
};

export const isMenuElement = (element: unknown): boolean =>
  element instanceof Element && Boolean(element.closest("[role=menu]"));

// Focus only moves into a menu from the keyboard, as mouse clicks on its items
// should still blur whatever had focus before
export const isKeyboardInMenu = (element: unknown): boolean =>
  isKeyboardNavigating() && isMenuElement(element);

const IME_KEY_CODE = 229;

// Keys an IME uses to pick or cancel what it composes, which Safari sends
// after the composition ends, so only their key code tells
export const isComposingKey = (event: KeyboardEvent): boolean =>
  // eslint-disable-next-line typescript/no-deprecated
  event.isComposing || event.keyCode === IME_KEY_CODE;

// Characters typed with AltGr count too, unlike shortcuts, as do those typed
// with Option on a Mac
export const isPrintableKey = (
  event: KeyboardEvent | React.KeyboardEvent
): boolean => {
  const { altKey, ctrlKey, key, metaKey } = event;

  return (
    key.length === 1 &&
    key !== " " &&
    !metaKey &&
    (!(altKey || ctrlKey) ||
      event.getModifierState("AltGraph") ||
      (!ctrlKey && navigator.userAgent.includes("Mac")))
  );
};

// Like the context menu key, the menu opens at the focused item, or at the
// selected entry of a focused file list or of the window it's in
export const openContextMenu = (element: HTMLElement): void => {
  const list =
    element instanceof HTMLOListElement
      ? element
      : element.querySelector<HTMLElement>("ol[tabindex]");
  const target =
    list?.querySelector<HTMLElement>(":scope > li.focus-within > button") ||
    list ||
    element;
  const { height, left, top, width } = target.getBoundingClientRect();
  // A list or window opens it near its corner, anything smaller at its middle
  const isContainer =
    width > window.innerWidth / 2 || height > window.innerHeight / 2;

  target.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: Math.round(isContainer ? left + 8 : left + width / 2),
      clientY: Math.round(isContainer ? top + 8 : top + height / 2),
      view: window,
    })
  );
};

const ARROW_STEPS: Record<string, number> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};

// Letters, and arrows in a text box, don't show focus visuals by themselves
const focusItem = (item: HTMLElement): void => {
  showFocusVisuals();
  item.focus(PREVENT_SCROLL);
  scrollIntoList(item);
};

type FocusByKeyOptions = {
  horizontal?: boolean;
  vertical?: boolean;
  wrap?: boolean;
};

export const focusByKey = (
  key: string,
  items: HTMLElement[],
  { horizontal = true, vertical = true, wrap = true }: FocusByKeyOptions = {}
): boolean => {
  const isHorizontal = key === "ArrowLeft" || key === "ArrowRight";
  const step = (isHorizontal ? horizontal : vertical) && ARROW_STEPS[key];
  const current = items.indexOf(document.activeElement as HTMLElement);
  let index = key === "Home" ? 0 : key === "End" ? items.length - 1 : -1;

  if (step) {
    const next =
      current === -1 ? (step > 0 ? 0 : items.length - 1) : current + step;

    index = wrap
      ? (next + items.length) % items.length
      : Math.min(Math.max(next, 0), items.length - 1);
  }

  if (!items[index]) return false;

  focusItem(items[index]);

  return true;
};

export const focusByCharacter = (
  character: string,
  items: HTMLElement[]
): boolean => {
  const lowerCaseCharacter = character.toLowerCase();
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
  const orderedItems = [
    ...items.slice(currentIndex + 1),
    ...items.slice(0, currentIndex + 1),
  ];
  const match = orderedItems.find((item) =>
    (item.getAttribute("aria-label") || item.textContent || "")
      .trim()
      .toLowerCase()
      .startsWith(lowerCaseCharacter)
  );

  if (!match) return false;

  focusItem(match);

  return true;
};
