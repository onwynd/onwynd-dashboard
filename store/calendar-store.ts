import { create } from "zustand";
import {
  format,
  startOfWeek,
  addWeeks,
  subWeeks,
  addDays,
} from "date-fns";
import { calendarService, type Event } from "@/lib/api/calendar";

interface CalendarState {
  currentWeekStart: Date;
  searchQuery: string;
  eventTypeFilter: "all" | "with-meeting" | "without-meeting";
  participantsFilter: "all" | "with-participants" | "without-participants";
  events: Event[];
  sessionEvents: Event[];

  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
  goToToday: () => void;
  goToDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  setEventTypeFilter: (
    filter: "all" | "with-meeting" | "without-meeting"
  ) => void;
  setParticipantsFilter: (
    filter: "all" | "with-participants" | "without-participants"
  ) => void;

  fetchEvents: (params?: Record<string, unknown>) => Promise<void>;
  addEvent: (event: Omit<Event, "id">) => Promise<void>;
  setSessionEvents: (events: Event[]) => void;
  getCurrentWeekEvents: () => Event[];
  getWeekDays: () => Date[];
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
  searchQuery: "",
  eventTypeFilter: "all",
  participantsFilter: "all",
  events: [],
  sessionEvents: [],

  goToNextWeek: () =>
    set((state) => ({
      currentWeekStart: addWeeks(state.currentWeekStart, 1),
    })),

  goToPreviousWeek: () =>
    set((state) => ({
      currentWeekStart: subWeeks(state.currentWeekStart, 1),
    })),

  goToToday: () =>
    set({
      currentWeekStart: startOfWeek(new Date(), { weekStartsOn: 1 }),
    }),

  goToDate: (date: Date) =>
    set({
      currentWeekStart: startOfWeek(date, { weekStartsOn: 1 }),
    }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setEventTypeFilter: (filter: "all" | "with-meeting" | "without-meeting") =>
    set({ eventTypeFilter: filter }),
  setParticipantsFilter: (
    filter: "all" | "with-participants" | "without-participants"
  ) => set({ participantsFilter: filter }),

  fetchEvents: async (params) => {
    try {
      const data = await calendarService.getEvents(params);
      set({ events: data });
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  },

  addEvent: async (event) => {
    try {
      const newEvent = await calendarService.addEvent(event);
      set((state) => ({ events: [...state.events, newEvent] }));
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  },

  setSessionEvents: (events: Event[]) => set({ sessionEvents: events }),

  getCurrentWeekEvents: () => {
    const state = get();
    const { events, sessionEvents, currentWeekStart } = state;
    const allEvents = [...events, ...sessionEvents];

    let weekEvents: Event[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = addDays(currentWeekStart, i);
      const currentDayStr = format(currentDay, "yyyy-MM-dd");

      allEvents.forEach((event) => {
        if (event.date === currentDayStr) {
          weekEvents.push(event);
        }
      });
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      weekEvents = weekEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.participants.some((p) => p.toLowerCase().includes(query))
      );
    }

    if (state.eventTypeFilter === "with-meeting") {
      weekEvents = weekEvents.filter((event) => event.meetingLink);
    } else if (state.eventTypeFilter === "without-meeting") {
      weekEvents = weekEvents.filter((event) => !event.meetingLink);
    }

    if (state.participantsFilter === "with-participants") {
      weekEvents = weekEvents.filter((event) => event.participants.length > 0);
    } else if (state.participantsFilter === "without-participants") {
      weekEvents = weekEvents.filter(
        (event) => event.participants.length === 0
      );
    }

    return weekEvents;
  },

  getWeekDays: () => {
    const state = get();
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(state.currentWeekStart, i));
    }
    return days;
  },
}));
