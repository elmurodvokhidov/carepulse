'use server';

import { ID, Query } from "node-appwrite";
import { APPOINTMENT_COLLECTION_ID, DATABASE_ID, databases, messaging } from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";
import { revalidatePath } from "next/cache";

export async function createAppointment(appointment: CreateAppointmentParams) {
    try {
        const newAppointment = await databases.createDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
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
            APPOINTMENT_COLLECTION_ID!,
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
            APPOINTMENT_COLLECTION_ID!,
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

export async function updateAppointment({
    appointmentId,
    userId,
    appointment,
    type,
}: UpdateAppointmentParams) {
    try {
        const updatedAppointment = await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentId,
            appointment
        );

        if (!updatedAppointment) throw Error;

        const smsMessage = `Greetings from CarePulse. ${type === "schedule" ? `Your appointment is confirmed for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}` : `We regret to inform that your appointment for ${formatDateTime(appointment.schedule!).dateTime} is cancelled. Reason:  ${appointment.cancellationReason}`}.`;
        await sendSMSNotification(userId, smsMessage);

        revalidatePath("/admin");
        return parseStringify(updatedAppointment);
    } catch (error) {
        console.log(error);
    }
}

export async function sendSMSNotification(userId: string, content: string) {
    try {
        const message = await messaging.createSms(
            ID.unique(),
            content,
            [],
            [userId],
        );

        return parseStringify(message);
    } catch (error) {
        console.log(error);
    }
}