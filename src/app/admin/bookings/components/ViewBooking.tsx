import { Booking, BookingStatus } from "@/app/admin/bookings/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  RiCalendar2Line,
  RiEdit2Line,
  RiTimeLine,
  RiUserAddLine,
} from "@remixicon/react";
import BookingStatusBadge from "./BookingStatusBadge";
import ResheduleBooking from "./ResheduleBooking";

interface ViewBookingProps {
  booking: Booking;
  onClose: () => void;
}

const ViewBooking = ({ booking, onClose }: ViewBookingProps) => {
  return (
    <div
      onClick={onClose}
      className="absolute top-0 left-0 rounded-xl rounded-tl-none w-full h-full flex justify-center items-center bg-[#0000004f]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative h-4/5 w-1/2 bg-white p-4 rounded-xl"
      >
        <div className="font-bold text-xl">{booking.title}</div>
        <div className="flex justify-between items-center">
          <BookingStatusBadge status={booking.status} />
          <ResheduleBooking booking={booking} eventId={booking.eventTypeId}>
            <Button size={"sm"} className="font-black mb-1 flex gap-2">
              <RiEdit2Line /> Reshedule
            </Button>
          </ResheduleBooking>
        </div>

        <div className="flex items-center border-2 p-4 rounded-lg">
          <div className="flex-1 font-black text-lg flex gap-2 items-center">
            <RiCalendar2Line size={35} />{" "}
            {format(new Date(booking.startTime), "PPP")}
          </div>
          <div className="flex">
            <div className="flex gap-2">
              <RiTimeLine />{" "}
              {format(new Date(booking.startTime), "h:mm aa")}
            </div>
            -
            <div className="flex gap-2">
              {format(new Date(booking.endTime), "h:mm aa")}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center">
            <div className="font-bold text-xl w-fit rounded-lg ">Attendees</div>
            {/* <Button size={"sm"} className="font-black mb-1 flex gap-2">
              <RiUserAddLine /> Add Attendee
            </Button> */}
          </div>
          <div className="border-2 rounded-lg p-4">
            {booking.attendees.map((attendee, index) => (
              <div
                key={index}
                className="flex border-b-2 justify-between items-center p-2"
              >
                <div className="font-bold">{attendee.name}</div>
                <div>{attendee.email}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBooking;
