import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalendarEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface CalendarState {
  events: CalendarEvent[];
  selectedUserIds: string[];
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleUserFilter: (userId: string) => void;
  setSelectedUsers: (userIds: string[]) => void;
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  getFilteredEvents: () => CalendarEvent[];
  getEventsByDate: (date: Date) => CalendarEvent[];
  getEventsByUser: (userId: string) => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      selectedUserIds: [],
      currentDate: new Date(),
      viewMode: 'month',

      addEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: uuidv4(),
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        return newEvent;
      },

      updateEvent: (id, data) => {
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },

      toggleUserFilter: (userId) => {
        set((state) => ({
          selectedUserIds: state.selectedUserIds.includes(userId)
            ? state.selectedUserIds.filter((id) => id !== userId)
            : [...state.selectedUserIds, userId],
        }));
      },

      setSelectedUsers: (userIds) => {
        set({ selectedUserIds: userIds });
      },

      setCurrentDate: (date) => {
        set({ currentDate: date });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      getFilteredEvents: () => {
        const { events, selectedUserIds } = get();
        if (selectedUserIds.length === 0) return events;
        return events.filter((e) => selectedUserIds.includes(e.userId));
      },

      getEventsByDate: (date) => {
        const events = get().getFilteredEvents();
        return events.filter((e) => {
          const eventStart = new Date(e.startDate);
          const eventEnd = new Date(e.endDate);
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDate);
          nextDay.setDate(nextDay.getDate() + 1);
          return eventStart < nextDay && eventEnd >= targetDate;
        });
      },

      getEventsByUser: (userId) => {
        return get().events.filter((e) => e.userId === userId);
      },
    }),
    {
      name: 'calendar-storage',
    }
  )
);
