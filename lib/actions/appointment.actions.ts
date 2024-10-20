'use server';

import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLACTION_ID, DATABASE_ID, databases } from "../appwrite.config";
import { parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";

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

export async function getRecentAppointmentList() {
    try {
        const appointments = await databases.listDocuments(
            DATABASE_ID!,
            APPOINTMENT_COLLACTION_ID!,
            [Query.orderDesc('$createdAt')]
        );

        const initialCounts = {
            scheduledCount: 0,
            pendingCount: 0,
            cancelledCount: 0,
        };

        const counts = (appointments.documents as Appointment[]).reduce((acc, value) => {
            if (value.status === "scheduled") {
                acc.scheduledCount += 1;
            } else if (value.status === "pending") {
                acc.pendingCount += 1;
            } else if (value.status === "cancelled") {
                acc.cancelledCount += 1;
            }

            return acc;
        }, initialCounts);

        const data = {
            totalCount: appointments.total,
            ...counts,
            documents: appointments.documents
        };

        return parseStringify(data);
    } catch (error) {
        console.log(error);
    }
}