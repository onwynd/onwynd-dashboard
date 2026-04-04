"use client";

import { useEffect, useRef, useState } from "react";

interface TherapistTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const COMMISSION_TIERS = [
  { band: "Up to ₦5,000",        standard: "10%", founding: "7%",  therapistKeeps: "90%", foundingKeeps: "93%" },
  { band: "₦5,001 – ₦10,000",   standard: "15%", founding: "12%", therapistKeeps: "85%", foundingKeeps: "88%" },
  { band: "₦10,001 – ₦20,000",  standard: "18%", founding: "15%", therapistKeeps: "82%", foundingKeeps: "85%" },
  { band: "Above ₦20,000",       standard: "20%", founding: "17%", therapistKeeps: "80%", foundingKeeps: "83%" },
];

const EARNINGS_BAND1 = [
  { rate: "₦2,000", fee: "₦200",   net: "₦1,800",  m20: "₦36,000",  m40: "₦72,000",  m60: "₦108,000" },
  { rate: "₦3,000", fee: "₦300",   net: "₦2,700",  m20: "₦54,000",  m40: "₦108,000", m60: "₦162,000" },
  { rate: "₦4,000", fee: "₦400",   net: "₦3,600",  m20: "₦72,000",  m40: "₦144,000", m60: "₦216,000" },
  { rate: "₦5,000", fee: "₦500",   net: "₦4,500",  m20: "₦90,000",  m40: "₦180,000", m60: "₦270,000" },
];

const EARNINGS_BAND4 = [
  { rate: "₦25,000", fee: "₦5,000",  net: "₦20,000", m10: "₦200,000", m20: "₦400,000", m30: "₦600,000" },
  { rate: "₦30,000", fee: "₦6,000",  net: "₦24,000", m10: "₦240,000", m20: "₦480,000", m30: "₦720,000" },
  { rate: "₦50,000", fee: "₦10,000", net: "₦40,000", m10: "₦400,000", m20: "₦800,000", m30: "₦1,200,000" },
];

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-[#4b3425] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <h3 className="text-base font-bold text-[#4b3425]">{title}</h3>
    </div>
  );
}

function InfoBox({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "warning";
}) {
  const styles =
    variant === "warning"
      ? "bg-[#fff8f5] border-l-4 border-[#fe814b] text-[#9c4221]"
      : "bg-[#e5ead7] border-l-4 border-[#9bb068] text-[#3d4a26]";
  return (
    <div className={`rounded-r-xl px-4 py-3 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export function TherapistTermsModal({
  isOpen,
  onClose,
  onAccept,
}: TherapistTermsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [md, setMd] = useState<string | null>(null);
  const [tiers, setTiers] = useState<
    { min: number; max: number | null; therapist_keep_percent: number }[] | null
  >(null);
  const [founding, setFounding] = useState<{ enabled: boolean; discount: number }>({
    enabled: true,
    discount: 3,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    fetch(`${base}/api/v1/public/therapist-terms`)
      .then((r) => r.json())
      .then((j) => setMd((j?.data ?? j)?.therapist_terms_md ?? null))
      .catch(() => {});
    fetch(`${base}/api/v1/public/commission`)
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data ?? j;
        if (d?.tiers) setTiers(d.tiers);
        setFounding({
          enabled: Boolean(d?.founding_enabled ?? true),
          discount: Number(d?.founding_discount_percent ?? 3),
        });
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[rgba(31,22,15,0.08)] flex-shrink-0 bg-[#f7f4f2]">
          <div>
            <h2 className="text-xl font-bold text-[#4b3425]">Therapist Terms of Service</h2>
            <p className="text-xs text-[rgba(31,22,15,0.5)] mt-0.5">
              Pricing, Commission &amp; Earnings — Last Updated: March 2026
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[rgba(31,22,15,0.08)] hover:bg-[rgba(31,22,15,0.15)] flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="#4b3425" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
          {/* Key decisions */}
          <div className="bg-[#e5ead7] rounded-3xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-[#4b3425] mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span> All Pricing Decisions — Final
            </h3>
            <div className="space-y-3">
              {[
                ["Platform Minimum Rate", "None. You set any rate you choose."],
                ["Commission Cap", "20% maximum. No session ever pays more than 20%."],
                ["Founding Benefit", "3% off every tier, locked for 24 months."],
                ["Founding Stipend", "₦150,000/month guaranteed for first 3 months post-launch."],
                ["Corporate Sessions", "Same rate, same commission as individual sessions."],
                ["Payout Schedule", "Every Monday, within 7 days of session. No minimum threshold."],
                ["Employment Status", "Independent contractor. You manage your own FIRS tax obligations."],
              ].map(([key, val]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-[rgba(31,22,15,0.08)] last:border-0"
                >
                  <span className="text-sm font-bold text-[#4b3425] sm:w-52 flex-shrink-0">{key}</span>
                  <span className="text-sm text-[rgba(31,22,15,0.65)]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Part 1 */}
          <div>
            <SectionTitle number="1" title="Rate Setting — Full Therapist Autonomy" />
            <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed mb-4">
              Onwynd does not impose a minimum session rate. Therapists set whatever rate reflects their
              experience, credentials, and income goals.
            </p>
            <InfoBox>
              <strong>What "Sessions From As Little As ₦5,000" Means:</strong> This is Onwynd&apos;s
              user-facing message. It is <em>not</em> a floor imposed on therapists. Your rate decision
              is entirely your own.
            </InfoBox>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              {[
                { label: "New Therapists", body: "Lower rates build reviews faster. A profile with verified 5-star reviews commands more bookings than an unreviewed profile at any price." },
                { label: "High-Volume Therapists", body: "Therapists comfortable seeing 50–80 sessions/month benefit most from accessible pricing." },
                { label: "Specialists", body: "Trauma, addiction, psychiatric, and relationship specialists serve a smaller but higher-need population. Premium rates are appropriate once credentials are verified." },
              ].map((c) => (
                <div key={c.label} className="bg-[#f7f4f2] rounded-2xl p-4">
                  <p className="text-sm font-bold text-[#4b3425] mb-2">{c.label}</p>
                  <p className="text-xs text-[rgba(31,22,15,0.6)] leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Part 2 */}
          <div>
            <SectionTitle number="2" title="Tiered Commission Structure" />
            <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed mb-5">
              Commission is tiered by your session rate — lower-priced sessions pay a lower commission.
              The cap is permanently fixed at <strong>20%</strong>.
            </p>
            <div className="overflow-x-auto rounded-2xl border border-[rgba(31,22,15,0.08)] mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#4b3425] text-white">
                    <th className="text-left px-4 py-3 font-bold rounded-tl-2xl">Session Rate Band</th>
                    <th className="text-center px-4 py-3 font-bold">Standard Fee</th>
                    <th className="text-center px-4 py-3 font-bold">You Keep</th>
                    <th className="text-center px-4 py-3 font-bold">Founding Fee</th>
                    <th className="text-center px-4 py-3 font-bold rounded-tr-2xl">You Keep (Founding)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMISSION_TIERS.map((tier, i) => (
                    <tr key={tier.band} className={i % 2 === 0 ? "bg-white" : "bg-[#fafaf9]"}>
                      <td className="px-4 py-3 font-semibold text-[#4b3425]">{tier.band}</td>
                      <td className="px-4 py-3 text-center text-[rgba(31,22,15,0.65)]">{tier.standard}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#9bb068]">{tier.therapistKeeps}</td>
                      <td className="px-4 py-3 text-center text-[rgba(31,22,15,0.65)]">{tier.founding}</td>
                      <td className="px-4 py-3 text-center font-bold text-[#3d4a26]">{tier.foundingKeeps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live commission from API */}
            {tiers && (
              <div className="overflow-x-auto rounded-2xl border border-[rgba(31,22,15,0.08)]">
                <div className="px-4 py-3 bg-[#f7f4f2] border-b text-xs uppercase tracking-wider text-[#4b3425]/70">
                  Live Commission (from Admin settings)
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#3d4a26] text-white">
                      <th className="text-left px-4 py-3 font-bold rounded-tl-2xl">Session Rate Band</th>
                      <th className="text-center px-4 py-3 font-bold">Standard Fee</th>
                      <th className="text-center px-4 py-3 font-bold">You Keep</th>
                      <th className="text-center px-4 py-3 font-bold">Founding Fee</th>
                      <th className="text-center px-4 py-3 font-bold rounded-tr-2xl">You Keep (Founding)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((t, i) => {
                      const band = t.max === null
                        ? `₦${t.min.toLocaleString()} and above`
                        : `₦${t.min.toLocaleString()} – ₦${t.max.toLocaleString()}`;
                      const keeps = `${t.therapist_keep_percent}%`;
                      const standardFee = `${100 - t.therapist_keep_percent}%`;
                      const foundingKeep = t.therapist_keep_percent + (founding.enabled ? founding.discount : 0);
                      const foundingFee = founding.enabled ? `${Math.max(0, 100 - foundingKeep)}%` : "—";
                      return (
                        <tr key={band} className={i % 2 === 0 ? "bg-white" : "bg-[#fafaf9]"}>
                          <td className="px-4 py-3 font-semibold text-[#4b3425]">{band}</td>
                          <td className="px-4 py-3 text-center text-[rgba(31,22,15,0.65)]">{standardFee}</td>
                          <td className="px-4 py-3 text-center font-bold text-[#9bb068]">{keeps}</td>
                          <td className="px-4 py-3 text-center text-[rgba(31,22,15,0.65)]">{foundingFee}</td>
                          <td className="px-4 py-3 text-center font-bold text-[#3d4a26]">
                            {founding.enabled ? `${foundingKeep}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <InfoBox>
              <strong>The 20% Cap Is Permanent.</strong> No session on Onwynd will ever attract more
              than 20% commission. This is written into your terms and cannot be changed without 60 days
              written notice to all registered therapists.
            </InfoBox>

            {/* Earnings illustrations */}
            <div className="mt-5">
              <p className="text-xs font-bold text-[rgba(31,22,15,0.5)] uppercase tracking-wider mb-3">
                Earnings Illustration — Band 1 (10% commission)
              </p>
              <div className="overflow-x-auto rounded-2xl border border-[rgba(31,22,15,0.08)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#e5ead7]">
                      <th className="text-left px-3 py-2.5 font-bold text-[#3d4a26]">Your Rate</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#3d4a26]">Service Fee</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#3d4a26]">You Receive</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#3d4a26]">20 sessions/mo</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#3d4a26]">40 sessions/mo</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#3d4a26]">60 sessions/mo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EARNINGS_BAND1.map((r, i) => (
                      <tr key={r.rate} className={i % 2 === 0 ? "bg-white" : "bg-[#fafaf9]"}>
                        <td className="px-3 py-2.5 font-semibold text-[#4b3425]">{r.rate}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.55)]">{r.fee}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-[#9bb068]">{r.net}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m20}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m40}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m60}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-bold text-[rgba(31,22,15,0.5)] uppercase tracking-wider mb-3">
                Earnings Illustration — Band 4 (20% commission)
              </p>
              <div className="overflow-x-auto rounded-2xl border border-[rgba(31,22,15,0.08)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#ffd2c2]">
                      <th className="text-left px-3 py-2.5 font-bold text-[#4b3425]">Your Rate</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#4b3425]">Service Fee</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#4b3425]">You Receive</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#4b3425]">10 sessions/mo</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#4b3425]">20 sessions/mo</th>
                      <th className="text-center px-3 py-2.5 font-bold text-[#4b3425]">30 sessions/mo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EARNINGS_BAND4.map((r, i) => (
                      <tr key={r.rate} className={i % 2 === 0 ? "bg-white" : "bg-[#fafaf9]"}>
                        <td className="px-3 py-2.5 font-semibold text-[#4b3425]">{r.rate}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.55)]">{r.fee}</td>
                        <td className="px-3 py-2.5 text-center font-bold text-[#fe814b]">{r.net}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m10}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m20}</td>
                        <td className="px-3 py-2.5 text-center text-[rgba(31,22,15,0.65)]">{r.m30}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Part 3 */}
          <div>
            <SectionTitle number="3" title="Founding Therapist Benefits" />
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              <div className="bg-[#e5ead7] rounded-2xl p-5">
                <div className="text-2xl mb-2">🏅</div>
                <h4 className="font-bold text-[#3d4a26] mb-2">3% Commission Reduction</h4>
                <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed">
                  Locked for <strong>24 calendar months</strong> from your onboarding completion date.
                  Applies to every session in every band. Contractually guaranteed.
                </p>
              </div>
              <div className="bg-[#ffd2c2] rounded-2xl p-5">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-bold text-[#4b3425] mb-2">₦150,000 Monthly Minimum</h4>
                <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed">
                  For the first <strong>3 months post-launch</strong>. Activate by maintaining at least
                  15 available booking slots/week.
                </p>
              </div>
            </div>
            <InfoBox>
              You receive 30 days written notice before your founding lock expires. Nothing changes
              silently.
            </InfoBox>
          </div>

          {/* Part 4 – Payout Schedule */}
          <div>
            <SectionTitle number="4" title="Payout Schedule" />
            <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed mb-4">
              Payouts are processed every Monday for sessions completed in the previous 7 days. There is
              no minimum payout threshold — every naira you earn is sent.
            </p>
            <InfoBox>
              First payouts for new therapists are processed within <strong>7 business days</strong> of
              your first completed session while bank details are verified.
            </InfoBox>
          </div>

          {/* Part 5 – Corporate bookings */}
          <div>
            <SectionTitle number="5" title="Corporate & Institutional Bookings" />
            <p className="text-sm text-[rgba(31,22,15,0.65)] leading-relaxed">
              Sessions booked through corporate or institutional accounts are charged to the organisation
              at your listed rate. The same commission tiers apply. You set one rate — Onwynd handles
              the billing.
            </p>
          </div>

          {/* Part 6 – Cancellation */}
          <div>
            <SectionTitle number="6" title="Cancellation & Late Cancellation Policy" />
            <div className="space-y-3 text-sm text-[rgba(31,22,15,0.65)]">
              <p>
                <strong className="text-[#4b3425]">24+ hours notice:</strong> No charge to client.
                Session slot returned to availability.
              </p>
              <p>
                <strong className="text-[#4b3425]">Less than 24 hours:</strong> Client charged 50% of
                session rate. Therapist receives 50% of their net rate.
              </p>
              <p>
                <strong className="text-[#4b3425]">No-show (client):</strong> Client charged 100%.
                Therapist receives full net rate.
              </p>
              <p>
                <strong className="text-[#4b3425]">No-show (therapist):</strong> Client fully refunded.
                Therapist receives nothing. Repeated no-shows trigger account review.
              </p>
            </div>
          </div>

          {/* Part 7 – Summary checklist */}
          <div>
            <SectionTitle number="7" title="Summary Checklist" />
            <div className="space-y-2">
              {[
                "I set my own session rate with no platform minimum.",
                "Commission is tiered: 10% up to ₦5K, up to 20% above ₦20K.",
                "As a Founding Therapist I receive a 3% discount locked for 24 months.",
                "I receive a ₦150,000/month minimum for 3 months post-launch if I maintain 15 slots/week.",
                "Corporate and individual sessions carry the same rate and commission.",
                "Payouts are processed every Monday for sessions completed in the previous 7 days. No minimum threshold.",
                "I am an independent contractor, not an employee of Onwynd. I am responsible for my own tax obligations under FIRS requirements.",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#f7f4f2] rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-[#9bb068] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[rgba(31,22,15,0.7)] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full document from API */}
          {md && (
            <div>
              <SectionTitle number="8" title="Full Document" />
              <div className="rounded-2xl border border-[rgba(31,22,15,0.08)] bg-white">
                <div className="px-4 py-3 bg-[#f7f4f2] border-b rounded-t-2xl text-sm text-[#4b3425]/80">
                  This content is editable by Admin under Settings → Documents.
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#4b3425]/80">
                    {md}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="pb-2">
            <p className="text-xs text-center text-[rgba(31,22,15,0.4)]">
              Onwynd · therapists@onwynd.com · Last Updated March 2026
            </p>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-[rgba(31,22,15,0.08)] flex-shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-full border-2 border-[rgba(31,22,15,0.15)] text-[#4b3425] font-bold text-sm hover:border-[rgba(31,22,15,0.3)] transition-colors"
          >
            Close
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => { onAccept(); onClose(); }}
              className="px-8 py-3 rounded-full bg-[#9bb068] text-white font-bold text-sm hover:opacity-90 transition-opacity"
            >
              I Accept These Terms ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
