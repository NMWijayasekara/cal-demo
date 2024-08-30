import { BookingStatus } from "@/app/admin/bookings/types";
import {create} from 'zustand';
import axios from "axios";

const CAL_API_KEY = process.env.NEXT_PUBLIC_CAL_API_KEY;

interface BookingState {
    bookings: any[];
    loading: boolean;
    error: string | null;
    getBookings: () => Promise<void>;
    createBooking: (data: any) => Promise<void>;
    cancelBooking: (bookingId: number) => Promise<void>;
    acceptBooking: (bookingId: number) => Promise<void>;
  }
  
  export const useBookingStore = create<BookingState>((set) => ({
    bookings: [],
    loading: false,
    error: null,
  
    // Fetch bookings
    getBookings: async () => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get(`https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`);
        set({ bookings: response.data.bookings, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  
    // Create a new booking
    createBooking: async (data) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.post(`https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`, {
          status: BookingStatus.PENDING,
          language: 'en',
          timeZone: 'Asia/Colombo',
          metadata: {},
          ...data,
        });
        set((state) => ({
          bookings: [...state.bookings, response.data.booking],
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  
    // Cancel a booking
    cancelBooking: async (bookingId: number) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.patch(`https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`, {
          status: BookingStatus.CANCELLED,
        });
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, status: BookingStatus.CANCELLED } : booking
          ),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  
    // Accept a booking
    acceptBooking: async (bookingId: number) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.patch(`https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`, {
          status: BookingStatus.ACCEPTED,
        });
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId ? { ...booking, status: BookingStatus.ACCEPTED } : booking
          ),
          loading: false,
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },
  }));