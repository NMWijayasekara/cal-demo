"use client";
import { getEvents } from "@/store/events";
import { EventsStatus } from "@/app/admin/events/types";
import { Button } from "@/components/ui/button";
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
import { RiAddLine, RiLoader2Line, RiRefreshLine } from "@remixicon/react";
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

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const fetchedEvents = await getEvents();
    console.log(fetchedEvents);
    setEvents(fetchedEvents);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<EventType>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "length",
      header: "Length",
      cell: ({ row }) => {
        return <div>{`${row.getValue("length")} Mins`}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const events = row.original;

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
                onClick={() => setSelectedEvents(events)}
              >
                View Events{" "}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(events.id.toString())
                }
              >
                Copy events ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <>
      <div className="text-2xl py-4 font-black">Events</div>
      <div className="rounded-md border">
        <div className="flex items-center p-4 justify-between">
          <Input
            placeholder="Search events"
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="flex gap-2 items-center">
            <Button onClick={fetchEvents} className="gap-2">
              <RiRefreshLine /> Refresh
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
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

          {!loading && (
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
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

        {loading && (
          <div className="col-span-10 flex justify-center items-center h-[200px]">
            <RiLoader2Line className={`text-3xl animate-spin`} />
          </div>
        )}
      </div>
    </>
  );
};

export default Events;
