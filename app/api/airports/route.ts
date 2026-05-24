import { connectDB } from "@/lib/mongodb";

export async function GET() {
  const mydb = await connectDB();
  const airports = await mydb.collection("airports").find().toArray();
  return Response.json(airports);
}
