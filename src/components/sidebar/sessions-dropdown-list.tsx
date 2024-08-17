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
import { Accordion } from "../ui/accordion";
import Dropdown from "./dropdown";
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
        type: "SET_SESSIONS",
        payload: { environment_id: environmentId, sessions: environmentSessions },
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
      data: null,
      id: v4(),
      created_at: new Date().toISOString(),
      title: "Untitled",
      in_trash: null,
      environment_id: environmentId,
    };
    dispatch({
      type: "ADD_SESSION",
      payload: { environment_id: environmentId, session: { ...newSession } },
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
        //type="multiple"
        //defaultValue={[sessionId || ""]}
        className="pb-20"
      >
        {sessions
          .filter((session) => !session.in_trash)
          .map((session) => (
            <Dropdown key={session.id} title={session.title} id={session.id} />
          ))}
      </div>
    </>
  );
};

export default SessionsDropdownList;
