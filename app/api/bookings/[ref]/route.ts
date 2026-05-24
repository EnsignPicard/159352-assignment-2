import { connectDB } from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const mydb = await connectDB();

  const booking = await mydb.collection("bookings").findOne({ bookingRef: ref });

  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  return Response.json(booking);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params;
  const mydb = await connectDB();

  const booking = await mydb.collection("bookings").findOne({ bookingRef: ref });

  if (!booking) {
    return Response.json({ error: "Booking not found" }, { status: 404 });
  }

  // Remove booking ID from schedule's bookings array
  await mydb.collection("schedules").updateOne(
    { _id: booking.scheduleId },
    { $pull: { bookings: booking._id } }
  );

  // Delete the booking document
  await mydb.collection("bookings").deleteOne({ _id: booking._id });

  return Response.json({ message: "Booking cancelled", bookingRef: ref });
}
