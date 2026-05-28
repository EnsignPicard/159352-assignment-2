/*
booking confirmation page
loads booking details and allows cancellation
*/

"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Link from "next/link";

import { formatDate } from "@/lib/formatDate";

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

export default function BookingPage() {

  const params = useParams();

  const router = useRouter();

  const ref = params.ref as string;

  const [booking, setBooking] = useState<Booking | null>(null);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {

    fetch(`/api/bookings/${ref}`)
        .then((res) => {

          if (!res.ok) {
            throw new Error("Booking not found");
          }

          return res.json();

        })
        .then((data) => {

          setBooking(data);

        })
        .catch((e) => {

          setError(e.message);

        })
        .finally(() => {

          setLoading(false);

        });

  }, [ref]);

  const handleCancel = () => {

    let confirmCancel = confirm(
        `Cancel booking ${ref}? This cannot be undone.`
    );

    if (!confirmCancel) {
      return;
    }

    setCancelling(true);

    fetch(`/api/bookings/${ref}`, {
      method: "DELETE",
    })
        .then((res) => {

          if (res.ok) {

            router.push("/bookings");

          } else {

            alert("Failed to cancel booking");

            setCancelling(false);

          }

        });

  };

  if (loading) {

    return (
        <p className="text-gray-500">
          Loading booking...
        </p>
    );

  }

  if (error) {

    return (
        <p className="text-red-500">
          {error}
        </p>
    );

  }

  if (!booking) {
    return null;
  }

  let passengerName = booking.passenger.firstname + " " + booking.passenger.lastname;

  if (booking.passenger.title) {
    passengerName = booking.passenger.title + " " + passengerName;
  }

  let cancelButtonText = "";

  if (cancelling) {
    cancelButtonText = "Cancelling...";
  } else {
    cancelButtonText = "Cancel Booking";
  }

  return (

      <div className="space-y-6">

        <div className="flex items-center gap-3">

          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            Confirmed
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Booking Confirmation
          </h1>

        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

          <div className="text-center border-b border-gray-100 pb-6">

            <p className="text-sm text-gray-500 mb-1">
              Booking Reference
            </p>

            <p className="text-3xl sm:text-4xl font-mono font-bold text-sky-700 tracking-widest">
              {booking.bookingRef}
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Flight
              </h3>

              <p className="font-bold text-lg text-gray-800">
                {booking.flightNo}
              </p>

              <p className="text-sm text-gray-600">
                {booking.aircraft}
              </p>

            </div>

            <div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Passenger
              </h3>

              <p className="font-bold text-lg text-gray-800">
                {passengerName}
              </p>

              <p className="text-sm text-gray-600">
                {booking.passenger.email}
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-gray-100 pt-6">

            <div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Departure
              </h3>

              <p className="font-bold text-gray-800">
                {booking.origName}
              </p>

              <p className="text-sm text-gray-500">
                {booking.orig}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {formatDate(
                    booking.depDate,
                    booking.origTz,
                    "long"
                )}
              </p>

            </div>

            <div>

              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Arrival
              </h3>

              <p className="font-bold text-gray-800">
                {booking.destName}
              </p>

              <p className="text-sm text-gray-500">
                {booking.dest}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {formatDate(
                    booking.arrDate,
                    booking.destTz,
                    "long"
                )}
              </p>

            </div>

          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

                    <span className="text-gray-600 font-medium">
                        Total Price
                    </span>

            <span className="text-3xl font-bold text-sky-700">
                        ${booking.price} NZD
                    </span>

          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-4">

          <Link
              href="/search"
              className="text-center bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors"
          >
            Book Another Flight
          </Link>

          <button
              onClick={handleCancel}
              disabled={cancelling}
              className="border border-red-300 text-red-600 font-semibold px-6 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelButtonText}
          </button>

        </div>

      </div>

  );
}