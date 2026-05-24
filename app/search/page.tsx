"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Airport {
  _id: string;
  name: string;
  code: string;
  region: string;
  tz: string;
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

function formatDate(dateStr: string, tz: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-NZ", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  }).format(date);
}

export default function SearchPage() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [orig, setOrig] = useState("");
  const [dest, setDest] = useState("");
  const [date1, setDate1] = useState("2026-06-01");
  const [date2, setDate2] = useState("2026-06-30");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [selectedFlight, setSelectedFlight] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [title, setTitle] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    fetch("/api/airports")
      .then((res) => res.json())
      .then((data) => {
        setAirports(data);
        if (data.length > 0) {
          setOrig(data[0].code);
          const other = data.find((a: Airport) => a.code !== data[0].code);
          if (other) setDest(other.code);
        }
      });
  }, []);

  const handleSearch = async () => {
    if (orig === dest) {
      alert("Origin and destination must be different");
      return;
    }
    setLoading(true);
    setSearched(true);
    setSelectedFlight("");
    setShowBookingForm(false);
    setBookingError("");
    const res = await fetch(
      `/api/schedules/search?orig=${orig}&dest=${dest}&date1=${date1}&date2=${date2}`
    );
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleSelectFlight = (id: string) => {
    setSelectedFlight(id);
    setShowBookingForm(true);
    setBookingError("");
  };

  const handleBook = async () => {
    if (!firstname || !lastname || !email) {
      setBookingError("Please fill in all required fields");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduleId: selectedFlight,
        title,
        firstname,
        lastname,
        email,
      }),
    });
    const data = await res.json();
    setBookingLoading(false);
    if (res.ok) {
      router.push(`/booking/${data.bookingRef}`);
    } else {
      setBookingError(data.error || "Booking failed");
    }
  };

  // Filter destinations to exclude selected origin
  const destOptions = airports.filter((a) => a.code !== orig);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Search Flights</h1>

      {/* Search form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From</label>
            <select
              value={orig}
              onChange={(e) => {
                setOrig(e.target.value);
                if (e.target.value === dest) {
                  const other = airports.find((a) => a.code !== e.target.value);
                  if (other) setDest(other.code);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            >
              {airports.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To</label>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            >
              {destOptions.map((a) => (
                <option key={a.code} value={a.code}>
                  {a.name} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">From date</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">To date</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </div>

      {/* Search results */}
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
              {results.entries.map((entry) => (
                <label
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedFlight === entry.id
                      ? "border-sky-500 bg-sky-50"
                      : entry.seats_avail
                      ? "border-gray-200 hover:border-sky-300 hover:bg-gray-50"
                      : "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <input
                    type="radio"
                    name="flight"
                    value={entry.id}
                    disabled={!entry.seats_avail}
                    checked={selectedFlight === entry.id}
                    onChange={() => handleSelectFlight(entry.id)}
                    className="accent-sky-700"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {entry.flight_no}
                    </div>
                    <div className="text-sm text-gray-600">
                      Departs: {formatDate(entry.depDate, results.orig?.tz)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Arrives: {formatDate(entry.arrDate, results.dest?.tz)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-sky-700">${results.price}</div>
                    <div className={`text-xs ${entry.seats_avail ? "text-green-600" : "text-red-500"}`}>
                      {entry.seats_avail
                        ? `${entry.seats_remaining} seat${entry.seats_remaining !== 1 ? "s" : ""} left`
                        : "Full"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Booking form */}
      {showBookingForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Passenger Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
              >
                <option value="">Select...</option>
                <option value="Mr">Mr</option>
                <option value="Mrs">Mrs</option>
                <option value="Ms">Ms</option>
                <option value="Dr">Dr</option>
              </select>
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              />
            </div>
          </div>

          {bookingError && (
            <p className="text-red-500 text-sm mb-4">{bookingError}</p>
          )}

          <button
            onClick={handleBook}
            disabled={bookingLoading}
            className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
          >
            {bookingLoading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      )}
    </div>
  );
}
