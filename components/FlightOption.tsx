/*
flight selection card
handleChange sends selected flight id to parent
*/

"use client";

import { ChangeEvent } from "react";
import { formatDate } from "@/lib/formatDate";

interface FlightEntry {
    id: string;
    flight_no: string;
    depDate: string;
    arrDate: string;
    seats_avail: boolean;
    seats_remaining: number;
}

interface FlightOptionProps {
    entry: FlightEntry;
    tz: string;
    price: number;
    selectedId: string;
    onChange: (value: string) => void;
}

const FlightOption = ({
                          entry,
                          tz,
                          price,
                          selectedId,
                          onChange,
                      }: FlightOptionProps) => {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const depDate = formatDate(entry.depDate, tz);

    let seatsMsg = "";

    if (entry.seats_avail) {
        if (entry.seats_remaining === 1) {
            seatsMsg = "1 seat left";
        } else {
            seatsMsg = `${entry.seats_remaining} seats left`;
        }
    } else {
        seatsMsg = "Full";
    }

    let cardStyle = "";

    if (!entry.seats_avail) {
        cardStyle =
            "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed";
    } else if (selectedId === entry.id) {
        cardStyle =
            "border-sky-500 bg-sky-50 cursor-pointer";
    } else {
        cardStyle =
            "border-gray-200 hover:border-sky-300 hover:bg-gray-50 cursor-pointer";
    }

    return (
        <label
            className={`block p-4 rounded-lg border transition-colors ${cardStyle}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">

                <input
                    type="radio"
                    name="flightchoice"
                    value={entry.id}
                    checked={selectedId === entry.id}
                    disabled={!entry.seats_avail}
                    onChange={handleChange}
                    className="accent-sky-700"
                />

                <div className="flex-1">

                    <span className="font-semibold text-gray-800">
                        {entry.flight_no}
                    </span>

                    <span className="text-sm text-gray-600 ml-2">
                        {depDate}
                    </span>

                </div>

                <div className="flex gap-3 items-center text-sm">

                    <span
                        className={
                            entry.seats_avail
                                ? "text-green-600"
                                : "text-red-500"
                        }
                    >
                        {seatsMsg}
                    </span>

                    <span className="font-bold text-sky-700">
                        ${price}
                    </span>

                </div>
            </div>
        </label>
    );
};

export default FlightOption;