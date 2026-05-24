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

function generateBookingRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { scheduleId, title, firstname, lastname, email } = body;

  if (!scheduleId || !firstname || !lastname || !email) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const mydb = await connectDB();

  const schedule = await mydb.collection<Schedule>("schedules").findOne({
    _id: new ObjectId(scheduleId),
  });

  if (!schedule) {
    return Response.json({ error: "Flight not found" }, { status: 404 });
  }

  if (schedule.bookings.length >= schedule.seats) {
    return Response.json({ error: "No seats available on this flight" }, { status: 409 });
  }

  const routeDoc = await mydb.collection<Route>("routes").findOne({
    orig: schedule.orig,
    dest: schedule.dest,
  });

  const origDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.orig });
  const destDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.dest });

  // Generate unique booking reference across all schedules
  let bookingRef = generateBookingRef();
  while (await mydb.collection<Schedule>("schedules").findOne({ "bookings.bookingRef": bookingRef })) {
    bookingRef = generateBookingRef();
  }

  // Embed booking within the schedule document
  const bookingEntry: BookingEntry = {
    bookingRef: bookingRef,
    passenger: {
      title: title || "",
      firstname: firstname,
      lastname: lastname,
      email: email.toLowerCase(),
    },
    createdAt: new Date(),
  };

  await mydb.collection<Schedule>("schedules").updateOne(
      { _id: schedule._id },
      { $push: { bookings: bookingEntry } }
  );

  // Return full booking details for the confirmation page
  const response = {
    bookingRef: bookingRef,
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
    passenger: bookingEntry.passenger,
    createdAt: bookingEntry.createdAt,
  };

  return Response.json(response, { status: 201 });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const email = params.get("email");

  if (!email) {
    return Response.json({ error: "Email parameter required" }, { status: 400 });
  }

  const mydb = await connectDB();
  const emailLower = email.toLowerCase();

  // Find all schedules that have a booking with this email
  const schedules = await mydb.collection<Schedule>("schedules").find({
    "bookings.passenger.email": emailLower,
  }).toArray();

  // Extract matching bookings and combine with schedule/route/airport details
  const results = [];

  for (const schedule of schedules) {
    const routeDoc = await mydb.collection<Route>("routes").findOne({
      orig: schedule.orig,
      dest: schedule.dest,
    });
    const origDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.orig });
    const destDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.dest });

    for (const booking of schedule.bookings) {
      if (booking.passenger.email === emailLower) {
        results.push({
          _id: schedule._id,
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
        });
      }
    }
  }

  results.sort((a, b) => new Date(a.depDate).getTime() - new Date(b.depDate).getTime());

  return Response.json(results);
}