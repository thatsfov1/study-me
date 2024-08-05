import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect } from "react";
import { useAppState } from "../providers/state-provider";
import { useRouter } from "next/navigation";
import { Session } from "../supabase/supabase.types";

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const { dispatch, state, environmentId: selectedEnvironment } = useAppState();

  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 RECEIVED REAL TIME EVENT");
            const {
              session_id: sessionId,
              environment_id: environmentId,
              id: fileId,
            } = payload.new;
            if (
              !state.environments
                .find((environment) => environment.id === environmentId)
                ?.sessions.find((session) => session.id === sessionId)
            ) {
              const newSession: Session = {
                id: payload.new.id,
                environment_id: payload.new.workspace_id,
                created_at: payload.new.created_at,
                title: payload.new.title,
                data: payload.new.data,
                in_trash: payload.new.in_trash,
              };
              dispatch({
                type: "ADD_SESSION",
                payload: { session: newSession, environment_id: environmentId },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let environmentId = "";
            let sessionId = "";
            const fileExists = state.environments.some((environment) =>
              environment.sessions.some((session) => {
                if (session.id === payload.old.id) {
                  environmentId = environment.id;
                  sessionId = session.id;
                  return true;
                }
              })
            );
            if (fileExists && environmentId && sessionId) {
              router.replace(`/dashboard/${environmentId}`);
              dispatch({
                type: "DELETE_SESSION",
                payload: { sessionId, environment_id: environmentId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { session_id: sessionId, environment_id: environmentId } = payload.new;
            state.environments.some((environment) =>
              environment.sessions.some((session) => {
                if (session.id === payload.new.id) {
                  dispatch({
                    type: "UPDATE_SESSION",
                    payload: {
                      environment_id: environmentId,
                      sessionId,
                      session: {
                        title: payload.new.title,
                        in_trash: payload.new.in_trash,
                      },
                    },
                  });
                  return true;
                }
              })
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, state, selectedEnvironment]);

  return null;
};

export default useSupabaseRealtime;
