"use client";

import Image from "next/image";
import { useState } from "react";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState<string>("");

  const sections = [
    { id: "introduction", title: "Introduction", icon: "/icons/heartbeat.svg" },
    { id: "information-collect", title: "Information We Collect", icon: "/icons/control.svg" },
    { id: "how-use", title: "How We Use Your Information", icon: "/icons/microscope.svg" },
    { id: "hipaa", title: "Data Privacy & Security", icon: "/icons/lock.svg" },
    { id: "data-sharing", title: "Data Sharing & Disclosure", icon: "/icons/group-users.svg" },
    { id: "security", title: "Data Security", icon: "/icons/check.svg" },
    { id: "your-rights", title: "Your Privacy Rights", icon: "/icons/heart.svg" },
    { id: "retention", title: "Data Retention", icon: "/icons/settings.svg" },
    { id: "children", title: "Children's Privacy", icon: "/icons/mobile-phone.svg" },
    { id: "international", title: "International Users", icon: "/icons/location.svg" },
    { id: "changes", title: "Changes to This Policy", icon: "/icons/question.svg" },
    { id: "contact", title: "Contact Us", icon: "/icons/email.svg" },
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
          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-[#4b3425] mb-4">Privacy Policy</h1>
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
              <div id="introduction" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/heartbeat.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Introduction</h2>
                </div>
                <p className="text-xl text-[rgba(31,22,15,0.64)] leading-relaxed">
                  At Onwynd, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mental health AI platform. Please read this privacy policy carefully.
                </p>
              </div>

              <div id="information-collect" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/control.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Information We Collect</h2>
                </div>
                <h3 className="text-2xl font-bold text-[#4b3425] mb-4 mt-8">Personal Information</h3>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
                <ul className="space-y-2 mb-6">
                  {["Register for an account", "Use our AI chatbot services", "Complete assessments", "Contact customer support", "Subscribe to our newsletter"].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                      <span className="text-lg text-[rgba(31,22,15,0.64)]">{item}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="text-2xl font-bold text-[#4b3425] mb-4 mt-8">Health Information</h3>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">As a mental health platform, we collect sensitive health information including:</p>
                <div className="bg-[#fef9f5] border-l-4 border-[#fe814b] rounded-lg p-6 mb-6">
                  <ul className="space-y-2">
                    {["Mental health symptoms and concerns", "Assessment responses and scores", "Conversation history with our AI", "Progress tracking and mood data", "Goals and treatment preferences"].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Image src="/icons/heartbeat.svg" alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                        <span className="text-lg text-[rgba(31,22,15,0.64)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div id="how-use" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/microscope.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">How We Use Your Information</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-4">We use the information we collect to:</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {["Provide personalized AI-powered mental health support", "Improve our AI models and therapeutic approaches", "Track your progress and provide insights", "Send service-related communications", "Conduct research to advance mental health care", "Ensure platform security and prevent fraud", "Comply with legal obligations", "Develop new features and services"].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#f7f4f2] rounded-2xl p-4">
                      <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-0.5 flex-shrink-0" />
                      <span className="text-base text-[#4b3425]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="hipaa" className="mb-16 scroll-mt-24">
                <div className="bg-[#e5ead7] rounded-3xl p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src="/icons/lock.svg" alt="" width={32} height={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-[#4b3425] m-0">Data Privacy &amp; Security</h2>
                  </div>
                  <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">
                    Onwynd is committed to data privacy and security. Our platform is designed in alignment with HIPAA principles, with SOC 2 Type II certification currently in progress.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Encrypted", desc: "In transit and at rest using industry-standard protocols" },
                      { title: "Secure Storage", desc: "Stored on secure servers with industry-standard protection" },
                      { title: "Access Control", desc: "Accessed only by authorized personnel" },
                      { title: "Protected", desc: "By comprehensive security measures" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-2xl p-6">
                        <h4 className="text-xl font-bold text-[#4b3425] mb-2">{item.title}</h4>
                        <p className="text-base text-[rgba(31,22,15,0.64)]">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="data-sharing" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/group-users.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Data Sharing &amp; Disclosure</h2>
                </div>
                <div className="bg-[#fef9f5] border border-[#fe814b] rounded-2xl p-6 mb-6">
                  <p className="text-xl font-bold text-[#4b3425] mb-2">We do not sell your personal information.</p>
                  <p className="text-lg text-[rgba(31,22,15,0.64)]">We may share your information only in the following circumstances:</p>
                </div>
                <div className="space-y-6">
                  {[
                    { title: "With Your Consent", body: "When you explicitly authorize us to do so, such as connecting with your healthcare provider.", color: "#9bb068" },
                    { title: "Service Providers", body: "With trusted third-party providers who are bound by strict confidentiality agreements.", color: "#9bb068" },
                    { title: "Legal Requirements", body: "If required by law or to protect the safety of individuals.", color: "#9bb068" },
                    { title: "Emergency Situations", body: "In cases of imminent danger to yourself or others, we may share relevant information with emergency services.", color: "#fe814b" },
                  ].map((item) => (
                    <div key={item.title} className="border-l-4 pl-6" style={{ borderColor: item.color }}>
                      <h3 className="text-xl font-bold text-[#4b3425] mb-2">{item.title}</h3>
                      <p className="text-lg text-[rgba(31,22,15,0.64)]">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="security" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/check.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Data Security</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">We implement comprehensive security measures to protect your information:</p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { icon: "/icons/lock.svg", title: "End-to-End Encryption", desc: "All communications are encrypted" },
                    { icon: "/icons/check.svg", title: "Secure Storage", desc: "Regular backups and secure data centers" },
                    { icon: "/icons/settings.svg", title: "Multi-Factor Auth", desc: "Additional layer of account protection" },
                    { icon: "/icons/heartbeat.svg", title: "Security Audits", desc: "Regular testing and monitoring" },
                    { icon: "/icons/microscope.svg", title: "Staff Training", desc: "Employee data protection education" },
                    { icon: "/icons/control.svg", title: "Incident Response", desc: "Rapid response protocols" },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#f7f4f2] rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image src={item.icon} alt="" width={24} height={24} />
                      </div>
                      <h4 className="text-lg font-bold text-[#4b3425] mb-2">{item.title}</h4>
                      <p className="text-sm text-[rgba(31,22,15,0.64)]">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="your-rights" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/heart.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Your Privacy Rights</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">You have the following rights regarding your personal information:</p>
                <div className="space-y-4">
                  {[
                    { right: "Access", desc: "Request a copy of your data" },
                    { right: "Correction", desc: "Update inaccurate information" },
                    { right: "Deletion", desc: "Request deletion of your data" },
                    { right: "Portability", desc: "Receive your data in a transferable format" },
                    { right: "Restriction", desc: "Limit how we use your information" },
                    { right: "Objection", desc: "Object to certain processing activities" },
                    { right: "Withdraw Consent", desc: "Revoke previously granted consent" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 bg-white border-2 border-[#f7f4f2] rounded-2xl p-6 hover:border-[#9bb068] transition-colors">
                      <div className="w-8 h-8 bg-[#9bb068] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</div>
                      <div>
                        <h4 className="text-lg font-bold text-[#4b3425] mb-1">{item.right}</h4>
                        <p className="text-base text-[rgba(31,22,15,0.64)]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mt-6">
                  To exercise these rights, please contact us at{" "}
                  <a href="mailto:privacy@onwynd.com" className="text-[#9bb068] font-semibold hover:underline">privacy@onwynd.com</a>.
                </p>
              </div>

              <div id="retention" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/settings.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Data Retention</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed mb-6">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <div className="bg-[#f7f4f2] rounded-2xl p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { type: "Account Information", period: "Until account deletion" },
                      { type: "Conversation History", period: "7 years (for clinical continuity)" },
                      { type: "Assessment Data", period: "Until account deletion" },
                      { type: "Anonymized Research Data", period: "Indefinitely" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Image src="/icons/check.svg" alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-[#4b3425]">{item.type}</p>
                          <p className="text-[rgba(31,22,15,0.64)]">{item.period}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div id="children" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/mobile-phone.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Children&apos;s Privacy</h2>
                </div>
                <div className="bg-[#fef9f5] border-l-4 border-[#fe814b] rounded-lg p-6">
                  <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed">
                    Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
                  </p>
                </div>
              </div>

              <div id="international" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/location.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">International Users</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed">
                  Onwynd operates in the United States. If you access our services from outside the US, your information will be transferred to and processed in the United States. By using our services, you consent to this transfer and processing.
                </p>
              </div>

              <div id="changes" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#e5ead7] rounded-full flex items-center justify-center flex-shrink-0">
                    <Image src="/icons/question.svg" alt="" width={24} height={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#4b3425] m-0">Changes to This Privacy Policy</h2>
                </div>
                <p className="text-lg text-[rgba(31,22,15,0.64)] leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </div>

              <div id="contact" className="scroll-mt-24">
                <div className="bg-[#9bb068] rounded-3xl p-8 md:p-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Image src="/icons/email.svg" alt="" width={32} height={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white m-0">Contact Us</h2>
                  </div>
                  <p className="text-lg text-white leading-relaxed mb-6">
                    If you have questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Email</p>
                      <a href="mailto:privacy@onwynd.com" className="text-lg font-bold text-[#4b3425] hover:text-[#9bb068]">privacy@onwynd.com</a>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Phone</p>
                      <a href="tel:+2348084284742" className="text-lg font-bold text-[#4b3425] hover:text-[#9bb068]">+234 (808) 428-4742</a>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Address</p>
                      <p className="text-lg font-bold text-[#4b3425]">123 Admiralty Way<br />Lagos, NG 2344102</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6">
                      <p className="text-sm font-extrabold uppercase tracking-wider text-[#926247] mb-2">Privacy Officer</p>
                      <p className="text-lg font-bold text-[#4b3425]">Dr. Sarah Chen</p>
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
