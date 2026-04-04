"use client";

import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/marketing-dashboard/sidebar";
import { DashboardHeader } from "@/components/marketing-dashboard/header";
import {
  getAmbassadorSettings,
  upsertAmbassadorSettings,
  type AmbassadorSettings,
  type AmbassadorCap,
  type AmbassadorB2BDeal,
  type AmbassadorIndividualTier,
} from "@/lib/api/marketing";

export default function AmbassadorSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<AmbassadorSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user_role");
    const allowed = role === "marketing" || role === "admin";
    if (!allowed) {
      setForbidden(true);
      router.replace("/login");
      return;
    }
    let mounted = true;
    getAmbassadorSettings()
      .then((res) => {
        if (!mounted) return;
        const caps = res.data.caps ?? [];
        setForm({ ...res.data, caps });
      })
      .catch(() => {
        if (!mounted) return;
        setMessage("Failed to load settings");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [router]);

  const canSave = useMemo(() => !!form && !saving, [form, saving]);

  function updateCurrency(value: "NGN" | "USD") {
    if (!form) return;
    setForm({ ...form, currency: value });
  }
  function updateIndividual(i: number, patch: Partial<AmbassadorIndividualTier>) {
    if (!form) return;
    const next = form.individual.slice();
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, individual: next });
  }
  function addIndividual() {
    if (!form) return;
    setForm({
      ...form,
      individual: [...form.individual, { tier: "", amount: 0, description: "" }],
    });
  }
  function removeIndividual(i: number) {
    if (!form) return;
    setForm({ ...form, individual: form.individual.filter((_, idx) => idx !== i) });
  }

  function updateB2B(i: number, patch: Partial<AmbassadorB2BDeal>) {
    if (!form) return;
    const next = form.b2b.slice();
    next[i] = { ...next[i], ...patch };
    setForm({ ...form, b2b: next });
  }
  function addB2B() {
    if (!form) return;
    setForm({
      ...form,
      b2b: [...form.b2b, { title: "", seats: "", amount: 0, recurring: "" }],
    });
  }
  function removeB2B(i: number) {
    if (!form) return;
    setForm({ ...form, b2b: form.b2b.filter((_, idx) => idx !== i) });
  }

  function updateCap(i: number, patch: Partial<AmbassadorCap>) {
    if (!form) return;
    const caps = form.caps ?? [];
    const next = caps.slice();
    next[i] = { ...next[i], ...patch } as AmbassadorCap;
    setForm({ ...form, caps: next });
  }
  function addCap() {
    if (!form) return;
    const caps = form.caps ?? [];
    setForm({ ...form, caps: [...caps, { title: "", value: "", desc: "", note: "" }] });
  }
  function removeCap(i: number) {
    if (!form) return;
    const caps = form.caps ?? [];
    setForm({ ...form, caps: caps.filter((_, idx) => idx !== i) });
  }

  async function onSave() {
    if (!form) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await upsertAmbassadorSettings(form);
      setForm(res.data);
      setMessage("Saved");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <DashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 space-y-6">
            {forbidden && (
              <div className="p-4 rounded-md bg-amber-100 text-amber-900">
                You do not have access to this page.
              </div>
            )}
            <h1 className="text-2xl font-semibold">Ambassador Settings</h1>
            {loading && <div>Loading…</div>}
            {!loading && form && (
              <div className="space-y-8">
                <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <h2 className="text-lg font-medium mb-3">Currency</h2>
                  <select
                    className="border rounded-md p-2 w-48"
                    value={form.currency}
                    onChange={(e) => updateCurrency(e.target.value as "NGN" | "USD")}
                  >
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                  </select>
                </section>

                <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-medium">Individual Tiers</h2>
                    <button onClick={addIndividual} className="px-3 py-2 rounded-md bg-black text-white">
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.individual.map((row, i) => (
                      <div key={`${row.tier}-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-3">
                        <div>
                          <label className="text-sm">Tier</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.tier}
                            onChange={(e) => updateIndividual(i, { tier: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Amount</label>
                          <input
                            type="number"
                            className="w-full border rounded-md p-2"
                            value={row.amount}
                            onChange={(e) => updateIndividual(i, { amount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm">Description</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.description}
                            onChange={(e) => updateIndividual(i, { description: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button onClick={() => removeIndividual(i)} className="px-3 py-2 rounded-md bg-red-600 text-white">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-medium">B2B Deals</h2>
                    <button onClick={addB2B} className="px-3 py-2 rounded-md bg-black text-white">
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.b2b.map((row, i) => (
                      <div key={`${row.title}-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-3">
                        <div>
                          <label className="text-sm">Title</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.title}
                            onChange={(e) => updateB2B(i, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Seats</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.seats}
                            onChange={(e) => updateB2B(i, { seats: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Amount</label>
                          <input
                            type="number"
                            className="w-full border rounded-md p-2"
                            value={row.amount}
                            onChange={(e) => updateB2B(i, { amount: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Recurring</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.recurring}
                            onChange={(e) => updateB2B(i, { recurring: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button onClick={() => removeB2B(i)} className="px-3 py-2 rounded-md bg-red-600 text-white">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-medium">Caps & Limits</h2>
                    <button onClick={addCap} className="px-3 py-2 rounded-md bg-black text-white">
                      Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(form.caps ?? []).map((row, i) => (
                      <div key={`${row.title}-${i}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 border rounded-lg p-3">
                        <div>
                          <label className="text-sm">Title</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.title}
                            onChange={(e) => updateCap(i, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Value</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.value}
                            onChange={(e) => updateCap(i, { value: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Description</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.desc}
                            onChange={(e) => updateCap(i, { desc: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm">Note</label>
                          <input
                            className="w-full border rounded-md p-2"
                            value={row.note}
                            onChange={(e) => updateCap(i, { note: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-4 flex justify-end">
                          <button onClick={() => removeCap(i)} className="px-3 py-2 rounded-md bg-red-600 text-white">
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onSave}
                    disabled={!canSave}
                    className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Settings"}
                  </button>
                  {message && <div className="text-sm text-amber-700">{message}</div>}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
