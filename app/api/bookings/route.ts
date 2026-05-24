import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";

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

  // Find the schedule
  const schedule = await mydb.collection("schedules").findOne({
    _id: new ObjectId(scheduleId),
  });

  if (!schedule) {
    return Response.json({ error: "Flight not found" }, { status: 404 });
  }

  // Check seat availability
  if (schedule.bookings.length >= schedule.seats) {
    return Response.json({ error: "No seats available on this flight" }, { status: 409 });
  }

  // Get price and aircraft from routes collection
  const routeDoc = await mydb.collection("routes").findOne({
    orig: schedule.orig,
    dest: schedule.dest,
  });

  // Get airport details
  const origDoc = await mydb.collection("airports").findOne({ code: schedule.orig });
  const destDoc = await mydb.collection("airports").findOne({ code: schedule.dest });

  // Generate unique booking reference
  let bookingRef = generateBookingRef();
  while (await mydb.collection("bookings").findOne({ bookingRef })) {
    bookingRef = generateBookingRef();
  }

  // Create the booking document
  const booking = {
    bookingRef: bookingRef,
    scheduleId: schedule._id,
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
      title: title || "",
      firstname: firstname,
      lastname: lastname,
      email: email.toLowerCase(),
    },
    createdAt: new Date(),
  };

  // Insert booking into bookings collection
  const result = await mydb.collection("bookings").insertOne(booking);

  // Push booking ID into schedule's bookings array
  await mydb.collection("schedules").updateOne(
    { _id: schedule._id },
      { $push: { bookings: result.insertedId } as any }
  );

  return Response.json(booking, { status: 201 });
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const email = params.get("email");

  if (!email) {
    return Response.json({ error: "Email parameter required" }, { status: 400 });
  }

  const mydb = await connectDB();
  const bookings = await mydb
    .collection("bookings")
    .find({ "passenger.email": email.toLowerCase() })
    .sort({ depDate: 1 })
    .toArray();

  return Response.json(bookings);
}
