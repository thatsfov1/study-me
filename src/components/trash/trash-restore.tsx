"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Session } from "@/lib/supabase/supabase.types";
import { FileIcon } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const TrashRestore = () => {
  const { state, dispatch, environmentId, sessionId } = useAppState();
  const [sessions, setSessions] = useState<Session[] | []>([]);

  useEffect(() => {
    const stateSessions =
      state.environments
        .find((environment) => environment.id === environmentId)
        ?.sessions.filter((session) => session.in_trash) || [];
    setSessions(stateSessions);
  }, [state,sessionId]);

  return (
    <section >
      {!!sessions.length && (
        <>
          <h3>Sessions</h3>
          {sessions.map((session) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${session.environment_id}/${session.id}`}
              key={session.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {session.title}
                </aside>
              </article>
            </Link>
          ))}
        </>
      )}

      {!sessions.length && (
        <div
          className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2
        "
        >
            No items in Trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
