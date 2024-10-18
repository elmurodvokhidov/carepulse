'use server';

import { ID } from "node-appwrite";
import { APPOINTMENT_COLLACTION_ID, DATABASE_ID, databases } from "../appwrite.config";
import { parseStringify } from "../utils";

export async function createAppointment(appointment: CreateAppointmentParams) {
    try {
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLACTION_ID!,
            ID.unique(),
            appointment,
        );

        return parseStringify(newAppointment);
    } catch (error) {
        console.log(error);
    }
}

export async function getAppointment(appointmentId: string) {
    try {
        const appointment = await databases.getDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLACTION_ID!,
            appointmentId,
        );

        return parseStringify(appointment);
    } catch (error) {
        console.log(error);
    }
}