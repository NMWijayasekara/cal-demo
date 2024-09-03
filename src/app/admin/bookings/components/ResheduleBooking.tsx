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
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RiLoader2Line } from "@remixicon/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useBookingStore } from "@/store/bookings";
import { useEventsStore } from "@/store/events";
import generateAvailableTimes from "@/utils/generateTimeSlots";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";


const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  start: z.string().min(1, "Start time is required"),
  end: z.string(),
});

const ResheduleBooking = ({ children, eventId, bookingId }) => {
  const { events, getEvents } = useEventsStore();
  const { createBooking, loading } = useBookingStore();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    await getEvents();
  }, [getEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: "",
      date: "",
      end: "",
    },
  });

  const onSubmit = async (data: { date?: any; start?: any; end?: any; }) => {
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
      await createBooking({
        ...data,
        start: startDateTime,
        end: endDateTime,
      });
    } catch (error) {
      console.error(error);
      alert("Submit again");
    } finally {
      onClose();
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (eventId) return generateAvailableTimes(events, eventId);

    return [];
  }, [events, eventId]);

  const setAvailableTimeSlot = (
    availableTime: {
      start: string;
      end: string;
    },
    index: number
  ) => {
    setSelectedTimeSlot(index);
    form.setValue("start", availableTime.start);
    form.setValue("end", availableTime.end);

    return;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center justify-center w-full h-[300px]"
          >
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
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
                      selectedTimeSlot === index
                        ? "bg-slate-900 text-white"
                        : ""
                    }`}
                  >
                    {availableTime.start} - {availableTime.end}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResheduleBooking;
