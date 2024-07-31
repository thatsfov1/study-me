"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Folder } from "@/lib/supabase/supabase.types";
import React, { useState, useEffect } from "react";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { v4 } from "uuid";
import { useToast } from "../ui/use-toast";
import { createFolder } from "@/lib/supabase/queries";
import { Accordion } from "../ui/accordion";
import Dropdown from "./dropdown";

interface FoldersDropdownListProps {
  sessionFolders: Folder[];
  sessionId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  sessionFolders,
  sessionId,
}) => {
  const { state, dispatch, folderId } = useAppState();
  const [folders, setFolders] = useState(sessionFolders);
  const [open, setOpen] = useState(false);
  const { subscription } = useSupabaseUser();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionFolders.length > 0) {
      dispatch({
        type: "SET_FOLDERS",
        payload: { session_id: sessionId, folders: sessionFolders },
      });
    }
  }, [sessionFolders, sessionId]);

  useEffect(() => {
    setFolders(
      state.sessions.find((session) => session.id === sessionId)?.folders || []
    );
  }, [state, sessionId]);

  const addFolderHandler = async () => {
    if (folders.length >= 10 && !subscription) {
      setOpen(true);
      return;
    }
    const newFolder: Folder = {
      data: null,
      id: v4(),
      created_at: new Date().toISOString(),
      title: "Untitled",
      in_trash: null,
      session_id: sessionId,
    };
    dispatch({
      type: "ADD_FOLDER",
      payload: { session_id: sessionId, folder: { ...newFolder } },
    });
    const { data, error } = await createFolder(newFolder);
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create the folder",
      });
    } else {
      toast({
        title: "Success",
        description: "Created folder.",
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
          FOLDERS
        </span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
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
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.in_trash)
          .map((folder) => (
            <Dropdown key={folder.id} title={folder.title} id={folder.id} />
          ))}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;
