import { connectDB } from "@/lib/mongodb";
export async function GET() {
    const mydb = await connectDB();
    const mycoll = await mydb.collection("movies");
    const myquery = {year: {"$eq":1920}};
    const mydocs = await mycoll.find(myquery).toArray();
    return Response.json(mydocs);
}