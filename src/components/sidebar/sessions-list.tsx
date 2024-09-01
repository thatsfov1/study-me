"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Session } from "@/lib/supabase/supabase.types";
import React, { useState, useEffect } from "react";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { v4 } from "uuid";
import { useToast } from "../ui/use-toast";
import { createSession } from "@/lib/supabase/queries";
import SingleSession from "./single-session";
import useSupabaseRealtime from "@/lib/hooks/useSupabaseRealtime";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";

interface SessionsDropdownListProps {
  environmentSessions: Session[];
  environmentId: string;
}

const SessionsDropdownList: React.FC<SessionsDropdownListProps> = ({
  environmentSessions,
  environmentId,
}) => {
  useSupabaseRealtime()
  const { state, dispatch, sessionId } = useAppState();
  const [sessions, setSessions] = useState(environmentSessions);
  const {open, setOpen} = useSubscriptionModal()
  const { subscription } = useSupabaseUser();
  const { toast } = useToast();

  useEffect(() => {
    if (environmentSessions.length > 0) {
      dispatch({
        type: 'SET_SESSIONS',
        payload: {
          environmentId,
          sessions: environmentSessions.map((session) => ({
              ...session,
              tasks:
                state.environments
                  .find((env) => env.id === environmentId)
                  ?.sessions.find((s) => s.id === session.id)?.tasks || [],
            })),
        },
      });
    }
  }, [environmentSessions, environmentId]);
  

  useEffect(() => {
    setSessions(
      state.environments.find((environment) => environment.id === environmentId)?.sessions || []
    );
  }, [state, environmentId]);

  const addSessionHandler = async () => {
    if (sessions.length >= 100 && !subscription) {
      setOpen(true);
      return;
    }
    const newSession: Session = {
      id: v4(),
      created_at: new Date().toISOString(),
      title: `Session ${new Date().toLocaleDateString()} ` ,
      in_trash: null,
      environment_id: environmentId,
    };
    console.log(newSession);
    dispatch({
      type: "ADD_SESSION",
      payload: { environmentId, session: { ...newSession, tasks:[] } },
    });
    const { data, error } = await createSession(newSession);
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create the session",
      });
    } else {
      toast({
        title: "Success",
        description: "Created session.",
      });
    }
  };
  return (
    <>
      <div
        className="flex
    sticky 
    z-20 
    top-0 
    bg-background 
    w-full  
    h-10 
    group/title 
    justify-between 
    items-center 
    pr-4 
"
      >
        <span
          className="
    font-bold 
    text-xs"
        >
          SESSIONS
        </span>
        <TooltipComponent message="Create Session">
          <PlusIcon
            onClick={addSessionHandler}
            size={16}
            className="group-hover/title:inline-block 
            hidden 
        cursor-pointer
        text-muted-foreground transition-all
        hover:text-black
      "
          />
        </TooltipComponent>
      </div>
      <div
        className="pb-20"
      >

        {sessions
          .filter((session) => !session.in_trash)
          .map((session) => (
            <SingleSession key={session.id} title={session.title} id={session.id} />
          ))}
      </div>
    </>
  );
};

export default SessionsDropdownList;
