"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
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
  createdAt: string;
}

function formatDate(dateStr: string, tz: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  }).format(date);
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const ref = params.ref as string;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${ref}`)
        .then((res) => {
          if (!res.ok) throw new Error("Booking not found");
          return res.json();
        })
        .then(setBooking)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [ref]);

  if (loading) return <p className="text-gray-500">Loading booking...</p>;
  if (error) {
    return (
        <div className="space-y-4">
          <p className="text-red-500">{error}</p>
          <button
              onClick={() => router.push("/bookings")}
              className="text-sky-700 font-semibold hover:underline"
          >
            ← Back to My Bookings
          </button>
        </div>
    );
  }
  if (!booking) return null;

  const passengerName = [booking.passenger.title, booking.passenger.firstname, booking.passenger.lastname]
      .filter(Boolean)
      .join(" ");

  return (
      <div className="space-y-6">
        <button
            onClick={() => router.push("/bookings")}
            className="text-sky-700 font-semibold hover:underline"
        >
          ← Back to My Bookings
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            Confirmed
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Booking Confirmation</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Booking reference */}
          <div className="text-center border-b border-gray-100 pb-6">
            <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
            <p className="text-4xl font-mono font-bold text-sky-700 tracking-widest">
              {booking.bookingRef}
            </p>
          </div>

          {/* Flight details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Flight</h3>
              <p className="font-bold text-lg text-gray-800">{booking.flightNo}</p>
              <p className="text-sm text-gray-600">{booking.aircraft}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Passenger</h3>
              <p className="font-bold text-lg text-gray-800">{passengerName}</p>
              <p className="text-sm text-gray-600">{booking.passenger.email}</p>
            </div>
          </div>

          {/* Route and times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Departure</h3>
              <p className="font-bold text-gray-800">{booking.origName}</p>
              <p className="text-sm text-gray-500">{booking.orig}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(booking.depDate, booking.origTz)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Arrival</h3>
              <p className="font-bold text-gray-800">{booking.destName}</p>
              <p className="text-sm text-gray-500">{booking.dest}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(booking.arrDate, booking.destTz)}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-gray-100 pt-6 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total Price</span>
            <span className="text-3xl font-bold text-sky-700">${booking.price} NZD</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
              href="/search"
              className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors"
          >
            Book Another Flight
          </Link>
          <Link
              href="/bookings"
              className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            View My Bookings
          </Link>
        </div>
      </div>
  );
}