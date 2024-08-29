import { BookingStatus } from "@/app/admin/bookings/types";
import axios from "axios";

const CAL_API_KEY = process.env.NEXT_PUBLIC_CAL_API_KEY;
console.log(CAL_API_KEY)

export const getBookings = async () => {
    const response = await axios.get(`https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`);

    return response.data.bookings;
}

export const createBooking = async (data) => {
    console.log(data)
    const response = await axios.post(`https://api.cal.com/v1/bookings?apiKey=${CAL_API_KEY}`, {
        status: BookingStatus.PENDING,
        language: "en",
        timeZone: "Asia/Colombo",
        metadata: {},
        ...data
    });
    console.log(response)

    return response.data.booking;
}

export const cancelBooking = async (bookingId: number) => {
    const response = await axios.patch(`https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`, {
        status: BookingStatus.CANCELLED
    });

    return response.data.booking;
}

export const acceptBooking = async (bookingId: number) => {
    const response = await axios.patch(`https://api.cal.com/v1/bookings/${bookingId}?apiKey=${CAL_API_KEY}`, {
        status: BookingStatus.ACCEPTED
    });

    return response.data.booking;
}