"use server";
import { Session, Subscription, Task, User, environment } from "./supabase.types";
import { sessions, environments, users, tasks } from "../../../migrations/schema";
import db from "./db";
import { validate } from "uuid";
import { eq, and, notExists, ilike } from "drizzle-orm";
import { collaborators } from "./schema";

export const createEnvironment = async (environment: environment) => {
  try {
    const response = await db.insert(environments).values(environment);
    return { data: null, error: null };
  } catch (error) {
    console.log(error);
    //@ts-ignore
    return { data: null, error: error?.message };
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

export const getSessions = async (environmentId: string) => {
  const isValid = validate(environmentId);

  if (!isValid) {
    return {
      data: null,
      error: "Error",
    };
  }
  try {
    const results: Session[] | [] = await db
      .select()
      .from(sessions)
      .orderBy(sessions.created_at)
      .where(eq(sessions.environment_id, environmentId));
    return { data: results, error: null };
  } catch (error) {
    return { data: null, error: `Error ${error}` };
  }
};

export const getTaskDetails = async (taskId: string) => {
  const isValid = validate(taskId);
  if (!isValid) {
    data: [];
    error: 'Error';
  }
  try {
    const response = (await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1)) as Task[];
    return { data: response, error: null };
  } catch (error) {
    console.log('🔴Error', error);
    return { data: [], error: 'Error' };
  }
};

export const getTasks = async (sessionId: string) => {
  const isValid = validate(sessionId);
  if (!isValid) return { data: null, error: 'Error' };
  try {
    const results = (await db
      .select()
      .from(tasks)
      .orderBy(tasks.created_at)
      .where(eq(tasks.session_id, sessionId))) as Task[] | [];
    return { data: results, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: 'Error' };
  }
};

export const getEnvironmentDetails = async (environmentId: string) => {
  const isValid = validate(environmentId);
  if (!isValid)
    return {
      data: [],
      error: 'Error',
    };

  try {
    const response = (await db
      .select()
      .from(environments)
      .where(eq(environments.id, environmentId))
      .limit(1)) as environment[];
    return { data: response, error: null };
  } catch (error) {
    console.log(error);
    return { data: [], error: 'Error' };
  }
};

export const getSessionDetails = async (sessionId: string) => {
  const isValid = validate(sessionId);
  if (!isValid) {
    data: [];
    error: 'Error';
  }

  try {
    const response = (await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1)) as Session[];

    return { data: response, error: null };
  } catch (error) {
    return { data: [], error: 'Error' };
  }
};

export const deleteSession = async (sessionId: string) => {
  const isValid = validate(sessionId);

  if (!isValid) {
    return {
      data: null,
      error: "Error",
    };
  }
  await db.delete(sessions).where(eq(sessions.id, sessionId));
};

export const deleteTask = async (taskId: string) => {
  const isValid = validate(taskId);

  if (!isValid) {
    return {
      data: null,
      error: "Error",
    };
  }
  await db.delete(tasks).where(eq(tasks.id, taskId));
};

export const getPrivateEnvironments = async (userId: string) => {
  if (!userId) return [];

  const privateEnvironments = (await db
    .select({
      id: environments.id,
      created_at: environments.created_at,
      environment_owner: environments.environment_owner,
      title: environments.title,
      data: environments.data,
      in_trash: environments.in_trash,
    })
    .from(environments)
    .where(
      and(
        notExists(
          db
            .select()
            .from(collaborators)
            .where(eq(collaborators.environment_id, environments.id))
        ),
        eq(environments.environment_owner, userId)
      )
    )) as environment[];
  return privateEnvironments;
};

export const getCollaboratingEnvironments = async (userId: string) => {
  if (!userId) return [];

  const collaboratedEnvironments = (await db
    .select({
      id: environments.id,
      created_at: environments.created_at,
      environment_owner: environments.environment_owner,
      title: environments.title,
      data: environments.data,
      in_trash: environments.in_trash,
    })
    .from(users)
    .innerJoin(collaborators, eq(users.id, collaborators.user_id))
    .innerJoin(environments, eq(collaborators.environment_id, environments.id))
    .where(eq(users.id, userId))) as environment[];
  return collaboratedEnvironments;
};

export const getSharedEnvironments = async (userId: string) => {
  if (!userId) return [];
  const sharedWorkspaces = (await db
    .selectDistinct({
      id: environments.id,
      created_at: environments.created_at,
      environment_owner: environments.environment_owner,
      title: environments.title,
      data: environments.data,
      in_trash: environments.in_trash,
    })
    .from(environments)
    .orderBy(environments.created_at)
    .innerJoin(collaborators, eq(environments.id, collaborators.environment_id))
    .where(eq(environments.environment_owner, userId))) as environment[];
  return sharedWorkspaces;
};

export const addCollaborators = async (users: User[], environmentId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.user_id, user.id), eq(u.environment_id, environmentId)),
    });
    if (!userExists)
      await db
        .insert(collaborators)
        .values({ environment_id: environmentId, user_id: user.id });
  });
};

export const removeCollaborators = async (users: User[], environmentId: string) => {
  const response = users.forEach(async (user: User) => {
    const userExists = await db.query.collaborators.findFirst({
      where: (u, { eq }) =>
        and(eq(u.user_id, user.id), eq(u.environment_id, environmentId)),
    });
    if (userExists)
      await db
        .delete(collaborators)
        .where(
          and(
            eq(collaborators.environment_id, environmentId),
            eq(collaborators.user_id, user.id)
          )
        );
  });
};

export const createSession = async (session: Session) => {
  try {
    const response = await db.insert(sessions).values(session);
    return { data: null, error: null };
  } catch (err) {
    console.log(err);
    return { data: null, error: "Error" };
  }
};

export const createTask = async (task: Task) => {
  try {
    const response = await db.insert(tasks).values(task);
    return { data: null, error: null };
  } catch (err) {
    console.log(err);
    return { data: null, error: err.message };
  }
};

export const updateSession = async (
  session: Partial<Session>,
  sessionId: string
) => {
  try {
    await db.update(sessions).set(session).where(eq(sessions.id, sessionId));
    return { data: null, error: null };
  } catch (err) {
    console.log(err);
    return { data: null, error: "Error" };
  }
};

export const updateTask = async (
  task: Partial<Task>,
  taskId: string
) => {
  try {
    await db.update(tasks).set(task).where(eq(tasks.id, taskId));
    return { data: null, error: null };
  } catch (err) {
    console.log(err);
    return { data: null, error: "Error" };
  }
};

export const updateEnvironment = async (
  environment: Partial<environment>,
  environmentId: string
) => {
  try {
    await db.update(environments).set(environment).where(eq(environments.id, environmentId));
    return { data: null, error: null };
  } catch (err) {
    console.log(err);
    return { data: null, error: "Error" };
  }
};

export const updateProfile = async (profile: Partial<User>, userId: string) => {
  if (!userId) return;
  const response = await db
    .update(users)
    .set(profile)
    .where(eq(users.id, userId));
  return response;
};

export const deleteEnvironment = async (environmentId: string) => {
  if (!environmentId) return;

  await db.delete(environments).where(eq(environments.id, environmentId));
};

export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];
  const accounts = await db
    .select()
    .from(users)
    .where(ilike(users.email, `${email}%`));
  return accounts;
};

export const findUser = async (userId: string) => {
  const response = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });

  return response;
};

export const getCollaborators = async (environmentId: string) => {
  const response = await db
    .select()
    .from(collaborators)
    .where(eq(collaborators.environment_id, environmentId));

  if (!response.length) return [];

  const userInformation: Promise<User | undefined>[] = response.map(
    async (user) => {
      const exists = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, user.user_id),
      });
      return exists;
    }
  );

  const resolvedUsers = await Promise.all(userInformation);
  return resolvedUsers.filter(Boolean) as User[];
};
