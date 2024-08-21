"use client";
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { Session, Task, environment } from "../supabase/supabase.types";
import { usePathname } from "next/navigation";
import { getTasks } from "../supabase/queries";

export type appSessionsType = Session & { tasks: Task[] | [] };
export type appEnvironmentsType = environment & {
  sessions: appSessionsType[] | [];
};

interface AppState {
  environments: appEnvironmentsType[] | [];
}

type Action =
  | { type: "ADD_ENVIRONMENT"; payload: appEnvironmentsType }
  | { type: "DELETE_ENVIRONMENT"; payload: string }
  | {
      type: "UPDATE_ENVIRONMENT";
      payload: {
        environment: Partial<appEnvironmentsType>;
        environmentId: string;
      };
    }
  | {
      type: "SET_ENVIRONMENTS";
      payload: { environments: appEnvironmentsType[] | [] };
    }
  | {
      type: "SET_SESSIONS";
      payload: { environmentId: string; sessions: [] | appSessionsType[] };
    }
  | {
      type: "ADD_SESSION";
      payload: { environmentId: string; session: appSessionsType };
    }
  | {
      type: "DELETE_SESSION";
      payload: { environmentId: string; sessionId: string };
    }
  | {
      type: "UPDATE_SESSION";
      payload: {
        session: Partial<Session>;
        environmentId: string;
        sessionId: string;
      };
    }
  | {
      type: "ADD_TASK";
      payload: { environmentId: string; task: Task; sessionId: string };
    }
  | {
      type: "DELETE_TASK";
      payload: { environmentId: string; sessionId: string; taskId: string };
    }
  | {
      type: "SET_TASKS";
      payload: { environmentId: string; tasks: Task[]; sessionId: string };
    }
  | {
      type: "UPDATE_TASK";
      payload: {
        task: Partial<Task>;
        sessionId: string;
        environmentId: string;
        taskId: string;
      };
    };

const initialState: AppState = { environments: [] };

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case "ADD_ENVIRONMENT":
      return {
        ...state,
        environments: [...state.environments, action.payload],
      };
    case "DELETE_ENVIRONMENT":
      return {
        ...state,
        environments: state.environments.filter(
          (environment) => environment.id !== action.payload
        ),
      };
    case "UPDATE_ENVIRONMENT":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              ...action.payload.environment,
            };
          }
          return environment;
        }),
      };
    case "SET_ENVIRONMENTS":
      return {
        ...state,
        environments: action.payload.environments,
      };
    case "SET_SESSIONS":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              sessions: action.payload.sessions.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              ),
            };
          }
          return environment;
        }),
      };
    case "ADD_SESSION":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          return {
            ...environment,
            sessions: [...environment.sessions, action.payload.session].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ),
          };
        }),
      };
    case "UPDATE_SESSION":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              sessions: environment.sessions.map((session) => {
                if (session.id === action.payload.sessionId) {
                  return { ...session, ...action.payload.session };
                }
                return session;
              }),
            };
          }
          return environment;
        }),
      };
    case "DELETE_SESSION":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              sessions: environment.sessions.filter(
                (session) => session.id !== action.payload.sessionId
              ),
            };
          }
          return environment;
        }),
      };

    case "ADD_TASK":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              sessions: environment.sessions.map((session) => {
                if (session.id === action.payload.sessionId) {
                  return {
                    ...session,
                    tasks: [...session.tasks, action.payload.task].sort(
                      (a, b) =>
                        new Date(a.created_at).getTime() -
                        new Date(b.created_at).getTime()
                    ),
                  };
                }
                return session;
              }),
            };
          }
          return environment;
        }),
      };
    case "DELETE_TASK":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              session: environment.sessions.map((session) => {
                if (session.id === action.payload.sessionId) {
                  return {
                    ...session,
                    tasks: session.tasks.filter(
                      (task) => task.id !== action.payload.taskId
                    ),
                  };
                }
                return session;
              }),
            };
          }
          return environment;
        }),
      };
    case "UPDATE_TASK":
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environmentId) {
            return {
              ...environment,
              sessions: environment.sessions.map((session) => {
                if (session.id === action.payload.sessionId) {
                  return {
                    ...session,
                    tasks: session.tasks.map((task) => {
                      if (task.id === action.payload.taskId) {
                        return {
                          ...task,
                          ...action.payload.task,
                        };
                      }
                      return task;
                    }),
                  };
                }
                return session;
              }),
            };
          }
          return environment;
        }),
      };
    default:
      return initialState;
  }
};

const AppStateContext = createContext<
  | {
      state: AppState;
      dispatch: Dispatch<Action>;
      environmentId: string | undefined;
      sessionId: string | undefined;
    }
  | undefined
>(undefined);

interface AppStateProviderProps {
  children: React.ReactNode;
}

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pathname = usePathname();

  const environmentId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);
    if (urlSegments)
      if (urlSegments.length > 1) {
        return urlSegments[1];
      }
  }, [pathname]);

  const sessionId = useMemo(() => {
    const urlSegments = pathname?.split("/").filter(Boolean);
    if (urlSegments)
      if (urlSegments?.length > 2) {
        return urlSegments[2];
      }
  }, [pathname]);

  // useEffect(() => {
  //   if (!sessionId || !environmentId) return;
  //   const fetchFiles = async () => {
  //     const { error: tasksError, data } = await getTasks(sessionId);
  //     if (tasksError) {
  //       console.log(tasksError);
  //     }
  //     if (!data) return;
  //     dispatch({
  //       type: 'SET_TASKS',
  //       payload: { environment_id:environmentId, tasks: data, sessionId },
  //     });
  //   };
  //   fetchFiles();
  // }, [sessionId, environmentId]);


  useEffect(() => {
    console.log("App State Changed", state);
  }, [state]);

  return (
    <AppStateContext.Provider
      value={{ state, dispatch, environmentId, sessionId }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
