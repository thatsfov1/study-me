"use server";
import { Folder, Subscription, User, session } from "./supabase.types";
import { folders, sessions, users } from "../../../migrations/schema";
import db from "./db";
import { validate } from "uuid";
import { eq, and, notExists,ilike } from "drizzle-orm";
import { collaborators } from "./schema";

export const createSession = async (session: session) => {
  try {
    const response = await db.insert(sessions).values(session);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error:error?.message };
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
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: `Error ${error}` };
  }
};

export const getPrivateSessions = async (userId: string) => {
  if (!userId) return [];

  const privateSessions = (await db
    .select({
      id: sessions.id,
      created_at: sessions.created_at,
      session_owner: sessions.session_owner,
      title: sessions.title,
      data: sessions.data,
      in_trash: sessions.in_trash,
    })
    .from(sessions)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.session_id, sessions.id))
        ),
        eq(sessions.session_owner, userId)
      )
    )) as session[];
  return privateSessions;
};

export const getCollaboratingSessions = async (userId: string) => {
  if (!userId) return [];

  const collaboratedSessions = (await db
    .select({
      id: sessions.id,
      created_at: sessions.created_at,
      session_owner: sessions.session_owner,
      title: sessions.title,
      data: sessions.data,
      in_trash: sessions.in_trash,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.user_id))
    .innerJoin(sessions, eq(collaborators.session_id, sessions.id))
    .where(eq(users.id, userId))) as session[];
  return collaboratedSessions;
};

export const getSharedSessions = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: sessions.id,
      created_at: sessions.created_at,
      session_owner: sessions.session_owner,
      title: sessions.title,
      data: sessions.data,
      in_trash: sessions.in_trash,
    })
    .from(sessions)
    .orderBy(sessions.created_at)
    .innerJoin(collaborators, eq(sessions.id, collaborators.session_id))
    .where(eq(sessions.session_owner, userId))) as session[];
  return sharedWorkspaces;
};

export const addCollaborators = async (users: User[], sessionId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.user_id, user.id), eq(u.session_id, sessionId)),
    });
    if(!userExists) await db.insert(collaborators).values({session_id:sessionId, user_id:user.id})
  });
};

export const createFolder = async (folder:Folder) => {
  try {
    const response = await db.insert(folders).values(folder)
    return {data:null, error:null} 
  }catch (err) {
    console.log(err)
    return {data:null, error:"Error"}
  }
}

export const updateFolder = async(folder:Partial<Folder>, folderId: string) => {
  try {
    await db.update(folders).set(folder).where(eq(folders.id, folderId))
    return {data:null, error:null} 
  }catch (err) {
    console.log(err)
    return {data:null, error:"Error"}
  }
}

export const getUsersFromSearch = async (email: string) => {
  if(!email) return []
  const accounts = await db.select().from(users).where(ilike(users.email, `${email}%`))
  return accounts
}