"use client"
import { AuthProvider } from "@/context/auth";
import { RiBook3Fill, RiUser3Fill } from "@remixicon/react";
import Link from "next/link";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>

                    <div className="p-5 flex  justify-center items-center h-screen w-screen bg-gray-50">
                        <div className="flex h-4/5 w-4/5 rounded-lg">
                            <div className="bg-white h-fit p-2 shadow rounded-lg rounded-r-none">
                                <Link href="/admin/bookings" title="Bookings" className="p-2 flex flex-col justify-center items-center cursor-pointer hover:text-gray-500 hover:bg-gray-50 rounded-lg">
                                    <RiBook3Fill size={30} />
                                    <div className="text-xs mt-1 font-bold">Bookings</div>
                                </Link>
                                <Link href="/admin/users" title="Users" className="p-2 flex flex-col justify-center items-center cursor-pointer hover:text-gray-500 hover:bg-gray-50 rounded-lg">
                                    <RiUser3Fill size={30} />
                                    <div className="text-xs mt-1 font-bold">Users</div>
                                </Link>

                            </div>
                            <div className="bg-white relative w-full h-full shadow p-5 rounded-xl rounded-tl-none">

                                {children}
                            </div>
                        </div></div>
                </AuthProvider>
            </body>
        </html>
    );
}
