/**
 * RegisterPage.jsx — User Registration
 * ---------------------------------------
 * Split layout matching LoginPage. Collects fullName, email, phoneNumber,
 * password + confirm. Submits via AuthContext.register() then redirects
 * to /dashboard.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Globe, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ---- Form state ----
  const [form, setForm] = useState({
    fullName:    "",
    email:       "",
    phoneNumber: "",
    password:    "",
    confirmPassword: "",
  });
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting,        setIsSubmitting]        = useState(false);
  const [errors,              setErrors]              = useState({});
  const [generalError,        setGeneralError]        = useState("");

  // Generic change handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear per-field error on edit
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---- Client-side validation ----
  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim())
      newErrors.fullName = "Full name is required.";

    if (!form.email.trim())
      newErrors.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Please enter a valid email address.";

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.password)) {
      // Backend requires at least one uppercase letter
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/\d/.test(form.password)) {
      // Backend requires at least one digit
      newErrors.password = "Password must contain at least one number.";
    }

    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    return newErrors;
  };

  // ---- Submit handler ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName:    form.fullName.trim(),
        email:       form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        password:    form.password,
      });
      toast.success("Account created! Welcome to GlobeTrek 🎉");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      // Handle backend 422 field-level errors
      if (err.response?.data?.errors) {
        const backendErrors = {};
        err.response.data.errors.forEach(({ field, message }) => {
          backendErrors[field] = message;
        });
        setErrors(backendErrors);
      } else {
        setGeneralError(
          err.response?.data?.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: returns error + border classes for an input
  const fieldClass = (name) =>
    `w-full px-4 py-2.5 rounded-xl border text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-colors ${
      errors[name]
        ? "border-red-400 focus:ring-red-200 focus:border-red-400 bg-red-50"
        : "border-gray-300 focus:ring-[#1B4F8A]/30 focus:border-[#1B4F8A]"
    }`;

  return (
    <div className="min-h-[calc(100vh-64px)] flex animate-fade-in">

      {/* ── LEFT: Brand panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 bg-[#1B4F8A] flex-col justify-between p-12 relative overflow-hidden">

        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true" />

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-white font-bold text-lg">
            Globe<span className="text-blue-200">Trek</span> Adventures
          </span>
        </div>

        {/* Main message */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Join thousands of<br />Sri Lanka explorers.
          </h2>
          <p className="text-blue-200 mb-8 leading-relaxed">
            Create your free account and start planning your dream trip today.
            45+ curated packages, expert guides, flexible cancellation.
          </p>

          {/* Location badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <MapPin className="w-4 h-4 text-blue-300" aria-hidden="true" />
            <span className="text-blue-100 text-sm">Based in Negombo, Sri Lanka</span>
          </div>
        </div>

        <p className="text-blue-300 text-sm">
          Free to join · No hidden fees · Cancel anytime
        </p>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
              <p className="text-gray-500 text-sm">It's free and only takes a minute</p>
            </div>

            {/* General error */}
            {generalError && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
              >
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className={fieldClass("fullName")}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={fieldClass("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone (optional) */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+94 77 123 4567"
                  className={fieldClass("phoneNumber")}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="8+ chars, 1 uppercase, 1 number"
                    className={`${fieldClass("password")} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={`${fieldClass("confirmPassword")} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1B4F8A] hover:bg-[#163F70] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#1B4F8A] font-semibold hover:underline">
                Sign in →
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
