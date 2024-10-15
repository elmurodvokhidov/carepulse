'use server';

import { ID, Query } from "node-appwrite";
import { users } from "../appwrite.config";
import { parseStringify } from "../utils";

export async function createUser(user: CreateUserParams) {
    try {
        const newUser = await users.create(
            ID.unique(),
            user.email,
            user.phone,
            undefined,
            user.name
        );

        console.log({ newUser });

        return parseStringify(newUser);
    } catch (error: any) {
        if (error && error?.code === 409) {
            const existingUser = await users.list([
                Query.equal('email', [user.email])
            ]);

            return existingUser?.users[0];
        }
    }
}

export async function getUser(userId: string) {
    try {
        const user = await users.get(userId);

        return parseStringify(user);
    } catch (error) {
        console.log(error);
    }
}