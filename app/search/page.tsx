"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DropdownMenu from "@/components/DropdownMenu";
import DateInput from "@/components/DateInput";
import FlightOption from "@/components/FlightOption";
import PassengerForm from "@/components/PassengerForm";

interface Airport {
  _id: string;
  name: string;
  code: string;
  region: string;
  tz: string;
}

interface RouteInfo {
  orig: string;
  dest: string;
}

interface FlightEntry {
  id: string;
  flight_no: string;
  depDate: string;
  arrDate: string;
  seats_avail: boolean;
  seats_remaining: number;
}

interface SearchResult {
  orig: Airport;
  dest: Airport;
  date_search: { from: string; to: string };
  price: number;
  aircraft: string;
  entries: FlightEntry[];
}

export default function SearchPage() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [orig, setOrig] = useState("NZNE");
  const [dest, setDest] = useState("");
  const [date1, setDate1] = useState("2026-06-01");
  const [date2, setDate2] = useState("2026-06-30");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedFlight, setSelectedFlight] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    fetch("/api/airports")
        .then((res) => res.json())
        .then(setAirports);

    fetch("/api/routes")
        .then((res) => res.json())
        .then((data: RouteInfo[]) => {
          setRoutes(data);
          // Set default destination to first valid dest from NZNE
          const firstRoute = data.find((r: RouteInfo) => r.orig === "NZNE");
          if (firstRoute) setDest(firstRoute.dest);
        });
  }, []);

  // Filter destinations to only show airports that have a route from selected origin
  const validDestCodes = routes
      .filter((r) => r.orig === orig)
      .map((r) => r.dest);
  const destOptions = airports.filter((a) => validDestCodes.includes(a.code));

  // When origin changes, update dest if current dest is no longer valid
  const handleOrigChange = (value: string) => {
    setOrig(value);
    const newValidDests = routes.filter((r) => r.orig === value).map((r) => r.dest);
    if (!newValidDests.includes(dest)) {
      setDest(newValidDests[0] || "");
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (orig === dest) {
      alert("Origin and destination must be different");
      return;
    }
    setLoading(true);
    setSearched(true);
    setSelectedFlight("");
    setShowBookingForm(false);
    setBookingError("");
    const uri = `/api/schedules/search?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`;
    fetch(uri)
        .then((res) => res.json())
        .then((data) => {
          setResults(data);
          setLoading(false);
        });
  };

  const handleFlightChange = (value: string) => {
    setSelectedFlight(value);
    setShowBookingForm(true);
    setBookingError("");
  };

  const handleBooking = (title: string, firstname: string, lastname: string, email: string) => {
    if (!firstname || !lastname || !email) {
      setBookingError("Please fill in all required fields");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId: selectedFlight,
        title,
        firstname,
        lastname,
        email,
      }),
    })
        .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
        .then(({ ok, data }) => {
          setBookingLoading(false);
          if (ok) {
            router.push(`/booking/${data.bookingRef}`);
          } else {
            setBookingError(data.error || "Booking failed");
          }
        });
  };

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Search Flights</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <DropdownMenu
                  label="From"
                  items={airports}
                  value={orig}
                  onChange={handleOrigChange}
              />
              <DropdownMenu
                  label="To"
                  items={destOptions}
                  value={dest}
                  onChange={setDest}
              />
              <DateInput label="From date" name="date1" value={date1} onChange={setDate1} />
              <DateInput label="To date" name="date2" value={date2} onChange={setDate2} />
            </div>
            <button
                type="submit"
                disabled={loading || !dest}
                className="w-full sm:w-auto bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Flights"}
            </button>
          </form>
        </div>

        {searched && results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {results.orig?.name} → {results.dest?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {results.aircraft} &middot; ${results.price} NZD per seat
                </p>
              </div>

              {results.entries.length === 0 ? (
                  <p className="text-gray-500">No flights found for this route and date range.</p>
              ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Select a flight:</p>
                    {results.entries.map((entry) => (
                        <FlightOption
                            key={entry.id}
                            entry={entry}
                            tz={results.orig?.tz}
                            price={results.price}
                            selectedId={selectedFlight}
                            onChange={handleFlightChange}
                        />
                    ))}
                  </div>
              )}
            </div>
        )}

        {showBookingForm && (
            <PassengerForm
                onSubmit={handleBooking}
                loading={bookingLoading}
                error={bookingError}
            />
        )}
      </div>
  );
}