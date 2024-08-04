import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect } from "react";
import { useAppState } from "../providers/state-provider";
import { useRouter } from "next/navigation";
import { Folder } from "../supabase/supabase.types";

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const { dispatch, state, sessionId: selectedSession } = useAppState();

  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 RECEIVED REAL TIME EVENT");
            const {
              folder_id: folderId,
              session_id: sessionId,
              id: fileId,
            } = payload.new;
            if (
              !state.sessions
                .find((session) => session.id === sessionId)
                ?.folders.find((folder) => folder.id === folderId)
            ) {
              const newFolder: Folder = {
                id: payload.new.id,
                session_id: payload.new.workspace_id,
                created_at: payload.new.created_at,
                title: payload.new.title,
                data: payload.new.data,
                in_trash: payload.new.in_trash,
              };
              dispatch({
                type: "ADD_FOLDER",
                payload: { folder: newFolder, session_id: sessionId },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let sessionId = "";
            let folderId = "";
            const fileExists = state.sessions.some((session) =>
              session.folders.some((folder) => {
                if (folder.id === payload.old.id) {
                  sessionId = session.id;
                  folderId = folder.id;
                  return true;
                }
              })
            );
            if (fileExists && sessionId && folderId) {
              router.replace(`/dashboard/${sessionId}`);
              dispatch({
                type: "DELETE_FOLDER",
                payload: { folderId, session_id: sessionId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { folder_id: folderId, session_id: sessionId } = payload.new;
            state.sessions.some((session) =>
              session.folders.some((folder) => {
                if (folder.id === payload.new.id) {
                  dispatch({
                    type: "UPDATE_FOLDER",
                    payload: {
                      session_id: sessionId,
                      folderId,
                      folder: {
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
  }, [supabase, state, selectedSession]);

  return null;
};

export default useSupabaseRealtime;
