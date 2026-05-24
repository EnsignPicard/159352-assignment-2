import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

interface BookingEntry {
  bookingRef: string;
  passenger: {
    title: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  createdAt: Date;
}

interface Schedule {
  _id: ObjectId;
  flightNo: string;
  orig: string;
  dest: string;
  depDate: Date;
  arrDate: Date;
  seats: number;
  bookings: BookingEntry[];
}

interface Route {
  _id: ObjectId;
  orig: string;
  dest: string;
  aircraft: string;
  price: number;
}

interface Airport {
  _id: ObjectId;
  name: string;
  code: string;
  region: string;
  tz: string;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const mydb = await connectDB();

  // Find the schedule containing this booking reference
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
    passenger: booking.passenger,
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

  // Find the schedule containing this booking
  const schedule = await mydb.collection<Schedule>("schedules").findOne({
    "bookings.bookingRef": ref,
  });

  if (!schedule) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // Pull the booking from the embedded array
  await mydb.collection<Schedule>("schedules").updateOne(
      { _id: schedule._id },
      { $pull: { bookings: { bookingRef: ref } } }
  );

  return Response.json({ message: "Booking cancelled", bookingRef: ref });
}