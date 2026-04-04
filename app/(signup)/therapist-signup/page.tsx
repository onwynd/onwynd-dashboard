"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect, Suspense } from "react";
import { TherapistTermsModal } from "@/components/therapist/TherapistTermsModal";
import { PolicyModal, type PolicyType } from "@/components/auth/PolicyModal";
import { authService } from "@/lib/api/auth";
import client from "@/lib/api/client";
import { Eye, EyeOff, BadgeCheck } from "lucide-react";

// ── Password strength helpers ──────────────────────────────────────────────
function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
  checks: { label: string; pass: boolean }[];
} {
  const checks = [
    { label: "At least 8 characters", pass: pw.length >= 8 },
    { label: "Uppercase letter (A–Z)", pass: /[A-Z]/.test(pw) },
    { label: "Lowercase letter (a–z)", pass: /[a-z]/.test(pw) },
    { label: "Number (0–9)", pass: /\d/.test(pw) },
    { label: "Special character (!@#…)", pass: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const label =
    score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : score === 4 ? "Strong" : "Very Strong";
  const color =
    score <= 1 ? "#ef4444" : score === 2 ? "#f97316" : score === 3 ? "#eab308" : score === 4 ? "#22c55e" : "#16a34a";
  return { score, label, color, checks };
}

const inputCls =
  "w-full px-4 py-3 rounded-2xl border-2 border-[rgba(75,52,37,0.12)] focus:border-[#fe814b] focus:outline-none bg-white text-[#4b3425] transition-colors placeholder:text-[rgba(75,52,37,0.35)]";

const specializationOptions = [
  "Anxiety", "Depression", "PTSD", "Addiction", "Relationship Issues",
  "Grief & Loss", "Eating Disorders", "ADHD", "Bipolar Disorder", "OCD",
  "Stress Management", "Life Transitions",
];

const languageOptions = [
  "English", "Swahili", "French", "Igbo", "Yoruba", "Spanish", "Mandarin", "Arabic", "Hindi",
];

function TherapistSignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("token") ?? "";
  const inviteEmail = searchParams.get("email") ?? "";

  const [step, setStep] = useState(1);
  const [inviteValid, setInviteValid] = useState<boolean | null>(inviteToken ? null : false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    license_state: "",
    specializations: [] as string[],
    years_experience: "",
    education_degree: "",
    education_institution: "",
    bio: "",
    session_rate: "",
    languages: [] as string[],
    password: "",
    password_confirmation: "",
    agree_to_terms: false,
  });

  // Validate invite token on mount
  useEffect(() => {
    if (!inviteToken) return;
    // Pre-fill email from URL param
    if (inviteEmail) {
      setFormData((prev) => ({ ...prev, email: inviteEmail }));
    }
    // Verify the token is still valid
    client.get(`/api/v1/auth/therapist-invite/${inviteToken}`)
      .then((res) => {
        const email = res.data?.data?.email ?? inviteEmail;
        setFormData((prev) => ({ ...prev, email }));
        setInviteValid(true);
      })
      .catch(() => setInviteValid(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteToken]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType | null>(null);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const passwordsMatch =
    formData.password_confirmation.length > 0 && formData.password === formData.password_confirmation;
  const passwordsMismatch =
    confirmTouched && formData.password_confirmation.length > 0 && formData.password !== formData.password_confirmation;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleMultiSelect = (value: string, field: "specializations" | "languages") => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleNext = () => { if (step < 3) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }
    if (pwStrength.score < 3) {
      setError("Please choose a stronger password before continuing.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        role_slug: "therapist",
        ...(inviteToken ? { invite_token: inviteToken } : {}),
      });
      router.push("/therapist/dashboard");
    } catch (err: unknown) {
      let message = "Signup failed. Please try again.";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } } };
        if (e.response?.data?.message) message = e.response.data.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Live earnings preview
  const rate = Number(formData.session_rate) || 0;
  const commissionRate = rate <= 5000 ? 0.1 : rate <= 10000 ? 0.15 : rate <= 20000 ? 0.18 : 0.2;
  const foundingRate = Math.max(commissionRate - 0.03, 0.07);
  const netStandard = Math.round(rate * (1 - commissionRate));
  const netFounding = Math.round(rate * (1 - foundingRate));

  return (
    <>
      <div className="min-h-screen bg-[#f7f4f2] flex">
        {/* ── Left Panel (Form) ── */}
        <div className="flex-1 flex items-start justify-center p-6 md:p-10 overflow-y-auto">
          <div className="w-full max-w-2xl py-6">
            {/* Logo */}
            <Link href="/" className="inline-block mb-8">
              <Image src="/logo.svg" alt="Onwynd" width={130} height={36} priority />
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#4b3425] mb-1">
                Join as a Therapist
              </h1>
              <p className="text-base text-[rgba(31,22,15,0.55)]">
                Help people on their mental health journey
              </p>
            </div>

            {/* Step progress */}
            <div className="flex items-center gap-2 mb-2">
              {["Personal Info", "Professional", "Account Setup"].map((label, i) => {
                const idx = i + 1;
                return (
                  <div key={label} className="flex items-center flex-1 gap-2">
                    <div
                      className={`h-2 rounded-full flex-1 transition-all duration-300 ${
                        idx <= step ? "bg-[#fe814b]" : "bg-[#e5ead7]"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[rgba(31,22,15,0.55)] mb-6">
              Step {step} of 3 —{" "}
              {step === 1 ? "Personal Info" : step === 2 ? "Professional" : "Account Setup"}
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ── Step 1: Personal ── */}
              {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-xl font-bold text-[#4b3425]">Personal Information</h2>

                  {/* Invited banner */}
                  {inviteToken && inviteValid === true && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#e5ead7] border border-[#9bb068]">
                      <BadgeCheck className="w-5 h-5 text-[#3d4a26] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[#3d4a26]">You were personally invited</p>
                        <p className="text-xs text-[rgba(31,22,15,0.6)] mt-0.5">
                          Your email is pre-filled and verified. Complete your profile to get started.
                        </p>
                      </div>
                    </div>
                  )}
                  {inviteToken && inviteValid === false && (
                    <div className="p-4 rounded-2xl bg-red-50 border border-red-200">
                      <p className="text-sm text-red-700 font-semibold">
                        This invite link is invalid or has expired. You can still sign up without an invite.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        First Name <span className="text-[#fe814b]">*</span>
                      </label>
                      <input type="text" name="first_name" id="first_name" value={formData.first_name}
                        onChange={handleInputChange} required className={inputCls} placeholder="Jane" />
                    </div>
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Last Name <span className="text-[#fe814b]">*</span>
                      </label>
                      <input type="text" name="last_name" id="last_name" value={formData.last_name}
                        onChange={handleInputChange} required className={inputCls} placeholder="Smith" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                      Email Address <span className="text-[#fe814b]">*</span>
                      {inviteValid && <span className="ml-2 text-[10px] font-semibold text-[#3d4a26] bg-[#e5ead7] px-2 py-0.5 rounded-full">Verified via invite</span>}
                    </label>
                    <input type="email" name="email" id="email" value={formData.email}
                      onChange={handleInputChange} required
                      readOnly={!!inviteValid}
                      className={`${inputCls} ${inviteValid ? "opacity-75 cursor-not-allowed bg-[#f0f4eb]" : ""}`}
                      placeholder="jane.smith@email.com" />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                      Phone Number <span className="text-[#fe814b]">*</span>
                    </label>
                    <input type="tel" name="phone" id="phone" value={formData.phone}
                      onChange={handleInputChange} required className={inputCls} placeholder="+234 800 000 0000" />
                  </div>

                  {/* How Onwynd pays you */}
                  <div className="bg-[#e5ead7] rounded-2xl p-5">
                    <p className="text-sm font-bold text-[#3d4a26] mb-3 flex items-center gap-2">
                      <span>💰</span> How Onwynd Pays You
                    </p>
                    <div className="space-y-1.5 text-xs text-[rgba(31,22,15,0.7)]">
                      <p>✓ You set your own rate — any amount, no minimum.</p>
                      <p>✓ Commission: 10% (up to ₦5K) · 15% (₦5K–₦10K) · 18% (₦10K–₦20K) · 20% (above ₦20K).</p>
                      <p>✓ Founding Therapists joining now pay 3% less — locked 24 months.</p>
                      <p>✓ Corporate and individual bookings: same rate, same commission.</p>
                      <p>✓ Payouts every Monday, within 7 days. No minimum threshold.</p>
                    </div>
                  </div>

                  <button type="button" onClick={handleNext}
                    className="w-full px-8 py-4 rounded-full bg-[#fe814b] text-white text-base font-bold hover:opacity-90 transition-all duration-300">
                    Continue →
                  </button>
                </div>
              )}

              {/* ── Step 2: Professional ── */}
              {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-xl font-bold text-[#4b3425]">Professional Information</h2>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="license_number" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        License Number <span className="text-[#fe814b]">*</span>
                      </label>
                      <input type="text" name="license_number" id="license_number" value={formData.license_number}
                        onChange={handleInputChange} required className={inputCls} placeholder="PSY12345" />
                    </div>
                    <div>
                      <label htmlFor="license_state" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        License State / Region <span className="text-[#fe814b]">*</span>
                      </label>
                      <input type="text" name="license_state" id="license_state" value={formData.license_state}
                        onChange={handleInputChange} required className={inputCls} placeholder="Lagos" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#4b3425] mb-2">
                      Specializations <span className="text-[#fe814b]">*</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {specializationOptions.map((spec) => (
                        <button key={spec} type="button" onClick={() => handleMultiSelect(spec, "specializations")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold text-left transition-all ${
                            formData.specializations.includes(spec)
                              ? "bg-[#fe814b] text-white"
                              : "bg-white border-2 border-[rgba(75,52,37,0.12)] text-[#4b3425] hover:border-[#fe814b]"
                          }`}>
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="years_experience" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Years of Experience
                      </label>
                      <input type="number" name="years_experience" id="years_experience"
                        value={formData.years_experience} onChange={handleInputChange}
                        min="0" className={inputCls} placeholder="5" />
                    </div>
                    <div>
                      <label htmlFor="session_rate" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Session Rate (₦)
                      </label>
                      <input type="number" name="session_rate" id="session_rate"
                        value={formData.session_rate} onChange={handleInputChange}
                        min="0" className={inputCls} placeholder="e.g. 8000" />
                      {rate > 0 && (
                        <div className="mt-2 bg-[#e5ead7] rounded-xl p-3 text-xs">
                          <p className="text-[#3d4a26] font-bold mb-1">Live Earnings Preview</p>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[rgba(31,22,15,0.55)]">Standard: </span>
                              <span className="font-bold text-[#4b3425]">₦{netStandard.toLocaleString()}/session</span>
                            </div>
                            <div>
                              <span className="text-[rgba(31,22,15,0.55)]">Founding: </span>
                              <span className="font-bold text-[#3d4a26]">₦{netFounding.toLocaleString()}/session</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="education_degree" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Degree
                      </label>
                      <input type="text" name="education_degree" id="education_degree"
                        value={formData.education_degree} onChange={handleInputChange}
                        className={inputCls} placeholder="Ph.D. in Psychology" />
                    </div>
                    <div>
                      <label htmlFor="education_institution" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Institution
                      </label>
                      <input type="text" name="education_institution" id="education_institution"
                        value={formData.education_institution} onChange={handleInputChange}
                        className={inputCls} placeholder="University of Lagos" />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={handleBack}
                      className="flex-1 px-8 py-4 rounded-full border-2 border-[#4b3425] text-[#4b3425] font-bold hover:bg-[#4b3425] hover:text-white transition-all duration-300">
                      Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="flex-1 px-8 py-4 rounded-full bg-[#fe814b] text-white font-bold hover:opacity-90 transition-all duration-300">
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 3: Account Setup ── */}
              {step === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <h2 className="text-xl font-bold text-[#4b3425]">Complete Your Profile</h2>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                      Professional Bio
                    </label>
                    <textarea name="bio" id="bio" value={formData.bio} onChange={handleInputChange}
                      rows={3} className={`${inputCls} resize-none`}
                      placeholder="Tell clients about your approach and experience…" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#4b3425] mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {languageOptions.map((lang) => (
                        <button key={lang} type="button" onClick={() => handleMultiSelect(lang, "languages")}
                          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                            formData.languages.includes(lang)
                              ? "bg-[#fe814b] text-white"
                              : "bg-white border-2 border-[rgba(75,52,37,0.12)] text-[#4b3425] hover:border-[#fe814b]"
                          }`}>
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password section */}
                  <div className="pt-4 border-t border-[rgba(75,52,37,0.1)] space-y-4">
                    <h3 className="text-base font-bold text-[#4b3425]">Secure Your Account</h3>

                    <div>
                      <label htmlFor="password" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Password <span className="text-[#fe814b]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password" id="password" value={formData.password}
                          onChange={handleInputChange} onFocus={() => setPasswordTouched(true)}
                          required minLength={8} className={`${inputCls} pr-12`} placeholder="Min. 8 characters"
                        />
                        <button type="button" onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(31,22,15,0.4)] hover:text-[#4b3425] transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}>
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* Strength meter */}
                      {passwordTouched && formData.password.length > 0 && (
                        <div className="mt-2.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1 flex-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                  style={{ backgroundColor: s <= pwStrength.score ? pwStrength.color : "#e5e7eb" }} />
                              ))}
                            </div>
                            <span className="text-xs font-bold" style={{ color: pwStrength.color }}>
                              {pwStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {pwStrength.checks.map((chk) => (
                              <div key={chk.label} className="flex items-center gap-1.5">
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${chk.pass ? "bg-[#22c55e]" : "bg-[#e5e7eb]"}`}>
                                  {chk.pass && (
                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                      <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-[10px] ${chk.pass ? "text-[#3d4a26]" : "text-[rgba(31,22,15,0.4)]"}`}>
                                  {chk.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="password_confirmation" className="block text-sm font-bold text-[#4b3425] mb-1.5">
                        Confirm Password <span className="text-[#fe814b]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? "text" : "password"}
                          name="password_confirmation" id="password_confirmation"
                          value={formData.password_confirmation} onChange={handleInputChange}
                          onFocus={() => setConfirmTouched(true)} required minLength={8}
                          className={`${inputCls} pr-12 ${passwordsMatch ? "border-[#22c55e] focus:border-[#22c55e]" : passwordsMismatch ? "border-red-400 focus:border-red-400" : ""}`}
                          placeholder="Re-enter your password"
                        />
                        <button type="button" onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(31,22,15,0.4)] hover:text-[#4b3425] transition-colors"
                          aria-label={showConfirm ? "Hide password" : "Show password"}>
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {formData.password_confirmation.length > 0 && (
                          <div className={`absolute right-11 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center ${passwordsMatch ? "bg-[#22c55e]" : "bg-red-400"}`}>
                            {passwordsMatch ? (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M3 3l4 4M7 3L3 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      {passwordsMismatch && <p className="text-xs text-red-500 mt-1.5 font-semibold">Passwords do not match</p>}
                      {passwordsMatch && <p className="text-xs text-[#22c55e] mt-1.5 font-semibold">Passwords match ✓</p>}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#f7f4f2] border border-[rgba(31,22,15,0.08)]">
                    <input type="checkbox" name="agree_to_terms" id="agree_to_terms"
                      checked={formData.agree_to_terms} onChange={handleInputChange}
                      required className="mt-0.5 w-5 h-5 rounded accent-[#fe814b] flex-shrink-0 cursor-pointer" />
                    <label htmlFor="agree_to_terms" className="text-sm text-[rgba(31,22,15,0.55)] leading-relaxed">
                      I agree to the{" "}
                      <button type="button" onClick={() => setShowTermsModal(true)}
                        className="text-[#4b3425] font-bold hover:text-[#fe814b] underline underline-offset-2 transition-colors">
                        Therapist Terms
                      </button>{" "}
                      (click to read in full),{" "}
                      <button type="button" onClick={() => setPolicyModal("terms")}
                        className="text-[#4b3425] font-bold hover:text-[#fe814b] underline underline-offset-2 transition-colors">
                        Terms of Service
                      </button>
                      , and{" "}
                      <button type="button" onClick={() => setPolicyModal("privacy")}
                        className="text-[#4b3425] font-bold hover:text-[#fe814b] underline underline-offset-2 transition-colors">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={handleBack}
                      className="flex-1 px-8 py-4 rounded-full border-2 border-[#4b3425] text-[#4b3425] font-bold hover:bg-[#4b3425] hover:text-white transition-all duration-300">
                      Back
                    </button>
                    <button type="submit" disabled={isLoading || passwordsMismatch || !formData.agree_to_terms}
                      className="flex-1 px-8 py-4 rounded-full bg-[#fe814b] text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Account…
                        </span>
                      ) : "Create Account"}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-[rgba(31,22,15,0.55)] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#4b3425] font-bold hover:text-[#fe814b]">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#9bb068] to-[#4b3425] items-center justify-center p-16">
          <div className="max-w-md text-center text-white">
            <div className="text-8xl mb-8">🌿</div>
            <h2 className="text-3xl font-bold mb-4">Make a Real Difference</h2>
            <p className="text-lg text-white/80 mb-8">
              Join Onwynd to reach more clients, manage your practice efficiently, and make a meaningful
              impact on mental health in Africa.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { stat: "0%", label: "Minimum Rate" },
                { stat: "20%", label: "Max Commission" },
                { stat: "Mon", label: "Weekly Payouts" },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-2xl p-4">
                  <p className="text-2xl font-bold">{s.stat}</p>
                  <p className="text-xs text-white/70 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TherapistTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setFormData((prev) => ({ ...prev, agree_to_terms: true }))}
      />

      {policyModal && (
        <PolicyModal
          isOpen={true}
          onClose={() => setPolicyModal(null)}
          type={policyModal}
        />
      )}
    </>
  );
}

export default function TherapistSignupPage() {
  return (
    <Suspense>
      <TherapistSignupPageInner />
    </Suspense>
  );
}
