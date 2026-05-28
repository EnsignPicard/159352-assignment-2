/*
home page for air dairyflat
loads airports and displays destinations
*/

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Airport {
    _id: string;
    name: string;
    code: string;
    region: string;
}

export default function Home() {

    const [airports, setAirports] = useState<Airport[]>([]);

    useEffect(() => {

        fetch("/api/airports")
            .then((res) => res.json())
            .then((data) => {
                setAirports(data);
            });

    }, []);

    let destinations = airports.filter((airport) => {
        return airport.code !== "NZNE";
    });

    let hub = airports.find((airport) => {
        return airport.code === "NZNE";
    });

    return (
        <div className="space-y-10">

            <section className="bg-sky-700 text-white rounded-2xl p-10 text-center shadow-lg">

                <img
                    src="/logo.svg"
                    alt="Air DairyFlat"
                    className="h-32 w-auto mx-auto mb-4"
                />

                <h1 className="text-4xl font-bold mb-3">
                    Welcome to Air DairyFlat
                </h1>

                <p className="text-lg text-sky-100 mb-6">
                    Boutique air travel from{" "}
                    {hub?.name ?? "Dairy Flat Airport"},
                    Auckland North Shore
                </p>

                <div className="flex justify-center gap-4">

                    <Link
                        href="/search"
                        className="bg-white text-sky-700 font-semibold px-6 py-3 rounded-lg hover:bg-sky-50 transition-colors"
                    >
                        Search Flights
                    </Link>

                    <Link
                        href="/bookings"
                        className="border border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        My Bookings
                    </Link>

                </div>

            </section>

            <section>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Our Fleet
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                        <h3 className="font-bold text-lg text-sky-700">
                            SyberJet SJ30i
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            6 passengers
                        </p>

                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                        <h3 className="font-bold text-lg text-sky-700">
                            Cirrus SF50
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            4 passengers
                        </p>

                    </div>

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">

                        <h3 className="font-bold text-lg text-sky-700">
                            HondaJet Elite
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            5 passengers
                        </p>

                    </div>

                </div>

            </section>

            <section>

                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    Our Destinations
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {destinations.map((airport) => (

                        <div
                            key={airport._id}
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex justify-between items-center"
                        >

                            <div>

                                <h3 className="font-bold text-gray-800">
                                    {airport.name}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    {airport.region}
                                </p>

                            </div>

                            <span className="text-sm font-mono bg-sky-50 text-sky-700 px-3 py-1 rounded-full">
                                {airport.code}
                            </span>

                        </div>

                    ))}

                </div>

            </section>

        </div>
    );
}