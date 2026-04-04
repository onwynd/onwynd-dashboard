"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/auth";
import { Eye, EyeOff } from "lucide-react";
import { PolicyModal, type PolicyType } from "@/components/auth/PolicyModal";

const inputCls =
  "w-full px-4 py-3 rounded-2xl border-2 border-[rgba(75,52,37,0.12)] focus:border-[#9bb068] focus:outline-none bg-white text-[#4b3425] transition-colors placeholder:text-[rgba(75,52,37,0.35)]";

export default function InstitutionalSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "university" as "university" | "corporate" | "faith_ngo",
    industry: "",
    size: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_phone: "",
    admin_position: "",
    password: "",
    password_confirmation: "",
    agree_to_terms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [policyModal, setPolicyModal] = useState<PolicyType | null>(null);

  const passwordsMatch =
    formData.password_confirmation.length > 0 && formData.password === formData.password_confirmation;
  const passwordsMismatch =
    formData.password_confirmation.length > 0 && formData.password !== formData.password_confirmation;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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

    setIsLoading(true);
    try {
      await authService.register({
        first_name: formData.admin_first_name,
        last_name: formData.admin_last_name,
        email: formData.admin_email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.admin_phone,
        role_slug: "institutional",
      });
      router.push("/institutional/dashboard");
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

  const orgTypeInfo = {
    university: {
      emoji: "🎓",
      label: "University / College Package",
      features: ["Student and staff coverage", "Anonymous reporting & wellbeing dashboard", "Dedicated campus counsellor network"],
    },
    corporate: {
      emoji: "🏢",
      label: "Corporate Wellness Package",
      features: ["Employee Assistance Programme (EAP)", "Workforce mental health KPI tracking", "Manager resilience training"],
    },
    faith_ngo: {
      emoji: "🤝",
      label: "Faith-Based / NGO Package",
      features: ["Community member coverage", "Pastoral care integration", "Subsidised session rates available"],
    },
  };

  const orgInfo = orgTypeInfo[formData.organization_type];

  return (
    <>
    <div className="min-h-screen bg-[#f7f4f2] flex">
      {/* ── Left Panel (Form) ── */}
      <div className="flex-1 flex items-start justify-center p-6 md:p-10 overflow-y-auto">
        <div className="w-full max-w-xl py-6">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <Image src="/logo.svg" alt="Onwynd" width={130} height={36} priority />
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#4b3425] mb-1">
              Institutional Account
            </h1>
            <p className="text-base text-[rgba(31,22,15,0.55)]">
              Empower your organization with mental health support
            </p>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`h-2 rounded-full flex-1 transition-all duration-300 ${i <= step ? "bg-[#9bb068]" : "bg-[#e5ead7]"}`} />
              </div>
            ))}
          </div>
          <p className="text-xs text-[rgba(31,22,15,0.55)] mb-6">
            Step {step} of 3 —{" "}
            {step === 1 ? "Organization Details" : step === 2 ? "Admin Contact" : "Account Setup"}
          </p>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Step 1: Organization Details ── */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold text-[#4b3425]">Organization Details</h2>

                <div>
                  <label htmlFor="organization_name" className="block text-sm font-bold text-[#4b3425] mb-2">
                    Organization Name <span className="text-[#fe814b]">*</span>
                  </label>
                  <input type="text" name="organization_name" id="organization_name"
                    value={formData.organization_name} onChange={handleInputChange}
                    required className={inputCls} placeholder="Acme University" />
                </div>

                <div>
                  <label htmlFor="organization_type" className="block text-sm font-bold text-[#4b3425] mb-2">
                    Organization Type <span className="text-[#fe814b]">*</span>
                  </label>
                  <select name="organization_type" id="organization_type"
                    value={formData.organization_type} onChange={handleInputChange}
                    required className={inputCls}>
                    <option value="university">University / College</option>
                    <option value="corporate">Corporate / Business</option>
                    <option value="faith_ngo">Faith-Based / NGO</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="industry" className="block text-sm font-bold text-[#4b3425] mb-2">
                      Industry
                    </label>
                    <input type="text" name="industry" id="industry" value={formData.industry}
                      onChange={handleInputChange} className={inputCls} placeholder="Education" />
                  </div>
                  <div>
                    <label htmlFor="size" className="block text-sm font-bold text-[#4b3425] mb-2">
                      Organization Size
                    </label>
                    <select name="size" id="size" value={formData.size}
                      onChange={handleInputChange} className={inputCls}>
                      <option value="">Select size</option>
                      <option value="1-50">1–50 employees</option>
                      <option value="51-200">51–200 employees</option>
                      <option value="201-500">201–500 employees</option>
                      <option value="501-1000">501–1,000 employees</option>
                      <option value="1000+">1,000+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Org type benefit highlight */}
                <div className="bg-[#e5ead7] rounded-2xl p-5">
                  <p className="text-sm font-bold text-[#3d4a26] mb-2">
                    {orgInfo.emoji} {orgInfo.label}
                  </p>
                  <ul className="space-y-1 text-xs text-[rgba(31,22,15,0.7)]">
                    {orgInfo.features.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                </div>

                <button type="button" onClick={handleNext}
                  className="w-full px-8 py-4 rounded-full bg-[#9bb068] text-white text-base font-bold hover:opacity-90 transition-all duration-300">
                  Continue →
                </button>
              </div>
            )}

            {/* ── Step 2: Admin Contact ── */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold text-[#4b3425]">Administrator Contact</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin_first_name" className="block text-sm font-bold text-[#4b3425] mb-2">
                      First Name <span className="text-[#fe814b]">*</span>
                    </label>
                    <input type="text" name="admin_first_name" id="admin_first_name"
                      value={formData.admin_first_name} onChange={handleInputChange}
                      required className={inputCls} placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="admin_last_name" className="block text-sm font-bold text-[#4b3425] mb-2">
                      Last Name <span className="text-[#fe814b]">*</span>
                    </label>
                    <input type="text" name="admin_last_name" id="admin_last_name"
                      value={formData.admin_last_name} onChange={handleInputChange}
                      required className={inputCls} placeholder="Doe" />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin_email" className="block text-sm font-bold text-[#4b3425] mb-2">
                    Email Address <span className="text-[#fe814b]">*</span>
                  </label>
                  <input type="email" name="admin_email" id="admin_email"
                    value={formData.admin_email} onChange={handleInputChange}
                    required className={inputCls} placeholder="john.doe@acme.edu" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admin_phone" className="block text-sm font-bold text-[#4b3425] mb-2">
                      Phone Number
                    </label>
                    <input type="tel" name="admin_phone" id="admin_phone"
                      value={formData.admin_phone} onChange={handleInputChange}
                      className={inputCls} placeholder="+234 800 000 0000" />
                  </div>
                  <div>
                    <label htmlFor="admin_position" className="block text-sm font-bold text-[#4b3425] mb-2">
                      Position / Title
                    </label>
                    <input type="text" name="admin_position" id="admin_position"
                      value={formData.admin_position} onChange={handleInputChange}
                      className={inputCls} placeholder="Wellness Director" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={handleBack}
                    className="flex-1 px-8 py-4 rounded-full border-2 border-[#4b3425] text-[#4b3425] font-bold hover:bg-[#4b3425] hover:text-white transition-all duration-300">
                    Back
                  </button>
                  <button type="button" onClick={handleNext}
                    className="flex-1 px-8 py-4 rounded-full bg-[#9bb068] text-white font-bold hover:opacity-90 transition-all duration-300">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Account Setup ── */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <h2 className="text-xl font-bold text-[#4b3425]">Secure Your Account</h2>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-[#4b3425] mb-2">
                    Password <span className="text-[#fe814b]">*</span>
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} name="password" id="password"
                      value={formData.password} onChange={handleInputChange}
                      required minLength={8} className={`${inputCls} pr-12`} placeholder="Min. 8 characters" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(31,22,15,0.4)] hover:text-[#4b3425] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-bold text-[#4b3425] mb-2">
                    Confirm Password <span className="text-[#fe814b]">*</span>
                  </label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} name="password_confirmation" id="password_confirmation"
                      value={formData.password_confirmation} onChange={handleInputChange}
                      required minLength={8}
                      className={`${inputCls} pr-12 ${passwordsMatch ? "border-[#22c55e] focus:border-[#22c55e]" : passwordsMismatch ? "border-red-400 focus:border-red-400" : ""}`}
                      placeholder="Re-enter your password" />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[rgba(31,22,15,0.4)] hover:text-[#4b3425] transition-colors"
                      aria-label={showConfirm ? "Hide password" : "Show password"}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordsMismatch && <p className="text-xs text-red-500 mt-1.5 font-semibold">Passwords do not match</p>}
                  {passwordsMatch && <p className="text-xs text-[#22c55e] mt-1.5 font-semibold">Passwords match ✓</p>}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#e5ead7]/40 border border-[rgba(155,176,104,0.2)]">
                  <input type="checkbox" name="agree_to_terms" id="agree_to_terms"
                    checked={formData.agree_to_terms} onChange={handleInputChange}
                    required className="mt-1 w-5 h-5 rounded accent-[#9bb068] flex-shrink-0 cursor-pointer" />
                  <label htmlFor="agree_to_terms" className="text-sm text-[rgba(31,22,15,0.55)]">
                    I agree to the{" "}
                    <button type="button" onClick={() => setPolicyModal("terms")}
                      className="text-[#4b3425] font-bold hover:text-[#9bb068] underline underline-offset-2 transition-colors">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" onClick={() => setPolicyModal("privacy")}
                      className="text-[#4b3425] font-bold hover:text-[#9bb068] underline underline-offset-2 transition-colors">
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={handleBack}
                    className="flex-1 px-8 py-4 rounded-full border-2 border-[#4b3425] text-[#4b3425] font-bold hover:bg-[#4b3425] hover:text-white transition-all duration-300">
                    Back
                  </button>
                  <button type="submit" disabled={isLoading || !formData.agree_to_terms}
                    className="flex-1 px-8 py-4 rounded-full bg-[#9bb068] text-white font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300">
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

          <p className="mt-8 text-center text-[rgba(31,22,15,0.55)] text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4b3425] font-bold hover:text-[#9bb068]">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#9bb068] to-[#3d4a26] items-center justify-center p-16">
        <div className="max-w-lg text-center text-white">
          <div className="text-8xl mb-8">🏢</div>
          <h2 className="text-3xl font-bold mb-4">Support Your Entire Organization</h2>
          <p className="text-xl text-white/90 mb-10">
            Provide comprehensive mental health support to all your employees, students, or members
            through our institutional platform.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { stat: "200+", label: "Organizations" },
              { stat: "50K+", label: "Users Supported" },
              { stat: "94%", label: "Satisfaction Rate" },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-5">
                <p className="text-2xl font-bold">{s.stat}</p>
                <p className="text-xs text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

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
