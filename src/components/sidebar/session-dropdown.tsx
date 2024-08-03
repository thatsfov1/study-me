"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { session } from "@/lib/supabase/supabase.types";
import React, { useEffect, useState } from "react";
import SelectedSession from "./selected-session";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import SessionCreator from "../global/session-creator";

interface SessionDropdownProps {
  privateSessions: session[] | [];
  sharedSessions: session[] | [];
  collaboratingSessions: session[] | [];
  defaultValue: session | undefined;
}

const SessionDropdown: React.FC<SessionDropdownProps> = ({
  privateSessions,
  sharedSessions,
  collaboratingSessions,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.sessions.length) {
      dispatch({
        type: "SET_SESSIONS",
        payload: {
          sessions: [
            ...privateSessions,
            ...sharedSessions,
            ...collaboratingSessions,
          ].map((session) => ({ ...session, folders: [] })),
        },
      });
    }
  }, [privateSessions, sharedSessions, collaboratingSessions]);

  const handleSelect = (option: session) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const findSelectedWorkspace = state.sessions.find(
      (session) => session.id === defaultValue?.id
    );
    if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
  }, [state, defaultValue]);

  return (
    <div
      className=" relative inline-block
      text-left
  "
    >
      <div>
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedSession session={selectedOption} />
          ) : (
            'Select a session'
          )}
        </span>
      </div>
      {isOpen && (
        <div
          className="origin-top-right
          absolute
          w-full
          rounded-md
          shadow-md
          z-50
          h-[190px]
          backdrop-blur-lg
          group
          overflow-scroll
          border-[1px]
          border-muted
      "
        >
          <div className="rounded-md flex flex-col">
            <div className="!p-2">
              {!!privateSessions.length && (
                <>
                  <p className="text-muted-foreground">Private</p>
                  <hr></hr>
                  {privateSessions.map((option) => (
                    <SelectedSession
                      key={option.id}
                      session={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!sharedSessions.length && (
                <>
                  <p className="text-muted-foreground">Shared</p>
                  <hr />
                  {sharedSessions.map((option) => (
                    <SelectedSession
                      key={option.id}
                      session={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!collaboratingSessions.length && (
                <>
                  <p className="text-muted-foreground">Collaborating</p>
                  <hr />
                  {collaboratingSessions.map((option) => (
                    <SelectedSession
                      key={option.id}
                      session={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
            </div>
            <CustomDialogTrigger
              header="Create A Session"
              content={<SessionCreator />}
              description="You can change your session settings after creating the session too."
            >
              <div
                className="flex 
              transition-all 
              hover:bg-muted 
              justify-center 
              items-center 
              gap-2 
              p-2 
              w-full"
              >
                <article
                  className="text-slate-500 
                rounded-full
                 w-4 
                 h-4 
                 flex 
                 items-center 
                 justify-center"
                >
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDropdown;
