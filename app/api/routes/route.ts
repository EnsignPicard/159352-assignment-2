import { connectDB } from "@/lib/mongodb";

export async function GET() {
    const mydb = await connectDB();
    const routes = await mydb.collection("routes").find().toArray();
    return Response.json(routes);
}