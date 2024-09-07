"use client";
import { useBookingStore } from "@/store/bookings";
import AddBooking from "@/app/admin/bookings/components/AddBooking";
import ViewBooking from "@/app/admin/bookings/components/ViewBooking";
import BookingStatusBadge from "@/app/admin/bookings/components/BookingStatusBadge";
import { Booking, BookingStatus } from "@/app/admin/bookings/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEventsStore } from "@/store/events";

const BookingPage = () => {
  const {
    bookings,
    fetching,
    updateStatusLoading,
    getBookings,
    cancelBooking,
    acceptBooking,
  } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openAddBooking, setOpenAddBooking] = useState(false);
  const { events, getEvents } = useEventsStore();

  const fetchBookings = useCallback(async () => {
    await getBookings();
  }, [getBookings]);

  const fetchEvents = useCallback(async () => {
    await getEvents();
  }, [getEvents]);

  useEffect(() => {
    fetchBookings();
    fetchEvents;
  }, [fetchBookings, fetchEvents]);

  const cancelBookingFunc = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const acceptBookingFunc = async (bookingId: number) => {
    try {
      await acceptBooking(bookingId);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const bookingId = row.getValue("id");
        const loadingStatus = bookingId == updateStatusLoading ? true : false;
        return (
          <BookingStatusBadge
            loading={loadingStatus}
            status={row.getValue("status")}
          />
        );
      },
    },
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "eventTypeId",
      header: "Event ID",
      filterFn: (row, columnId, filterValue) => {
        if (filterValue == row.getValue("eventTypeId")) {
          return true;
        }
        return false;
      },
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "startTime",
      header: "Date",
      cell: ({ row }) => {
        return <div>{format(new Date(row.getValue("startTime")), "PPP")}</div>;
      },
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      cell: ({ row }) => {
        return (
          <div>{format(new Date(row.getValue("startTime")), "h:mm aa")}</div>
        );
      },
    },
    {
      accessorKey: "endTime",
      header: "End Time",
      cell: ({ row }) => {
        return (
          <div>{format(new Date(row.getValue("endTime")), "h:mm aa")}</div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const booking = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel
                className="cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                View Booking{" "}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {booking.status !== BookingStatus.CANCELLED && (
                <DropdownMenuItem onClick={() => cancelBookingFunc(booking.id)}>
                  Cancel Booking
                </DropdownMenuItem>
              )}
              {booking.status !== BookingStatus.ACCEPTED && (
                <DropdownMenuItem onClick={() => acceptBookingFunc(booking.id)}>
                  Accept Booking
                </DropdownMenuItem>
              )}
              {booking.status === BookingStatus.CANCELLED && (
                <DropdownMenuItem onClick={() => cancelBookingFunc(booking.id)}>
                  Delete Booking
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(booking.id.toString())
                }
              >
                Copy booking ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: bookings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  useEffect(() => {
    fetchBookings();
    fetchEvents();
  }, [fetchBookings, fetchEvents]);

  const clearAllFilters = () => {
    table.getAllColumns().forEach((column) => {
      if (column.id != "eventTypeId") {
        column.setFilterValue(undefined);
      }
    });
  };

  return (
    <>
      <div className="flex gap-2 items-center">
        <Select
          value={`${table.getColumn("eventTypeId")?.getFilterValue()}` || ""}
          onValueChange={(value) => {
            table.getColumn("eventTypeId")?.setFilterValue(value);
          }}
        >
          <SelectTrigger className="max-w-xs w-fit">
            <span className="text-xl py-4 font-black pr-4">
              {(() => {
                const filterValue = table
                  .getColumn("eventTypeId")
                  ?.getFilterValue();
                const selectedEvent = events?.find(
                  (event) => event.id == filterValue
                );
                return selectedEvent ? selectedEvent.title : "All Events";
              })()}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={""}>All Events</SelectItem>
            {events &&
              events.map((event) => (
                <SelectItem key={event.id} value={String(event.id)}>
                  {event.title}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <div className="text-2xl py-4 font-black">Bookings</div>
      </div>
      <div className="rounded-md border">
        <div className="flex items-center p-4 justify-between">
          <div className="flex gap-2  w-full items-center">
            <Input
              placeholder="Search booking"
              value={
                (table.getColumn("title")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn("title")?.setFilterValue(event.target.value)
              }
              className="max-w-sm w-full"
            />
            <Select
              value={
                (table
                  .getColumn("status")
                  ?.getFilterValue() as BookingStatus) ?? ""
              }
              onValueChange={(value) =>
                table.getColumn("status")?.setFilterValue(value)
              }
            >
              <SelectTrigger className="w-fit">
                <span className="pr-5">
                  {`${table.getColumn("status")?.getFilterValue()}` ||
                    "Select Status"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BookingStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={BookingStatus.ACCEPTED}>Accepted</SelectItem>
                <SelectItem value={BookingStatus.CANCELLED}>
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={clearAllFilters} variant="outline">
              <RiCloseLine /> Clear Filters
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Button onClick={fetchBookings} className="gap-2">
              <RiRefreshLine /> Refresh
            </Button>
            <Button onClick={() => setOpenAddBooking(true)} className="gap-2">
              <RiAddLine /> Add Booking
            </Button>
          </div>
        </div>
        <ScrollArea
          className={`${
            fetching ? "h-0" : "h-[50vh]"
          } relative w-full border p-4`}
        >
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              {table.getHeaderGroups().map((headerGroup, index) => (
                <TableRow key={index}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <TableHead key={index}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>

            {!fetching && (
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={index}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell, index) => (
                        <TableCell key={index}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            )}
          </Table>
        </ScrollArea>
        {fetching && (
          <div className="col-span-10 w-full flex justify-center items-center h-[200px]">
            <RiLoader2Line className={`text-3xl animate-spin`} />
          </div>
        )}
      </div>

      {selectedBooking && (
        <ViewBooking
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
      {openAddBooking && (
        <AddBooking onClose={() => setOpenAddBooking(false)} />
      )}
    </>
  );
};

export default BookingPage;
