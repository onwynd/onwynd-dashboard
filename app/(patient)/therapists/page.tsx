"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isBefore, startOfToday } from "date-fns";
import client from "@/lib/api/client";
import { patientApi } from "@/lib/api/patient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Star,
  Search,
  Clock,
  Video,
  Mic,
  MessageSquare,
  Loader2,
  Calendar as CalendarIcon,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TherapistProfile {
  id: number;
  specializations?: string[] | string | null;
  qualifications?: string | null;
  years_of_experience?: number | null;
  hourly_rate?: number | null;
  currency?: string;
  languages?: string[] | null;
  areas_of_focus?: string[] | null;
  rating_average?: number | null;
  total_reviews?: number | null;
  is_accepting_clients?: boolean;
  avatar_url?: string | null;
  bio?: string | null;
  is_verified?: boolean;
}

interface Therapist {
  id: number;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  therapistProfile?: TherapistProfile | null;
  availabilities?: { day_of_week: number; start_time: string; end_time: string; is_available: boolean; is_recurring: boolean; specific_date?: string | null }[];
}

interface AvailabilityWindow {
  start_time: string;
  end_time: string;
}

interface DayAvailability {
  windows: AvailabilityWindow[];
  booked_times: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURATIONS = [
  { minutes: 30,  label: "30 min" },
  { minutes: 45,  label: "45 min" },
  { minutes: 60,  label: "60 min" },
  { minutes: 90,  label: "90 min" },
];

const SESSION_TYPES = [
  { value: "video", label: "Video",  icon: Video },
  { value: "audio", label: "Audio",  icon: Mic },
  { value: "chat",  label: "Chat",   icon: MessageSquare },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function therapistName(t: Therapist): string {
  if (t.full_name) return t.full_name;
  return [t.first_name, t.last_name].filter(Boolean).join(" ") || "Therapist";
}

function therapistInitials(t: Therapist): string {
  const name = therapistName(t);
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getSpecializations(profile?: TherapistProfile | null): string[] {
  if (!profile?.specializations) return [];
  if (Array.isArray(profile.specializations)) return profile.specializations as string[];
  if (typeof profile.specializations === "string") {
    try { return JSON.parse(profile.specializations) as string[]; } catch { return [profile.specializations]; }
  }
  return [];
}

/**
 * Given available windows for a date and already-booked start times,
 * generate all valid slot start times for the chosen duration.
 */
function generateSlots(
  windows: AvailabilityWindow[],
  bookedTimes: string[],
  durationMins: number
): { time: string; available: boolean }[] {
  const slots: { time: string; available: boolean }[] = [];
  const bookedSet = new Set(bookedTimes);

  for (const window of windows) {
    const [wStartH, wStartM] = window.start_time.split(":").map(Number);
    const [wEndH, wEndM]     = window.end_time.split(":").map(Number);
    const windowStart = wStartH * 60 + wStartM;
    const windowEnd   = wEndH   * 60 + wEndM;

    let cursor = windowStart;
    while (cursor + durationMins <= windowEnd) {
      const h = Math.floor(cursor / 60).toString().padStart(2, "0");
      const m = (cursor % 60).toString().padStart(2, "0");
      const timeStr = `${h}:${m}`;
      const isBooked = bookedSet.has(timeStr);
      slots.push({ time: timeStr, available: !isBooked });
      cursor += 30; // advance in 30-min increments within each window
    }
  }

  return slots;
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatPrice(hourlyRate: number | null | undefined, currency: string | undefined, durationMins: number): string {
  if (!hourlyRate) return "—";
  const price = Math.round((hourlyRate / 60) * durationMins);
  const sym = (currency ?? "NGN") === "NGN" ? "₦" : "$";
  return `${sym}${price.toLocaleString()}`;
}

// ─── Therapist Card ───────────────────────────────────────────────────────────

function TherapistCard({ therapist, onBook }: { therapist: Therapist; onBook: (t: Therapist) => void }) {
  const profile = therapist.therapistProfile;
  const specs    = getSpecializations(profile).slice(0, 2);
  const rating   = profile?.rating_average ? Number(profile.rating_average).toFixed(1) : null;
  const rate     = profile?.hourly_rate;
  const currency = profile?.currency ?? "NGN";
  const accepting = profile?.is_accepting_clients !== false;

  return (
    <Card className={cn("transition-all", !accepting && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-14 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={therapistName(therapist)} />
            <AvatarFallback>{therapistInitials(therapist)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-semibold text-sm truncate">{therapistName(therapist)}</h3>
              {rating && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{rating}</span>
                  {profile?.total_reviews ? (
                    <span className="text-xs text-muted-foreground">({profile.total_reviews})</span>
                  ) : null}
                </div>
              )}
            </div>

            {profile?.qualifications && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{profile.qualifications}</p>
            )}

            <div className="flex flex-wrap gap-1 mt-2">
              {specs.map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
              ))}
              {profile?.years_of_experience ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {profile.years_of_experience}y exp
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center justify-between mt-3 gap-2">
              <div className="flex items-center gap-1">
                <Clock className="size-3.5 text-muted-foreground" />
                {rate ? (
                  <span className="text-xs font-medium">
                    {currency === "NGN" ? "₦" : "$"}{Number(rate).toLocaleString()}/hr
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Rate not set</span>
                )}
              </div>
              <Button
                size="sm"
                className="h-7 text-xs gap-1"
                disabled={!accepting}
                onClick={() => onBook(therapist)}
              >
                {accepting ? "Book Session" : "Not Accepting"}
                {accepting && <ChevronRight className="size-3" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Booking Sheet ────────────────────────────────────────────────────────────

function BookingSheet({
  therapist,
  open,
  onClose,
}: {
  therapist: Therapist | null;
  open: boolean;
  onClose: () => void;
}) {
  const profile = therapist?.therapistProfile;

  // Step state: "datetime" | "confirm"
  const [step, setStep]               = useState<"datetime" | "confirm">("datetime");
  const [duration, setDuration]       = useState(60);
  const [sessionType, setSessionType] = useState<"video" | "audio" | "chat">("video");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Availability state
  const [availableDays, setAvailableDays]     = useState<number[]>([]);
  const [dayAvail, setDayAvail]               = useState<DayAvailability | null>(null);
  const [loadingDays, setLoadingDays]         = useState(false);
  const [loadingSlots, setLoadingSlots]       = useState(false);
  const [booking, setBooking]                 = useState(false);
  const [vatRate, setVatRate]                 = useState(0);

  // Fetch VAT rate from public config once
  useEffect(() => {
    client.get("/api/v1/config").then((res) => {
      const data = res.data?.data ?? res.data;
      setVatRate(Number(data?.vat_rate ?? 0));
    }).catch(() => {});
  }, []);

  // Reset when therapist changes
  useEffect(() => {
    if (!therapist) return;
    setStep("datetime");
    setSelectedDate(undefined);
    setSelectedTime(null);
    setDayAvail(null);
    setDuration(60);
    setSessionType("video");

    // Load which days of week this therapist recurs on
    setLoadingDays(true);
    client
      .get(`/api/v1/therapists/${therapist.id}/availability`)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setAvailableDays(data?.available_days ?? []);
      })
      .catch(() => setAvailableDays([]))
      .finally(() => setLoadingDays(false));
  }, [therapist]);

  // Load slots when date selected
  useEffect(() => {
    if (!therapist || !selectedDate) return;
    setSelectedTime(null);
    setLoadingSlots(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    client
      .get(`/api/v1/therapists/${therapist.id}/availability`, { params: { date: dateStr } })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setDayAvail({
          windows:      data?.windows ?? [],
          booked_times: data?.booked_times ?? [],
        });
      })
      .catch(() => setDayAvail({ windows: [], booked_times: [] }))
      .finally(() => setLoadingSlots(false));
  }, [therapist, selectedDate]);

  // Disable dates: past + days not in availableDays (unless one-time specific_date availability)
  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (isBefore(date, startOfToday())) return true;
      if (loadingDays) return false; // don't block while loading
      const dayNum = date.getDay(); // 0=Sun,...,6=Sat
      // Check recurring availability
      if (availableDays.includes(dayNum)) return false;
      // Check one-time specific_date availability from the availabilities array
      const dateStr = format(date, "yyyy-MM-dd");
      const hasSpecific = therapist?.availabilities?.some(
        (a) => !a.is_recurring && a.is_available && a.specific_date === dateStr
      );
      return !hasSpecific;
    },
    [availableDays, loadingDays, therapist]
  );

  const slots = dayAvail
    ? generateSlots(dayAvail.windows, dayAvail.booked_times, duration)
    : [];

  const sessionFeeNum = profile?.hourly_rate ? Math.round((profile.hourly_rate / 60) * duration) : 0;
  const vatAmount     = Math.round(sessionFeeNum * (vatRate / 100));
  const totalNum      = sessionFeeNum + vatAmount;
  const sym           = (profile?.currency ?? "NGN") === "NGN" ? "₦" : "$";
  const price         = sessionFeeNum ? `${sym}${totalNum.toLocaleString()}` : "—";

  const handleBook = async () => {
    if (!therapist || !selectedDate || !selectedTime) return;
    setBooking(true);
    try {
      const scheduledAt = `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`;
      await patientApi.bookSession({
        therapist_id: String(therapist.id),
        scheduled_at: scheduledAt,
        duration: duration,
        type: sessionType,
        payment_method: "paystack",
      });
      toast({
        title: "Session booked!",
        description: `Your ${duration}-min session on ${format(selectedDate, "MMM d")} at ${formatTime(selectedTime)} has been requested.`,
      });
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to book session.";
      toast({ title: "Booking failed", description: msg, variant: "destructive" });
    } finally {
      setBooking(false);
    }
  };

  if (!therapist) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>{therapistInitials(therapist)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-base">{therapistName(therapist)}</SheetTitle>
              {profile?.qualifications && (
                <p className="text-xs text-muted-foreground">{profile.qualifications}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">

            {/* Duration + Price */}
            <div>
              <p className="text-sm font-medium mb-2">Session Duration</p>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.minutes}
                    onClick={() => { setDuration(d.minutes); setSelectedTime(null); }}
                    className={cn(
                      "rounded-lg border px-2 py-2.5 text-center transition-all",
                      duration === d.minutes
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-muted-foreground/40"
                    )}
                  >
                    <p className="text-xs font-semibold">{d.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {(() => {
                        const fee = profile?.hourly_rate ? Math.round((profile.hourly_rate / 60) * d.minutes) : 0;
                        const total = fee + Math.round(fee * (vatRate / 100));
                        return fee ? `${sym}${total.toLocaleString()}` : "—";
                      })()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Type */}
            <div>
              <p className="text-sm font-medium mb-2">Session Type</p>
              <div className="flex gap-2">
                {SESSION_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSessionType(value as "video" | "audio" | "chat")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all",
                      sessionType === value
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:border-muted-foreground/40"
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarIcon className="size-4 text-muted-foreground" />
                Select Date
                {loadingDays && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Greyed-out dates are unavailable. Only the therapist&apos;s available days are selectable.
              </p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                disabled={isDateDisabled}
                startMonth={startOfToday()}
                className="rounded-xl border p-3 w-full"
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div>
                <p className="text-sm font-medium mb-2">
                  Available Times for {format(selectedDate, "MMMM d, yyyy")}
                  {loadingSlots && <Loader2 className="inline size-3 animate-spin ml-2 text-muted-foreground" />}
                </p>

                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 rounded-lg" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No available slots on this date. Please select another day.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(({ time, available }) => (
                      <button
                        key={time}
                        disabled={!available}
                        onClick={() => available && setSelectedTime(time)}
                        className={cn(
                          "rounded-lg border px-2 py-2 text-sm font-medium transition-all",
                          !available && "opacity-40 cursor-not-allowed line-through text-muted-foreground bg-muted",
                          available && selectedTime === time && "border-primary bg-primary text-primary-foreground",
                          available && selectedTime !== time && "hover:border-primary/60 hover:bg-primary/5"
                        )}
                      >
                        {formatTime(time)}
                        {!available && (
                          <span className="block text-[10px] font-normal mt-0.5">Booked</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            {profile?.bio && (
              <div>
                <p className="text-sm font-medium mb-1">About</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer — Book CTA */}
        <div className="px-6 py-4 border-t shrink-0 space-y-3">
          {selectedDate && selectedTime && (
            <div className="rounded-lg bg-muted/60 px-4 py-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(selectedDate, "EEE, MMM d yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatTime(selectedTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session fee</span>
                <span className="font-medium">{sessionFeeNum ? `${sym}${sessionFeeNum.toLocaleString()}` : "—"}</span>
              </div>
              {vatRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT ({vatRate}%)</span>
                  <span className="font-medium">{sym}{vatAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 mt-1">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-primary">{price}</span>
              </div>
            </div>
          )}
          <Button
            className="w-full"
            disabled={!selectedDate || !selectedTime || booking}
            onClick={handleBook}
          >
            {booking && <Loader2 className="size-4 animate-spin mr-2" />}
            {selectedDate && selectedTime
              ? `Confirm & Pay ${price}`
              : "Select a date and time to continue"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TherapistsPage() {
  const [therapists, setTherapists]         = useState<Therapist[]>([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [bookingTherapist, setBookingTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    // Load specialization filter options
    client.get("/api/v1/therapists/specializations").then((res) => {
      const data = res.data?.data ?? res.data;
      setSpecializations(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { per_page: "30" };
    if (search.trim()) params.name = search.trim();
    if (specialization !== "all") params.specialization = specialization;

    client.get("/api/v1/therapists", { params })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setTherapists(list);
      })
      .catch(() => setTherapists([]))
      .finally(() => setLoading(false));
  }, [search, specialization]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Find a Therapist</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse verified therapists, view their availability, and book a session.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {specializations.length > 0 && (
          <Select value={specialization} onValueChange={(v: string | null) => setSpecialization(v ?? "all")}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All specializations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specializations</SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Therapist Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Skeleton className="size-14 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : therapists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="size-12 text-muted-foreground mb-3" />
          <p className="font-medium">No therapists found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || specialization !== "all"
              ? "Try adjusting your search filters."
              : "No verified therapists are currently available."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {therapists.map((t) => (
            <TherapistCard
              key={t.id}
              therapist={t}
              onBook={(t) => setBookingTherapist(t)}
            />
          ))}
        </div>
      )}

      {/* Booking Sheet */}
      <BookingSheet
        therapist={bookingTherapist}
        open={bookingTherapist !== null}
        onClose={() => setBookingTherapist(null)}
      />
    </div>
  );
}
