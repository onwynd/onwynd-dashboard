"use client";

import Image from "next/image";
import { useState } from "react";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  const sections = [
    { id: "acceptance", title: "Acceptance of Terms", icon: "/icons/check.svg" },
    { id: "services", title: "Description of Services", icon: "/icons/heartbeat.svg" },
    { id: "eligibility", title: "Eligibility", icon: "/icons/mobile-phone.svg" },
    { id: "account", title: "User Accounts", icon: "/icons/control.svg" },
    { id: "prohibited", title: "Prohibited Conduct", icon: "/icons/lock.svg" },
    { id: "intellectual", title: "Intellectual Property", icon: "/icons/microscope.svg" },
    { id: "limitations", title: "Limitations of Liability", icon: "/icons/question.svg" },
    { id: "termination", title: "Termination", icon: "/icons/settings.svg" },
    { id: "governing", title: "Governing Law", icon: "/icons/location.svg" },
    { id: "changes", title: "Changes to Terms", icon: "/icons/heart.svg" },
    { id: "contact", title: "Contact Information", icon: "/icons/email.svg" },
  ];

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 px-4 md:px-8 bg-[#f7f4f2]">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[123px] bg-[rgba(146,98,71,0.1)] mb-6">
            <div className="w-2 h-2 bg-[#926247] rounded-full" />
            <span className="text-[#926247] text-xs font-extrabold uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#4b3425] mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-[rgba(31,22,15,0.64)]">Last Updated: January 29, 2026</p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-6 px-4 md:px-8 bg-white sticky top-0 z-40 shadow-sm border-b border-[rgba(31,22,15,0.1)]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {sections.slice(0, 6).map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setActiveSection(section.id);
                }}
                className={`px-4 py-2 rounded-[1000px] text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? "bg-[#9bb068] text-white"
                    : "bg-[#f7f4f2] text-[#4b3425] hover:bg-[#e5ead7]"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content with Sidebar */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 self-start">
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    setActiveSection(section.id);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left ${
                    activeSection === section.id
                      ? "bg-[#9bb068] text-white"
                      : "hover:bg-[#f7f4f2] text-[#4b3425]"
                  }`}
                >
                  <Image
                    src={section.icon}
                    alt=""
                    width={20}
                    height={20}
                    className={activeSection === section.id ? "brightness-0 invert" : ""}
                  />
                  <span className="text-sm font-semibold">{section.title}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 max-w-[900px]">
            <div className="prose prose-lg max-w-none">
              <div id="acceptance" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/check.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Acceptance of Terms</h2>
                </div>
                <p className="text-xl text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">
                  By accessing or using the Onwynd platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                </p>
                <div className="bg-[#fef9f5] border-l-4 border-[#fe814b] rounded-lg p-6">
                  <p className="text-lg text-[rgba(31,22,15,0.64)]">
                    These terms constitute a legally binding agreement between you and Onwynd.
                  </p>
                </div>
              </div>

              <div id="services" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/heartbeat.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Description of Services</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">
                  Onwynd provides AI-powered mental health support services, including:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {["AI chatbot conversations", "Mental health assessments", "Progress tracking", "Personalized insights", "Educational resources", "Wellness tools"].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#f7f4f2] rounded-2xl p-4">
                      <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-0.5 flex-shrink-0" />
                      <span className="text-base text-[#4b3425]">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-[#fef9f5] border border-[#fe814b] rounded-2xl p-6">
                  <p className="text-lg font-bold text-[#4b3425] mb-2">Important Notice:</p>
                  <p className="text-base text-[rgba(31,22,15,0.64)]">
                    Our services are not a substitute for professional medical advice, diagnosis, or treatment. In case of emergency, please contact emergency services immediately.
                  </p>
                </div>
              </div>

              <div id="eligibility" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/mobile-phone.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Eligibility</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">To use Onwynd, you must:</p>
                <ul className="space-y-3">
                  {[
                    "Be at least 18 years of age",
                    "Have the legal capacity to enter into a binding agreement",
                    "Provide accurate and complete registration information",
                    "Comply with all applicable laws and regulations",
                    "Not be prohibited from using our services under any applicable laws",
                  ].map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                      <span className="text-lg text-[rgba(31,22,15,0.64)]">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div id="account" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/control.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">User Accounts</h2>
                </div>
                <div className="space-y-6">
                  {[
                    { title: "Account Creation", body: "You must create an account to access our services. You are responsible for maintaining the confidentiality of your account credentials." },
                    { title: "Account Security", body: "You are solely responsible for all activities that occur under your account. Notify us immediately of any unauthorized use." },
                    { title: "Account Termination", body: "We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity." },
                  ].map((item) => (
                    <div key={item.title} className="border-l-4 border-[#9bb068] pl-6">
                      <h3 className="text-xl font-bold text-[#4b3425] mb-2">{item.title}</h3>
                      <p className="text-lg text-[rgba(31,22,15,0.64)]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="prohibited" className="mb-16 scroll-mt-24">
                <div className="bg-[#e5ead7] rounded-3xl p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src="/icons/lock.svg" alt="" width={32} height={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#4b3425] m-0">Prohibited Conduct</h2>
                  </div>
                  <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">When using our services, you agree not to:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Misuse", desc: "Use services for illegal or unauthorized purposes" },
                      { title: "Impersonate", desc: "Pretend to be another person or entity" },
                      { title: "Harm", desc: "Transmit viruses or harmful code" },
                      { title: "Abuse", desc: "Harass or abuse other users or staff" },
                      { title: "Violate", desc: "Infringe on intellectual property rights" },
                      { title: "Manipulate", desc: "Attempt to circumvent security features" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6">
                        <h4 className="text-xl font-bold text-[#4b3425] mb-2">{item.title}</h4>
                        <p className="text-base text-[rgba(31,22,15,0.64)]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="intellectual" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/microscope.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Intellectual Property Rights</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">
                  All content, features, and functionality on Onwynd are owned by us and protected by intellectual property laws.
                </p>
                <div className="bg-[#f7f4f2] rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-[#4b3425] mb-4">What You Can Do:</h3>
                  <ul className="space-y-2">
                    {["Use our services for personal, non-commercial purposes", "Share your own content through the platform", "Download materials for personal use only"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                        <span className="text-base text-[rgba(31,22,15,0.64)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div id="limitations" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/question.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Limitations of Liability</h2>
                </div>
                <div className="bg-[#fef9f5] border border-[#fe814b] rounded-2xl p-6 mb-6">
                  <p className="text-lg font-bold text-[#4b3425] mb-2">Disclaimer of Warranties</p>
                  <p className="text-base text-[rgba(31,22,15,0.64)]">
                    Services are provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted or error-free operation.
                  </p>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed">
                  To the maximum extent permitted by law, Onwynd shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.
                </p>
              </div>

              <div id="termination" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/settings.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Termination</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">
                  We may terminate or suspend your account at our sole discretion, without prior notice, for:
                </p>
                <div className="space-y-3">
                  {["Violation of these Terms and Conditions", "Fraudulent or illegal activity", "Failure to pay applicable fees", "Extended period of inactivity", "Any other reason we deem appropriate"].map((reason, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-[#fe814b] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">{i + 1}</div>
                      <p className="text-lg text-[rgba(31,22,15,0.64)]">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="governing" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/location.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Governing Law</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed">
                  These Terms and Conditions are governed by the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts located in San Francisco County, California.
                </p>
              </div>

              <div id="changes" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/heart.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Changes to These Terms</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">
                  We reserve the right to modify these Terms and Conditions at any time. We will notify users of material changes via email or through the platform.
                </p>
                <div className="bg-[#f7f4f2] rounded-2xl p-6">
                  <p className="text-base text-[rgba(31,22,15,0.64)]">
                    Your continued use of our services after changes take effect constitutes your acceptance of the revised terms.
                  </p>
                </div>
              </div>

              <div id="contact" className="scroll-mt-24">
                <div className="bg-[#9bb068] rounded-3xl p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src="/icons/email.svg" alt="" width={32} height={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white m-0">Contact Information</h2>
                  </div>
                  <p className="text-lg text-white leading-relaxed mb-6">
                    For questions about these Terms and Conditions, please contact us:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Email</p>
                      <a href="mailto:legal@onwynd.com" className="text-lg font-bold text-[#4b3425] hover:text-[#9bb068]">legal@onwynd.com</a>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Address</p>
                      <p className="text-lg font-bold text-[#4b3425]">123 Mental Health Way<br />San Francisco, CA 94102</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
