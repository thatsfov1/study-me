"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { environment } from "@/lib/supabase/supabase.types";
import React, { useEffect, useState } from "react";
import SelectedEnvironment from "./selected-environment";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import EnvironmentCreator from "../global/environment-creator";

interface EnvironmentDropdownProps {
  privateEnvironments: environment[] | [];
  sharedEnvironments: environment[] | [];
  collaboratingEnvironments: environment[] | [];
  defaultValue: environment | undefined;
}

const EnvironmentDropdown: React.FC<EnvironmentDropdownProps> = ({
  privateEnvironments,
  sharedEnvironments,
  collaboratingEnvironments,
  defaultValue,
}) => {
  const { dispatch, state } = useAppState();
  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!state.environments.length) {
      dispatch({
        type: "SET_ENVIRONMENTS",
        payload: {
          environments: [
            ...privateEnvironments,
            ...sharedEnvironments,
            ...collaboratingEnvironments,
          ].map((environment) => ({ ...environment, sessions: [] })),
        },
      });
    }
  }, [privateEnvironments, sharedEnvironments, collaboratingEnvironments]);

  const handleSelect = (option: environment) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const findSelectedEnvironment = state.environments.find(
      (environment) => environment.id === defaultValue?.id
    );
    if (findSelectedEnvironment) setSelectedOption(findSelectedEnvironment);
  }, [state, defaultValue]);

  return (
    <div
      className="relative inline-block
      text-left
  "
    >
      <div>
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedEnvironment environment={selectedOption} />
          ) : (
            'Select an environment'
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
              {!!privateEnvironments.length && (
                <>
                  <p className="text-muted-foreground">Private</p>
                  <hr></hr>
                  {privateEnvironments.map((option) => (
                    <SelectedEnvironment
                      key={option.id}
                      environment={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!sharedEnvironments.length && (
                <>
                  <p className="text-muted-foreground">Shared</p>
                  <hr />
                  {sharedEnvironments.map((option) => (
                    <SelectedEnvironment
                      key={option.id}
                      environment={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
              {!!collaboratingEnvironments.length && (
                <>
                  <p className="text-muted-foreground">Collaborating</p>
                  <hr />
                  {collaboratingEnvironments.map((option) => (
                    <SelectedEnvironment
                      key={option.id}
                      environment={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
            </div>
            <CustomDialogTrigger
              header="Create an Environment"
              content={<EnvironmentCreator />}
              description="You can change your environment settings after creating the environment too."
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
                Create environment
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentDropdown;
