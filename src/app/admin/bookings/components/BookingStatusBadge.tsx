import React from 'react'
import { BookingStatus } from "@/app/admin/bookings/types";
import { RiLoader2Line } from "@remixicon/react";

const BookingStatusBadge = ({loading, status}: {loading: boolean, status: BookingStatus}) => {
  if (loading) {
    return (
      <div className="my-4 py-1 px-2 h-fit w-fit">
        <RiLoader2Line className={`text-3xl animate-spin`} />
      </div>
    )
  }

  return (
        <div className={`my-4 font-black py-1 px-2 h-fit w-fit rounded-full text-white ${status == BookingStatus.CANCELLED ? "bg-red-500" : status == BookingStatus.ACCEPTED ? "bg-green-600" : "bg-cyan-600"}`}>{status}</div>
  )
}

export default BookingStatusBadge