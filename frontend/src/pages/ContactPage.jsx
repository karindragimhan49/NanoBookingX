/**
 * ContactPage.jsx — Contact Us & Inquiry Submission
 * ---------------------------------------------------
 * Displays contact details and a fully functional inquiry form.
 * The form posts to POST /api/inquiries (public — no login required).
 * Validation mirrors the backend's validateCreateInquiry rules exactly:
 *   - senderName  : required
 *   - senderEmail : required, valid email
 *   - senderPhone : optional, 7–20 digit format
 *   - subject     : required, max 150 chars
 *   - message     : required, 10–2000 chars
 */

import { useState } from "react";
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { submitInquiry } from "../api/inquiryApi";
import { useAuth } from "../context/AuthContext";

/* ---- Contact information tiles ---- */
const CONTACT_ITEMS = [
  {
    Icon:  MapPin,
    label: "Address",
    value: "12 Lewis Place, Negombo 11500, Sri Lanka",
  },
  {
    Icon:  Phone,
    label: "Phone",
    value: "+94 31 222 3456",
    href:  "tel:+94312223456",
  },
  {
    Icon:  Mail,
    label: "Email",
    value: "hello@globetrekadventures.lk",
    href:  "mailto:hello@globetrekadventures.lk",
  },
];

/* ──────────────────────────────────────────────────────────────
   InquiryForm — the main contact form
   ────────────────────────────────────────────────────────────── */
const InquiryForm = ({ currentUser }) => {
  // Pre-fill name and email if the user is already logged in
  const [form, setForm] = useState({
    senderName:  currentUser?.fullName  || "",
    senderEmail: currentUser?.email     || "",
    senderPhone: currentUser?.phoneNumber || "",
    subject:     "",
    message:     "",
  });
  const [errors,      setErrors]      = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---- Client-side validation (mirrors backend validateCreateInquiry) ----
  const validate = () => {
    const errs = {};

    if (!form.senderName.trim())
      errs.senderName = "Your name is required.";

    if (!form.senderEmail.trim()) {
      errs.senderEmail = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.senderEmail)) {
      errs.senderEmail = "Please enter a valid email address.";
    }

    if (form.senderPhone.trim() && !/^[+\d\s\-()]{7,20}$/.test(form.senderPhone.trim())) {
      errs.senderPhone = "Please enter a valid phone number (7–20 digits).";
    }

    if (!form.subject.trim()) {
      errs.subject = "Subject is required.";
    } else if (form.subject.trim().length > 150) {
      errs.subject = "Subject cannot exceed 150 characters.";
    }

    if (!form.message.trim()) {
      errs.message = "Message is required.";
    } else if (form.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters.";
    } else if (form.message.trim().length > 2000) {
      errs.message = "Message cannot exceed 2000 characters.";
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry({
        senderName:  form.senderName.trim(),
        senderEmail: form.senderEmail.trim().toLowerCase(),
        senderPhone: form.senderPhone.trim() || undefined,
        subject:     form.subject.trim(),
        message:     form.message.trim(),
      });
      setSubmitted(true);
      toast.success("Inquiry sent! We'll reply within 24 hours.");
    } catch (err) {
      // Handle backend 422 field-level errors if any slip through client validation
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(({ field, message }) => {
          backendErrors[field] = message;
        });
        setErrors(backendErrors);
      } else {
        toast.error(
          err.response?.data?.message || "Failed to send your inquiry. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (name) =>
    `w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
      errors[name]
        ? "border-red-400 focus:ring-red-200 bg-red-50 focus:border-red-400"
        : "border-gray-300 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A]"
    }`;

  // ---- Success state ----
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Received!</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Thank you for reaching out. Our team will respond to your inquiry within 24 hours.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ senderName: currentUser?.fullName || "", senderEmail: currentUser?.email || "", senderPhone: "", subject: "", message: "" });
          }}
          className="mt-6 text-sm text-[#1B4F8A] font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Row: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Your name <span className="text-red-500">*</span>
          </label>
          <input
            id="senderName"
            name="senderName"
            type="text"
            autoComplete="name"
            value={form.senderName}
            onChange={handleChange}
            placeholder="Jane Doe"
            className={inputClass("senderName")}
          />
          {errors.senderName && (
            <p className="mt-1 text-xs text-red-600">{errors.senderName}</p>
          )}
        </div>

        <div>
          <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="senderEmail"
            name="senderEmail"
            type="email"
            autoComplete="email"
            value={form.senderEmail}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputClass("senderEmail")}
          />
          {errors.senderEmail && (
            <p className="mt-1 text-xs text-red-600">{errors.senderEmail}</p>
          )}
        </div>
      </div>

      {/* Phone (optional) */}
      <div>
        <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone number{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="senderPhone"
          name="senderPhone"
          type="tel"
          autoComplete="tel"
          value={form.senderPhone}
          onChange={handleChange}
          placeholder="+94 77 123 4567"
          className={inputClass("senderPhone")}
        />
        {errors.senderPhone && (
          <p className="mt-1 text-xs text-red-600">{errors.senderPhone}</p>
        )}
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={handleChange}
          placeholder="e.g. Inquiry about the Ella train tour"
          className={inputClass("subject")}
        />
        {errors.subject && (
          <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
        )}
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your travel plans, questions, or special requirements…"
          className={`${inputClass("message")} resize-y min-h-[120px]`}
        />
        <div className="flex justify-between items-center mt-1">
          {errors.message
            ? <p className="text-xs text-red-600">{errors.message}</p>
            : <span />
          }
          <span className={`text-xs ${form.message.length > 1800 ? "text-amber-600" : "text-gray-400"}`}>
            {form.message.length}/2000
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" aria-hidden="true" />
            Send Message
          </>
        )}
      </button>

    </form>
  );
};

/* ══════════════════════════════════════════════════════════════
   ContactPage — Main component
   ══════════════════════════════════════════════════════════════ */
const ContactPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-white animate-fade-in">

      {/* ── Page header ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="container-custom">
          <p className="text-xs font-bold text-[#1B4F8A] uppercase tracking-widest mb-2">
            Get in Touch
          </p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Have a question, special request, or want to plan a custom tour?
            Send us a message and we'll reply within 24 hours.
          </p>
        </div>
      </div>

      <div className="container-custom section-padding">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ── Left: Contact info + map placeholder ── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0 space-y-6">

            <h2 className="text-lg font-bold text-gray-900">Our Details</h2>

            {/* Contact tiles */}
            <div className="space-y-4">
              {CONTACT_ITEMS.map(({ Icon, label, value, href }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B4F8A]/30 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#1B4F8A]" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-gray-700 hover:text-[#1B4F8A] transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-700">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Business hours */}
            <div className="p-4 bg-[#EFF6FF] border border-[#1B4F8A]/15 rounded-2xl">
              <p className="text-xs font-bold text-[#1B4F8A] uppercase tracking-widest mb-2">
                Business Hours
              </p>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Monday – Friday</span>
                  <span className="font-medium">8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
              <p className="text-xs text-[#1B4F8A] mt-2 font-medium">
                All times are Sri Lanka Standard Time (IST +5:30)
              </p>
            </div>
          </div>

          {/* ── Right: Inquiry form ── */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <InquiryForm currentUser={currentUser} />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ContactPage;
