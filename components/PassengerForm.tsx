/*
passenger details form
handleSubmit sends passenger details to parent
*/

"use client";

import { useState, FormEvent } from "react";

interface PassengerFormProps {
    onSubmit: (
        title: string,
        firstname: string,
        lastname: string,
        email: string
    ) => void;

    loading: boolean;
    error: string;
}

const PassengerForm = ({
                           onSubmit,
                           loading,
                           error,
                       }: PassengerFormProps) => {

    const [title, setTitle] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        onSubmit(
            title,
            firstname,
            lastname,
            email
        );
    };

    let buttonText = "";

    if (loading) {
        buttonText = "Booking...";
    } else {
        buttonText = "Confirm Booking";
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-4">
                Passenger Details
            </h2>

            <form onSubmit={handleSubmit}>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                    <div>

                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Title
                        </label>

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
                            First name
                            <span className="text-red-500"> *</span>
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
                            Last name
                            <span className="text-red-500"> *</span>
                        </label>

                        <input
                            type="text"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                        />

                    </div>

                    <div className="sm:col-span-2">

                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            Email
                            <span className="text-red-500"> *</span>
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                        />

                    </div>

                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50"
                >
                    {buttonText}
                </button>

            </form>
        </div>
    );
};

export default PassengerForm;