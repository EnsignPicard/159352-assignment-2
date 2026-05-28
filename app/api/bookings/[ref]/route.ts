/*
gets booking details and cancels bookings
*/

import { connectDB } from "@/lib/mongodb";
import { Passenger, Schedule, Route, Airport } from "@/lib/types";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const mydb = await connectDB();

  const schedule = await mydb.collection<Schedule>("schedules").findOne({
    "bookings.bookingRef": ref,
  });

  if (!schedule) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = schedule.bookings.find((b) => b.bookingRef === ref);
  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  const passenger = await mydb.collection<Passenger>("passengers").findOne({
    _id: booking.passengerId,
  });

  const routeDoc = await mydb.collection<Route>("routes").findOne({
    orig: schedule.orig,
    dest: schedule.dest,
  });
  const origDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.orig });
  const destDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.dest });

  const response = {
    bookingRef: booking.bookingRef,
    flightNo: schedule.flightNo,
    orig: schedule.orig,
    dest: schedule.dest,
    depDate: schedule.depDate,
    arrDate: schedule.arrDate,
    price: routeDoc?.price ?? 0,
    aircraft: routeDoc?.aircraft ?? "Unknown",
    origName: origDoc?.name ?? schedule.orig,
    destName: destDoc?.name ?? schedule.dest,
    origTz: origDoc?.tz ?? "Pacific/Auckland",
    destTz: destDoc?.tz ?? "Pacific/Auckland",
    passenger: {
      title: passenger?.title ?? "",
      firstname: passenger?.firstname ?? "",
      lastname: passenger?.lastname ?? "",
      email: passenger?.email ?? "",
    },
    createdAt: booking.createdAt,
  };

  return Response.json(response);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const mydb = await connectDB();

  const schedule = await mydb.collection<Schedule>("schedules").findOne({
    "bookings.bookingRef": ref,
  });

  if (!schedule) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  await mydb.collection<Schedule>("schedules").updateOne(
      { _id: schedule._id },
      { $pull: { bookings: { bookingRef: ref } } }
  );

  return Response.json({ message: "Booking cancelled", bookingRef: ref });
}