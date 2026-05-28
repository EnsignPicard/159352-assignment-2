/*
searches schedules between selected airports and dates
*/

import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import { Schedule, Route, Airport } from "@/lib/types";

async function getDate(params: URLSearchParams, key: string, defv: string, endOfDay: boolean) {
    const dateStr = params.get(key) || defv;
    // we interpret dates as NZ time UTC+12 so searches match local
    const timeStr = endOfDay ? "T23:59:59+12:00" : "T00:00:00+12:00";
    return new Date(dateStr + timeStr);
}

export async function GET(request: Request) {
    const params = new URL(request.url).searchParams;
    const orig = params.get("orig");
    const dest = params.get("dest");
    const dt1 = await getDate(params, "date1", "2026-06-01", false);
    const dt2 = await getDate(params, "date2", "2026-12-31", true);

    const mydb = await connectDB();

    const origDoc = await mydb.collection<Airport>("airports").findOne({ code: orig });
    const destDoc = await mydb.collection<Airport>("airports").findOne({ code: dest });

    // Get prices and aircraft from our routes collection
    const routeDoc = await mydb.collection<Route>("routes").findOne({ orig: orig, dest: dest });

    const myquery = {
        orig: orig,
        dest: dest,
        depDate: { $gte: dt1, $lte: dt2 },
    };

    const scheds = await mydb.collection<Schedule>("schedules").find(myquery).toArray();

    const entries: {
        id: ObjectId;
        flight_no: string;
        depDate: Date;
        arrDate: Date;
        seats_avail: boolean;
        seats_remaining: number;
    }[] = [];

    for (const doc of scheds) {
        const avail = doc.bookings.length < doc.seats;
        const entry = {
            id: doc._id,
            flight_no: doc.flightNo,
            depDate: doc.depDate,
            arrDate: doc.arrDate,
            seats_avail: avail,
            seats_remaining: doc.seats - doc.bookings.length,
        };
        entries.push(entry);
    }

    const response = {
        orig: origDoc,
        dest: destDoc,
        date_search: { from: dt1, to: dt2 },
        price: routeDoc?.price ?? 0,
        aircraft: routeDoc?.aircraft ?? "Unknown",
        entries: entries,
    };

    return Response.json(response);
}