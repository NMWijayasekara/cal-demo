import { z } from "zod";
import { acceptBooking, cancelBooking, getBookings } from "@/store/bookings";
import ViewBooking from "@/app/admin/bookings/components/ViewBooking";
import BookingStatusBadge from "@/app/admin/bookings/components/BookingStatusBadge";
import { Booking, BookingStatus } from "@/app/admin/bookings/types";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiAddLine,
  RiLoader2Line,
  RiRefreshLine,
  RiCloseLine,
} from "@remixicon/react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  SelectColumnFilter,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Events, EventsStatus } from "@/app/admin/events/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getEvents } from "@/store/events";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useBookingStore } from "@/store/bookings";

interface AddBookingProps {
  onClose: () => void;
}

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
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
  })
  .refine(
    (data) => {
      // Split time strings into hours and minutes
      const [startHour, startMinute] = data.start.split(":").map(Number);
      const [endHour, endMinute] = data.end.split(":").map(Number);

      // Create Date objects for comparison
      const startTime = new Date();
      startTime.setHours(startHour, startMinute);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute);

      // Return true if startTime is less than or equal to endTime
      return startTime <= endTime;
    },
    {
      message: "Start time can't be more that end time",
      path: ["start"], // Attach error to the start field
    }
  );

const AddBooking = ({ onClose }: AddBookingProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const {createBooking, bookings} = useBookingStore()

  const fetchEvents = useCallback(async () => {
    const fetchedEvents = await getEvents();
    console.log(fetchedEvents);
    setEvents(fetchedEvents);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      start: "",
      end: "",
      responses: {
        name: "",
        email: "",
      },
    },
  });

  const onSubmit = async (data) => {
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

    await createBooking({
      ...data,
      start: startDateTime,
      end: endDateTime,
      eventTypeId: parseInt(data.eventTypeId),
    });
  };

  return (
    <div
      onClick={onClose}
      className="absolute top-0 left-0 py-5 rounded-xl rounded-tl-none w-full h-full flex justify-center items-center bg-[#0000004f]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-1/2 overflow-auto max-h-full bg-white p-8 rounded-xl"
      >
        <div className="font-bold text-xl mb-4">Add Booking</div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
              <FormField
                name="eventTypeId"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <span>
                        {(() => {
                          const selectedEvent = events?.find(
                            (event) => event.id == field.value
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
                          <SelectItem key={event.id} value={parseInt(event.id)}>
                            {event.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="flex w-full gap-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-full">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem className="w-fit">
                      <FormControl>
                        <Input className="w-fit" type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end"
                  render={({ field }) => (
                    <FormItem className="w-fit">
                      <FormControl>
                        <Input className="w-fit" type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <div className="font-bold ">Attendee</div>
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
              <div className="text-right">
                <Button type="submit">Add Booking</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AddBooking;
