"use client"
import { acceptBooking, cancelBooking, getBookings } from "@/api/bookings";
import { Booking, BookingStatus } from "@/app/admin/bookings/types";
import ViewBooking from "@/app/admin/bookings/ViewBooking";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const Admin = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        const fetchedBookings = await getBookings();
        setBookings(fetchedBookings);
    }, [])

    useEffect(() => {
        fetchBookings();
    }, [])

    const cancelBookingFunc = async (bookingId: number) => {
        try {
            await cancelBooking(bookingId);

            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, status: BookingStatus.CANCELLED }
                        : booking
                )
            );

        } catch (error) {
            console.error("Failed to cancel booking:", error);
        }
    };

    const acceptBookingFunc = async (bookingId: number) => {
        try {
            await acceptBooking(bookingId);

            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === bookingId
                        ? { ...booking, status: BookingStatus.ACCEPTED }
                        : booking
                )
            );

        } catch (error) {
            console.error("Failed to cancel booking:", error);
        }
    };

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const columns: ColumnDef<Booking>[] = [
        {
            accessorKey: "status",
            header: "Status",
        },
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "startTime",
            header: "Date",
            cell: ({ row }) => {
                const formattedTime = new Date(row.getValue("startTime")).toLocaleDateString();

                return <div>{formattedTime}</div>;
            },
        }, {
            accessorKey: "startTime",
            header: "Start Time",
            cell: ({ row }) => {
                const formattedTime = new Date(row.getValue("startTime")).toLocaleTimeString();

                return <div>{formattedTime}</div>;
            },
        },
        {
            accessorKey: "endTime",
            header: "End Time",
            cell: ({ row }) => {
                const formattedTime = new Date(row.getValue("endTime")).toLocaleTimeString();

                return <div>{formattedTime}</div>;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const booking = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="cursor-pointer" onClick={() => setSelectedBooking(booking)}>View Booking  </DropdownMenuLabel>
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
                                onClick={() => navigator.clipboard.writeText(booking.id.toString())}
                            >
                                Copy booking ID
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
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
    })


    return (
        <>
            <div className="text-2xl py-4 font-black">
                Bookings
            </div>
            <div className="rounded-md border">
                <div className="flex items-center p-4">

                    <Input
                        placeholder="Search booking"
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedBooking && <ViewBooking booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}
        </>
    )
}

export default Admin