import { BookingStatus } from "@/app/admin/bookings/types";
import { create } from "zustand";
import axios from "axios";

const CAL_API_KEY = process.env.NEXT_PUBLIC_CAL_API_KEY;

interface BookingState {
  bookings: any[];
  fetching: boolean;
  loading: boolean;
  updateStatusLoading: number | null;
  error: string | null;
  getBookings: () => Promise<void>;
  createBooking: (data: any) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  acceptBooking: (bookingId: number) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  fetching: false,
  loading: false,
  updateStatusLoading: null,
  error: null,

  // Fetch bookings
  getBookings: async () => {
    set({ fetching: true, error: null });
    try {
      const response = await axios.get(
        `https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`
      );
      set({ bookings: response.data.bookings, fetching: false });
    } catch (error) {
      set({ error: (error as any)?.message, fetching: false });
    }
  },

  // Create a new booking
  createBooking: async (data) => {
    set({ loading: true, error: null });
    try {
      console.log(data);
      const response = await axios.post(
        `https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`,
        {
          status: BookingStatus.PENDING,
          language: "en",
          timeZone: "Asia/Colombo",
          metadata: {},
          ...data,
        }
      );
      set((state) => ({
        bookings: [...state.bookings, response.data],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: (error as any)?.message, loading: false });
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: number) => {
    set({ updateStatusLoading: bookingId, error: null });
    try {
      const response = await axios.patch(
        `https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`,
        {
          status: BookingStatus.CANCELLED,
        }
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: BookingStatus.CANCELLED }
            : booking
        ),
        updateStatusLoading: null,
      }));
    } catch (error: any) {
      set({ error: (error as any).message, loading: false });
    }
  },

  // Accept a booking
  acceptBooking: async (bookingId: number) => {
    set({ updateStatusLoading: bookingId, error: null });
    try {
      const response = await axios.patch(
        `https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`,
        {
          status: BookingStatus.ACCEPTED,
        }
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: BookingStatus.ACCEPTED }
            : booking
        ),
        updateStatusLoading: null,
      }));
    } catch (error: any) {
      set({ error: error?.message, updateStatusLoading: null });
    }
  },

  rescheduleBooking: async (
    bookingId: number,
    startTime: string,
    endTime: string
  ) => {
    set({ updateStatusLoading: bookingId, loading: ture, error: null });
    try {
      const response = await axios.patch(
        `https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`,
        {
          startTime,
          endTime,
        }
      );
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, startTime, endTime }
            : booking
        ),
        updateStatusLoading: null,
      }));
    } catch (error: any) {
      set({ error: error?.message, loading: false });
    }
  },
}));
