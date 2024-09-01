import {create} from 'zustand';
import axios from 'axios';
import { Booking } from '@/app/admin/bookings/types';

const CAL_API_KEY = process.env.NEXT_PUBLIC_CAL_API_KEY;

interface EventsStoreProps{
  events: EventType[];
  loading: boolean;
  error: any;
  getEvents: () => Promise<void>;
}

// Define your Zustand store
export const useEventsStore = create<EventsStoreProps>((set) => ({
  events: [],
  loading: false,
  error: null,

  getEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`https://api.cal.com/v1/event-types?apiKey=${CAL_API_KEY}`);
      set({ events: response.data.event_types, loading: false });
    } catch (error: any) {
      set({ error: error.message as any, loading: false });
    }
  },
}));
