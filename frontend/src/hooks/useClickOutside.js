/**
 * useClickOutside.js — Click-Outside Detection Hook
 * ---------------------------------------------------
 * Calls the provided callback whenever the user clicks anywhere
 * outside of the element referenced by `ref`.
 *
 * Used by dropdown menus to close themselves when the user
 * clicks elsewhere on the page.
 *
 * @param {React.RefObject} ref      — Ref attached to the element to monitor
 * @param {Function}        callback — Function to call when a click outside is detected
 * @param {boolean}         enabled  — Optional: pause detection when false (e.g., when closed)
 *
 * Usage:
 *   const dropdownRef = useRef(null);
 *   useClickOutside(dropdownRef, () => setIsOpen(false));
 */

import { useEffect } from "react";

const useClickOutside = (ref, callback, enabled = true) => {
  useEffect(() => {
    // Do nothing if detection is disabled or no callback is provided
    if (!enabled || !callback) return;

    const handleClick = (event) => {
      // If the click target is inside the referenced element, do nothing
      if (ref.current && ref.current.contains(event.target)) return;
      // Otherwise, the click was outside — trigger the callback
      callback();
    };

    // Listen on the capture phase to intercept clicks before they bubble
    document.addEventListener("mousedown", handleClick, true);

    // Cleanup: remove the listener when the component unmounts or deps change
    return () => {
      document.removeEventListener("mousedown", handleClick, true);
    };
  }, [ref, callback, enabled]);
};

export default useClickOutside;
