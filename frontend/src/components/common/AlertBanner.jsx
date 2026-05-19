/**
 * AlertBanner.jsx — Reusable Alert & Notification Banner
 * ========================================================
 * Provides two exported components:
 *
 *  1. <AlertBanner /> — A dismissible inline alert for forms/sections.
 *     Shows a coloured banner with an icon, message, and optional close button.
 *     Can auto-dismiss after a configurable delay.
 *
 *  2. <InlineAlert /> — Compact one-liner for beneath form fields.
 *     Shows a small coloured message with a leading icon.
 *     Perfect for validation feedback.
 *
 * Variants: "success" | "error" | "warning" | "info"
 */

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   CONFIGURATION MAP
   Maps each variant to its colour tokens, icon, and label.
   ───────────────────────────────────────────────────────────── */
const VARIANT_CONFIG = {
  success: {
    /* Light green background, dark green text */
    containerClass: "bg-emerald-50 border border-emerald-200",
    iconClass:      "text-emerald-600",
    titleClass:     "text-emerald-800",
    textClass:      "text-emerald-700",
    closeClass:     "text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100",
    Icon:           CheckCircle,
    defaultTitle:   "Success",
  },
  error: {
    /* Light red background, dark red text */
    containerClass: "bg-red-50 border border-red-200",
    iconClass:      "text-red-600",
    titleClass:     "text-red-800",
    textClass:      "text-red-700",
    closeClass:     "text-red-400 hover:text-red-700 hover:bg-red-100",
    Icon:           XCircle,
    defaultTitle:   "Something went wrong",
  },
  warning: {
    /* Light amber background, dark amber text */
    containerClass: "bg-amber-50 border border-amber-200",
    iconClass:      "text-amber-600",
    titleClass:     "text-amber-800",
    textClass:      "text-amber-700",
    closeClass:     "text-amber-500 hover:text-amber-700 hover:bg-amber-100",
    Icon:           AlertTriangle,
    defaultTitle:   "Warning",
  },
  info: {
    /* Light blue background, dark blue text */
    containerClass: "bg-blue-50 border border-blue-200",
    iconClass:      "text-blue-600",
    titleClass:     "text-blue-800",
    textClass:      "text-blue-700",
    closeClass:     "text-blue-400 hover:text-blue-700 hover:bg-blue-100",
    Icon:           Info,
    defaultTitle:   "Information",
  },
};

/* ─────────────────────────────────────────────────────────────
   ALERT BANNER
   Full-width coloured alert with icon, title, message, and
   optional dismiss button and auto-dismiss timer.

   Props:
     variant        ("success"|"error"|"warning"|"info") — Visual style
     title          (string)  — Bold heading (optional; uses variant default if omitted)
     message        (string)  — The alert body text
     dismissible    (bool)    — Show the × close button (default: true)
     autoDismissMs  (number)  — Auto-close after N ms (0 = disabled, default: 0)
     onDismiss      (func)    — Called when the alert closes (dismissed or auto)
     className      (string)  — Extra classes for the outer container
   ───────────────────────────────────────────────────────────── */
export const AlertBanner = ({
  variant = "info",
  title,
  message,
  dismissible = true,
  autoDismissMs = 0,
  onDismiss,
  className = "",
}) => {
  /* Whether the banner is currently visible */
  const [isVisible, setIsVisible] = useState(true);

  /* Handles closing the alert and calling the parent callback */
  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  /* Auto-dismiss timer — only starts if autoDismissMs > 0 */
  useEffect(() => {
    if (!autoDismissMs) return;

    const timer = setTimeout(handleDismiss, autoDismissMs);
    return () => clearTimeout(timer); // Clear if component unmounts
  }, [autoDismissMs, handleDismiss]);

  /* Re-show the alert if the message changes (e.g., a new error occurred) */
  useEffect(() => {
    if (message) setIsVisible(true);
  }, [message]);

  /* Don't render anything when dismissed */
  if (!isVisible || !message) return null;

  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.info;
  const { Icon, defaultTitle } = config;
  const displayTitle = title ?? defaultTitle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 p-4 rounded-xl
        ${config.containerClass}
        animate-slide-down
        ${className}
      `}
    >
      {/* Variant icon */}
      <Icon
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`}
        aria-hidden="true"
      />

      {/* Text content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className={`text-sm font-semibold leading-snug ${config.titleClass}`}>
          {displayTitle}
        </p>
        {/* Body message */}
        <p className={`text-sm mt-0.5 leading-relaxed ${config.textClass}`}>
          {message}
        </p>
      </div>

      {/* Dismiss button — only rendered if `dismissible` is true */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          className={`
            flex-shrink-0 -mt-0.5 -mr-1 p-1 rounded-md
            transition-colors duration-150
            ${config.closeClass}
          `}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};


/* ─────────────────────────────────────────────────────────────
   INLINE ALERT — Compact field-level validation message.
   Typically placed directly beneath a form input field.

   Props:
     variant  ("success"|"error"|"warning"|"info")
     message  (string) — The short message to show
     className (string) — Extra classes
   ───────────────────────────────────────────────────────────── */
export const InlineAlert = ({ variant = "error", message, className = "" }) => {
  if (!message) return null;

  const config = VARIANT_CONFIG[variant] ?? VARIANT_CONFIG.error;
  const { Icon } = config;

  return (
    <p
      role="alert"
      className={`flex items-center gap-1.5 text-sm mt-1.5 ${config.textClass} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
};


/* ─────────────────────────────────────────────────────────────
   DEFAULT EXPORT — AlertBanner is the primary export
   ───────────────────────────────────────────────────────────── */
export default AlertBanner;
