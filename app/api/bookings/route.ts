import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

interface Passenger {
  _id: ObjectId;
  title: string;
  firstname: string;
  lastname: string;
  gender: string;
  email: string;
}

interface BookingEntry {
  bookingRef: string;
  passengerId: ObjectId;
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
  const emailLower = email.toLowerCase();

  // Find or create the passenger in the passengers collection
  let passenger = await mydb.collection<Passenger>("passengers").findOne({ email: emailLower });

  if (!passenger) {
    const newPassenger = {
      title: title || "",
      firstname: firstname,
      lastname: lastname,
      gender: "",
      email: emailLower,
    };
    const result = await mydb.collection("passengers").insertOne(newPassenger);
    passenger = { _id: result.insertedId, ...newPassenger };
  }

  // Find the schedule
  const schedule = await mydb.collection<Schedule>("schedules").findOne({
    _id: new ObjectId(scheduleId),
  });

  if (!schedule) {
    return Response.json({ error: "Flight not found" }, { status: 404 });
  }

  // Check seat availability
  if (schedule.bookings.length >= schedule.seats) {
    return Response.json({ error: "No seats available on this flight" }, { status: 409 });
  }

  // Generate unique booking reference
  let bookingRef = generateBookingRef();
  while (await mydb.collection<Schedule>("schedules").findOne({ "bookings.bookingRef": bookingRef })) {
    bookingRef = generateBookingRef();
  }

  // Get route and airport details for response
  const routeDoc = await mydb.collection<Route>("routes").findOne({
    orig: schedule.orig,
    dest: schedule.dest,
  });
  const origDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.orig });
  const destDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.dest });

  // Embed booking in the schedule
  const bookingEntry: BookingEntry = {
    bookingRef: bookingRef,
    passengerId: passenger._id,
    createdAt: new Date(),
  };

  await mydb.collection<Schedule>("schedules").updateOne(
      { _id: schedule._id },
      { $push: { bookings: bookingEntry } }
  );

  // Return full details for confirmation page
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
    passenger: {
      title: passenger.title,
      firstname: passenger.firstname,
      lastname: passenger.lastname,
      email: passenger.email,
    },
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

  // Find the passenger by email
  const passenger = await mydb.collection<Passenger>("passengers").findOne({ email: emailLower });

  if (!passenger) {
    return Response.json([]);
  }

  // Find all schedules with bookings for this passenger
  const schedules = await mydb.collection<Schedule>("schedules").find({
    "bookings.passengerId": passenger._id,
  }).toArray();

  const results = [];

  for (const schedule of schedules) {
    const routeDoc = await mydb.collection<Route>("routes").findOne({
      orig: schedule.orig,
      dest: schedule.dest,
    });
    const origDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.orig });
    const destDoc = await mydb.collection<Airport>("airports").findOne({ code: schedule.dest });

    for (const booking of schedule.bookings) {
      if (booking.passengerId.equals(passenger._id)) {
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
          passenger: {
            title: passenger.title,
            firstname: passenger.firstname,
            lastname: passenger.lastname,
            email: passenger.email,
          },
          createdAt: booking.createdAt,
        });
      }
    }
  }

  results.sort((a, b) => new Date(a.depDate).getTime() - new Date(b.depDate).getTime());

  return Response.json(results);
}