/*
shared types used across api routes
*/

import { ObjectId } from "mongodb";

export interface Passenger {
    _id: ObjectId;
    title: string;
    firstname: string;
    lastname: string;
    gender: string;
    email: string;
}

export interface BookingEntry {
    bookingRef: string;
    passengerId: ObjectId;
    createdAt: Date;
}

export interface Schedule {
    _id: ObjectId;
    flightNo: string;
    orig: string;
    dest: string;
    depDate: Date;
    arrDate: Date;
    seats: number;
    bookings: BookingEntry[];
}

export interface Route {
    _id: ObjectId;
    flightNo: string;
    orig: string;
    dest: string;
    aircraft: string;
    seats: number;
    price: number;
}

export interface Airport {
    _id: ObjectId;
    name: string;
    code: string;
    region: string;
    tz: string;
}