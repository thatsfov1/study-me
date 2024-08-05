'use client';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Session, environment } from '../supabase/supabase.types';
import { usePathname } from 'next/navigation';

export type appEnvironmentsType = environment & {
  sessions: Session[] | [];
};

interface AppState {
  environments: appEnvironmentsType[] | [];
}

type Action =
  | { type: 'ADD_ENVIRONMENT'; payload: appEnvironmentsType }
  | { type: 'DELETE_ENVIRONMENT'; payload: string }
  | {
      type: 'UPDATE_ENVIRONMENT';
      payload: { environment: Partial<appEnvironmentsType>; environment_id: string };
    }
  | {
      type: 'SET_ENVIRONMENTS';
      payload: { environments: appEnvironmentsType[] | [] };
    }
  | {
      type: 'SET_SESSIONS';
      payload: { environment_id: string; sessions: [] | Session[] };
    }
  | {
      type: 'ADD_SESSION';
      payload: { environment_id: string; session: Session };
    }
  | {
      type: 'DELETE_SESSION';
      payload: { environment_id: string; sessionId: string };
    }
  | {
      type: 'UPDATE_SESSION';
      payload: {
        session: Partial<Session>;
        environment_id: string;
        sessionId: string;
      };
    }

const initialState: AppState = { environments: [] };

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case 'ADD_ENVIRONMENT':
      return {
        ...state,
        environments: [...state.environments, action.payload],
      };
    case 'DELETE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.filter(
          (environment) => environment.id !== action.payload
        ),
      };
    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environment_id) {
            return {
              ...environment,
              ...action.payload.environment,
            };
          }
          return environment;
        }),
      };
    case 'SET_ENVIRONMENTS':
      return {
        ...state,
        environments: action.payload.environments,
      };
    case 'SET_SESSIONS':
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environment_id) {
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
    case 'ADD_SESSION':
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
    case 'UPDATE_SESSION':
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environment_id) {
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
    case 'DELETE_SESSION':
      return {
        ...state,
        environments: state.environments.map((environment) => {
          if (environment.id === action.payload.environment_id) {
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
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments.length > 1) {
        return urlSegments[1];
      }
  }, [pathname]);

  const sessionId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments?.length > 2) {
        return urlSegments[2];
      }
  }, [pathname]);


  useEffect(() => {
    console.log('App State Changed', state);
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
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
