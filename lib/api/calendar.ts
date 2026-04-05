import client from './client';

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  participants: string[];
  meetingLink?: string;
  timezone?: string;
}

export const calendarService = {
  async getEvents(params?: Record<string, unknown>) {
    const response = await client.get('/api/v1/calendar/events', { params, suppressErrorToast: true });
    return response.data.data ?? response.data;
  },

  async addEvent(event: Omit<Event, "id">) {
    // Map frontend camelCase to backend snake_case
    const payload = {
      title:        event.title,
      start_time:   event.startTime,
      end_time:     event.endTime,
      date:         event.date,
      participants: event.participants,
      meeting_link: event.meetingLink,
      timezone:     event.timezone,
    };
    const response = await client.post('/api/v1/calendar/events', payload);
    return response.data.data ?? response.data;
  }
};
