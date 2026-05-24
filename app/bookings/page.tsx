"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  _id: string;
  bookingRef: string;
  flightNo: string;
  orig: string;
  dest: string;
  origName: string;
  destName: string;
  origTz: string;
  destTz: string;
  depDate: string;
  arrDate: string;
  price: number;
  aircraft: string;
  passenger: {
    title: string;
    firstname: string;
    lastname: string;
    email: string;
  };
}

function formatDate(dateStr: string, tz: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  }).format(date);
}

export default function BookingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancellingRef, setCancellingRef] = useState("");

  const handleEmailSearch = async () => {
    if (!email) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  };

  const handleRefSearch = () => {
    if (!bookingRef) return;
    router.push(`/booking/${bookingRef.toUpperCase()}`);
  };

  const handleCancel = async (ref: string) => {
    if (!confirm(`Cancel booking ${ref}? This cannot be undone.`)) return;
    setCancellingRef(ref);
    const res = await fetch(`/api/bookings/${ref}`, { method: "DELETE" });
    if (res.ok) {
      setBookings(bookings.filter((b) => b.bookingRef !== ref));
    } else {
      alert("Failed to cancel booking");
    }
    setCancellingRef("");
  };

  const handleEmailKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleEmailSearch();
  };

  const handleRefKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRefSearch();
  };

  return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Look up a booking by reference
          </label>
          <div className="flex gap-3">
            <input
                type="text"
                value={bookingRef}
                onChange={(e) => setBookingRef(e.target.value)}
                onKeyDown={handleRefKey}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 uppercase"
            />
            <button
                onClick={handleRefSearch}
                disabled={!bookingRef}
                className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
            >
              Look Up
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Or find all bookings by email
          </label>
          <div className="flex gap-3">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleEmailKey}
                placeholder="you@example.com"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
            />
            <button
                onClick={handleEmailSearch}
                disabled={loading || !email}
                className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find Bookings"}
            </button>
          </div>
        </div>

        {searched && !loading && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                    <p className="text-gray-500">No bookings found for this email.</p>
                    <Link
                        href="/search"
                        className="inline-block mt-3 text-sky-700 font-semibold hover:underline"
                    >
                      Search for flights →
                    </Link>
                  </div>
              ) : (
                  bookings.map((booking) => (
                      <div
                          key={booking.bookingRef}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Booking Reference</p>
                            <p className="text-xl font-mono font-bold text-sky-700 tracking-wider">
                              {booking.bookingRef}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-sky-700">${booking.price} NZD</p>
                            <p className="text-xs text-gray-400">{booking.aircraft}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-400">Departure</p>
                            <p className="font-semibold text-gray-800">{booking.origName}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.depDate, booking.origTz)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Arrival</p>
                            <p className="font-semibold text-gray-800">{booking.destName}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(booking.arrDate, booking.destTz)}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                          <p className="text-sm text-gray-500">
                            {booking.flightNo} &middot;{" "}
                            {[booking.passenger.title, booking.passenger.firstname, booking.passenger.lastname]
                                .filter(Boolean)
                                .join(" ")}
                          </p>
                          <div className="flex gap-3">
                            <Link
                                href={`/booking/${booking.bookingRef}`}
                                className="text-sm text-sky-700 font-semibold hover:underline"
                            >
                              View Invoice
                            </Link>
                            <button
                                onClick={() => handleCancel(booking.bookingRef)}
                                disabled={cancellingRef === booking.bookingRef}
                                className="text-sm text-red-500 font-semibold hover:underline disabled:opacity-50"
                            >
                              {cancellingRef === booking.bookingRef ? "Cancelling..." : "Cancel"}
                            </button>
                          </div>
                        </div>
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
}