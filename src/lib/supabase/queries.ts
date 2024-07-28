"use server";
import { Folder, Subscription, session } from "./supabase.types";
import { folders, sessions } from "../../../migrations/schema";
import db from "./db";
import { validate } from "uuid";
import { eq,and, notExists } from "drizzle-orm";

export const createSession = async (session: session) => {
  try {
    const response = await db.insert(sessions).values(session);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const data = await db.query.subscriptions.findFirst({
      where: (s, { eq }) => eq(s.id, userId),
    });
    if (data) return { data: data as Subscription, error: null };
    else return { data: null, error: null };
  } catch (e) {
    console.log(e);
    return { data: null, error: `Error ${e}` };
  }
};

export const getFolders = async (sessionId: string) => {
  const isValid = validate(sessionId);

  if (!isValid) {
    return {
      data: null,
      error: "Error",
    };
  }

  try {
    const results: Folder[] | [] = await db
      .select()
      .from(folders)
      .orderBy(folders.created_at)
      .where(eq(folders.session_id, sessionId));
      return {data:results, error:null }
  } catch (error) {
    return {data:null, error:`Error ${error}` }

  }
};


export const getPrivateSessions =  async (userId:string) => {
    if(!userId) return []

    const privateSessions = await db.select({
      id: sessions.id,
      created_at: sessions.created_at,
      session_owner: sessions.session_owner,
      title: sessions.title,
      data: sessions.data,
      in_trash: sessions.in_trash,
    }).from(sessions).where(and(notExists(db.select().from())))
}