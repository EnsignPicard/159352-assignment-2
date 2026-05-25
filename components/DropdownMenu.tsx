"use client";
import { ChangeEvent } from "react";

interface Airport {
    _id: string;
    name: string;
    code: string;
    region: string;
    tz: string;
}

interface DropdownProps {
    label: string;
    items: Airport[];
    value: string;
    onChange: (value: string) => void;
}

const DropdownMenu = ({ label, items, value, onChange }: DropdownProps) => {

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
            <select
                value={value}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 bg-white"
            >
                {items.map((item) => (
                    <option key={item.code} value={item.code}>
                        {item.name} ({item.code})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default DropdownMenu;