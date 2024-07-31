'use client';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import { Folder, session } from '../supabase/supabase.types';
import { usePathname } from 'next/navigation';

export type appSessionsType = session & {
  folders: Folder[] | [];
};

interface AppState {
  sessions: appSessionsType[] | [];
}

type Action =
  | { type: 'ADD_SESSION'; payload: appSessionsType }
  | { type: 'DELETE_SESSION'; payload: string }
  | {
      type: 'UPDATE_SESSION';
      payload: { session: Partial<appSessionsType>; session_id: string };
    }
  | {
      type: 'SET_SESSIONS';
      payload: { sessions: appSessionsType[] | [] };
    }
  | {
      type: 'SET_FOLDERS';
      payload: { session_id: string; folders: [] | Folder[] };
    }
  | {
      type: 'ADD_FOLDER';
      payload: { session_id: string; folder: Folder };
    }
  | {
      type: 'DELETE_FOLDER';
      payload: { session_id: string; folderId: string };
    }
  | {
      type: 'UPDATE_FOLDER';
      payload: {
        folder: Partial<Folder>;
        session_id: string;
        folderId: string;
      };
    }

const initialState: AppState = { sessions: [] };

const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
      };
    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(
          (session) => session.id !== action.payload
        ),
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id === action.payload.session_id) {
            return {
              ...session,
              ...action.payload.session,
            };
          }
          return session;
        }),
      };
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload.sessions,
      };
    case 'SET_FOLDERS':
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id === action.payload.session_id) {
            return {
              ...session,
              folders: action.payload.folders.sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              ),
            };
          }
          return session;
        }),
      };
    case 'ADD_FOLDER':
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          return {
            ...session,
            folders: [...session.folders, action.payload.folder].sort(
              (a, b) =>
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
            ),
          };
        }),
      };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id === action.payload.session_id) {
            return {
              ...session,
              folders: session.folders.map((folder) => {
                if (folder.id === action.payload.folderId) {
                  return { ...folder, ...action.payload.folder };
                }
                return folder;
              }),
            };
          }
          return session;
        }),
      };
    case 'DELETE_FOLDER':
      return {
        ...state,
        sessions: state.sessions.map((session) => {
          if (session.id === action.payload.session_id) {
            return {
              ...session,
              folders: session.folders.filter(
                (folder) => folder.id !== action.payload.folderId
              ),
            };
          }
          return session;
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
      sessionId: string | undefined;
      folderId: string | undefined;
    }
  | undefined
>(undefined);

interface AppStateProviderProps {
  children: React.ReactNode;
}

const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const pathname = usePathname();

  const sessionId = useMemo(() => {
    const urlSegments = pathname?.split('/').filter(Boolean);
    if (urlSegments)
      if (urlSegments.length > 1) {
        return urlSegments[1];
      }
  }, [pathname]);

  const folderId = useMemo(() => {
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
      value={{ state, dispatch, sessionId, folderId }}
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
