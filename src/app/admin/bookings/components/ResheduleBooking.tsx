import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RiLoader2Line } from "@remixicon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBookingStore } from "@/store/bookings";
import { useEventsStore } from "@/store/events";
import generateAvailableTimes from "@/lib/generateTimeSlots";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { Booking, BookingStatus } from "@/app/admin/bookings/types";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  start: z.string().min(1, "Start time is required"),
  end: z.string(),
});

interface ResheduleBookingProps extends PropsWithChild {
  eventId: number;
  booking: Booking;
}

const ResheduleBooking = ({
  children,
  eventId,
  booking,
}: ResheduleBookingProps) => {
  const { events, getEvents } = useEventsStore();
  const { rescheduleBooking, loading } = useBookingStore();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // Manage dialog open state

  const fetchEvents = useCallback(async () => {
    await getEvents();
  }, [getEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(booking.startTime),
      start: format(new Date(booking.startTime), "HH:mm"),
      end: format(new Date(booking.endTime), "HH:mm"),
    },
  });

  useEffect(() => {
    setSelectedTimeSlot(format(new Date(booking.startTime), "HH:mm"));
  }, [booking]);

  const onSubmit = async (data: { date?: any; start?: any; end?: any }) => {
    const { date, start, end } = data;

    // Extract hours and minutes from start and end times
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    // Create Date objects for start and end, setting the time values
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute);

    // Now startDateTime and endDateTime are Date objects with the respective times
    console.log("Start Date and Time:", startDateTime);
    console.log("End Date and Time:", endDateTime);

    try {
      await rescheduleBooking(booking.id, startDateTime, endDateTime);
    } catch (error) {
      console.error(error);
      alert("Submit again");
    } finally {
      setOpen(false);
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (eventId) return generateAvailableTimes(events, eventId);

    return [];
  }, [events, eventId]);

  const setAvailableTimeSlot = (availableTime: {
    start: string;
    end: string;
  }) => {
    setSelectedTimeSlot(availableTime.start);
    form.setValue("start", availableTime.start);
    form.setValue("end", availableTime.end);

    return;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="text-center">
            <div className="flex items-center justify-center w-full h-[300px]">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <Calendar
                      mode="single"
                      selected={(() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        let startTime = new Date(field.value); // Assuming field.value contains the startTime
                        startTime.setHours(0, 0, 0, 0);

                        const isWeekday = (date) => {
                          const day = date.getDay();
                          return day >= 1 && day <= 5; // Monday to Friday
                        };

                        // Check if startTime is in the future or today, and on a weekday
                        if (startTime >= today && isWeekday(startTime)) {
                          return startTime;
                        }

                        // If startTime is in the past or not a weekday, adjust the selection to today or the next Monday
                        if (isWeekday(today)) {
                          return today;
                        }

                        // If today is Saturday or Sunday, move to the next Monday
                        const nextMonday = new Date(today);
                        nextMonday.setDate(
                          today.getDate() + ((8 - today.getDay()) % 7)
                        ); // Calculate the next Monday
                        return nextMonday;
                      })()}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Disable past dates
                        if (date < today) {
                          return true;
                        }

                        // Disable Saturdays (6) and Sundays (0)
                        const day = date.getDay();
                        return day === 0 || day === 6;
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ScrollArea type="always" className="h-full">
                <div className="grid gap-2 pr-3">
                  {availableTimeSlots.map((availableTime, index) => (
                    <Button
                      type="button"
                      onClick={() => setAvailableTimeSlot(availableTime, index)}
                      variant="outline"
                      key={index}
                      className={`${
                        selectedTimeSlot === availableTime.start
                          ? "bg-slate-900 text-white"
                          : ""
                      }`}
                    >
                      {availableTime.start} - {availableTime.end}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <Button className="mt-5 " disabled={loading}>
              {loading ? (
                <RiLoader2Line className="animate-spin" />
              ) : (
                "Reschedule"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResheduleBooking;
