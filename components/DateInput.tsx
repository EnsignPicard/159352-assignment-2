/*
component for our date chooser
Passes selected date value back to parent through onChange.
 */

"use client";
import { ChangeEvent } from "react";

interface DateInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
}

const DateInput = ({ label, name, value, onChange }: DateInputProps) => {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <input
                type="date"
                name={name}
                value={value}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            />
        </div>
    );
};

export default DateInput;