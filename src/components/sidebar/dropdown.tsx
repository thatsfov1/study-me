"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useState, useMemo } from "react";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { updateFolder } from "@/lib/supabase/queries";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon, Trash } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useToast } from "../ui/use-toast";

interface DropdownProps {
  title: string;
  id: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  disabled,
  children,
  ...props
}) => {
  const supabase = createClientComponentClient();
  const { state, dispatch, sessionId, folderId } = useAppState();
  const { user } = useSupabaseUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    const fId = id.split("folder");
    if (!folderTitle) return;
    await updateFolder({ title }, fId[0]);
  };

  const moveToTrash = async () => {
    if (!user || !sessionId) return;
    const pathId = id.split("folder");
    dispatch({
      type: "UPDATE_FOLDER",
      payload: {
        folder: { in_trash: `Deleted by ${user?.email}` },
        folderId: pathId[0],
        session_id: sessionId,
      },
    });
    const { data, error } = await updateFolder(
      { in_trash: `Deleted by ${user?.email}` },
      pathId[0]
    );
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to move folder to trash `,
      });
    } else {
      toast({
        title: "Success",
        description: `Moved folder to trash `,
      });
    }
  };

  const navigatePage = (accordionId: string) => {
    router.push(`/dashboard/${sessionId}/${accordionId}`);
  };

  const folderTitle: string | undefined = useMemo(() => {
    const stateTitle = state.sessions
      .find((session) => session.id === sessionId)
      ?.folders.find((folder) => folder.id === id)?.title;
    if (title === stateTitle || !stateTitle) return title;
    return stateTitle;
  }, [state, sessionId]);

  const folderTitleChange = (e: any) => {
    if (!sessionId) return;
    const fId = id.split("folder");
    dispatch({
      type: "UPDATE_FOLDER",
      payload: {
        folder: { title: e.target.value },
        folderId: fId[0],
        session_id: sessionId,
      },
    });
  };

  return (
    <AccordionItem
      value={id}
      className="relative border-none text-md"
      onClick={(e) => {
        e.stopPropagation();
        navigatePage(id);
      }}
    >
      <AccordionTrigger className="hover:no-underline p-2 text-muted-foreground text-sm">
        <div className="text-black whitespace-nowrap flex justify-between items-center w-full relative group/folder">
          <div className="overflow-hidden">
            <input
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              readOnly={!isEditing}
              type="text"
              value={folderTitle}
              onChange={folderTitleChange}
              className={clsx("outline-none overflow-hidden w-[140px]", {
                "bg-muted cursor-text": isEditing,
                "bg-transparent cursor-pointer": !isEditing,
              })}
            />
          </div>
          <div className="h-full hidden rounded-sm absolute right-0 items-center justify-center group-hover/folder:block">
            <TooltipComponent message="Delete Folder">
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:text-black transition-colors"
              />
            </TooltipComponent>
          </div>
        </div>
      </AccordionTrigger>
    </AccordionItem>
  );
};

export default Dropdown;
