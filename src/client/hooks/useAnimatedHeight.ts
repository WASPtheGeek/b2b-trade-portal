"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Animates a container's height whenever one of `deps` changes, instead of
 * letting it snap instantly to the new content's height.
 *
 * Uses the FLIP technique: measures the height before the change, then
 * transitions from that value to the freshly rendered height. The container
 * is left with no inline height once the transition ends, so later content
 * changes (e.g. an error banner appearing) still resize it immediately.
 *
 * The element's content also dips to `opacity: 0` and fades back in over the
 * same transition, so the instant content swap underneath (React replaces
 * the old children with the new ones in a single commit, with no
 * in-between state to crossfade) happens while invisible instead of
 * showing the new content clipped short or the old content trailing off
 * into empty space.
 *
 * @param ref The element whose height should animate.
 * @param deps Values that, when changed, mean the element's content changed structurally.
 */
export function useAnimatedHeight(ref: RefObject<HTMLElement | null>, deps: unknown[]): void {
  // Deliberately only ever written once a transition has actually finished (or on the very
  // first measurement) - never mid-setup. React's Strict Mode (on by default for the app
  // router in development) invokes this effect twice per commit, synchronously, with no
  // paint in between. Both invocations must therefore compute the exact same "from -> to"
  // pair and apply the exact same final mutation; if this ref were updated as part of
  // *starting* the transition, the second invocation would read the first invocation's
  // in-progress target as its own starting point and cancel the animation outright.
  const settledHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    // Clear any transition still in flight (from this same effect's own prior, Strict-Mode
    // duplicate invocation) before measuring, so `nextHeight` always reflects the element's
    // true natural size rather than a mid-transition snapshot of itself.
    element.style.transition = "";
    element.style.height = "";
    element.style.opacity = "";
    element.style.overflow = "";

    const nextHeight = element.getBoundingClientRect().height;
    const fromHeight = settledHeight.current;

    if (fromHeight === null || fromHeight === nextHeight) {
      settledHeight.current = nextHeight;

      return;
    }

    element.style.overflow = "hidden";
    element.style.height = `${fromHeight}px`;
    element.style.opacity = "0";

    // Force a layout flush so the browser registers the starting height
    // before the transition to the new one begins.
    void element.offsetHeight;

    // `--ease-out` (used elsewhere for entrances) is front-loaded: most of a large resize
    // would happen in the first ~40% of the duration, which reads as a snap rather than a
    // glide. `--ease-standard` eases in and out symmetrically, which suits a resize better.
    element.style.transition = "height var(--dur-slower) var(--ease-standard), opacity var(--dur-slower) var(--ease-standard)";
    element.style.height = `${nextHeight}px`;
    element.style.opacity = "1";

    const resetInlineStyles = (event: TransitionEvent): void => {
      if (event.propertyName !== "height") {
        return;
      }

      element.style.transition = "";
      element.style.height = "";
      element.style.opacity = "";
      element.style.overflow = "";
      settledHeight.current = nextHeight;
    };

    element.addEventListener("transitionend", resetInlineStyles, { once: true });

    return () => {
      element.removeEventListener("transitionend", resetInlineStyles);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
