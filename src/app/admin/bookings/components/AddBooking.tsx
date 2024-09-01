import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RiLoader2Line } from "@remixicon/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCallback, useEffect, useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingStore } from "@/store/bookings";
import { useEventsStore } from "@/store/events";
import generateAvailableTimes from "@/utils/generateTimeSlots";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";

interface AddBookingProps {
  onClose: () => void;
}

const formSchema = z.object({
  description: z.string().nullable().optional(),
  date: z.date({
    required_error: "Date is required",
  }),
  eventTypeId: z.string().min(1, "Event Type ID is required"),
  start: z.string().min(1, "Start time is required"),
  end: z.string(),
  responses: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
  }),
});

const AddBooking = ({ onClose }: AddBookingProps) => {
  const { events, getEvents } = useEventsStore();
  const { createBooking, loading } = useBookingStore();
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
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
      description: "",
      start: "",
      date: "",
      eventTypeId: "",
      end: "",
      responses: {
        name: "",
        email: "",
      },
    },
  });

  const onSubmit = async (data: { eventTypeId?: any; date?: any; start?: any; end?: any; }) => {
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
        eventTypeId: parseInt(data.eventTypeId),
      });
    } catch (error) {
      console.error(error);
      alert("Submit again");
    } finally {
      onClose();
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (selectedEvent) return generateAvailableTimes(events, selectedEvent);

    return [];
  }, [events, selectedEvent]);

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
    <div
      onClick={onClose}
      className="absolute top-0 left-0 py-5 rounded-xl rounded-tl-none w-full h-full flex justify-center items-center bg-[#0000004f]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative ${
          selectedEvent != null ? "w-3/4" : "w-1/2"
        } overflow-auto max-h-full bg-white p-8 rounded-xl`}
      >
        <div className="font-bold text-xl mb-4">Add Booking</div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex">
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <FormField
                    name="eventTypeId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedEvent(parseInt(value));
                        }}
                      >
                        <SelectTrigger>
                          <span>
                            {(() => {
                              const selectedEvent = events?.find(
                                (event) => event.id === Number(field.value)
                              );
                              return selectedEvent
                                ? selectedEvent.title
                                : "Select Event";
                            })()}
                          </span>
                        </SelectTrigger>
                        <FormMessage />
                        <SelectContent>
                          {events &&
                            events.map((event) => (
                              <SelectItem
                                key={event.id}
                                value={event.id.toString()}
                              >
                                {event.title}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Description"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div>
                  <div className="font-bold">Attendee</div>
                  <FormField
                    control={form.control}
                    name="responses.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="responses.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {selectedEvent && (
                <div>
                  <div className="flex items-center justify-center w-full h-[300px]">
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
                            onClick={() =>
                              setAvailableTimeSlot(availableTime, index)
                            }
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
                  </div>
                  <div className="text-right mt-4 w-full">
                    <Button type="submit">
                      {loading ? (
                        <div className="col-span-10 flex justify-center items-center h-[200px]">
                          <RiLoader2Line className={`text-3xl animate-spin`} />
                        </div>
                      ) : (
                        "Add Booking"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddBooking;
