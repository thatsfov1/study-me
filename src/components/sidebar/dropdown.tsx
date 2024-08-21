"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useState, useMemo } from "react";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { updateSession } from "@/lib/supabase/queries";
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
  const { state, dispatch, environmentId, sessionId } = useAppState();
  const { user } = useSupabaseUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = async () => {
    setIsEditing(false);
    const fId = id.split("session");
    if (!sessionTitle) return;
    await updateSession({ title }, fId[0]);
  };

  const moveToTrash = async () => {
    if (!user || !environmentId) return;
    const pathId = id.split("session");
    dispatch({
      type: "UPDATE_SESSION",
      payload: {
        session: { in_trash: `Deleted by ${user?.email}` },
        sessionId: pathId[0],
        environmentId,
      },
  });
    const { data, error } = await updateSession(
      { in_trash: `Deleted by ${user?.email}` },
      pathId[0]
    );
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to move session to trash `,
      });
    } else {
      toast({
        title: "Success",
        description: `Moved session to trash `,
      });
    }
  };

  const navigatePage = (accordionId: string) => {
    router.push(`/dashboard/${environmentId}/${accordionId}`);
  };

  const sessionTitle: string | undefined = useMemo(() => {
    const stateTitle = state.environments
      .find((environment) => environment.id === environmentId)
      ?.sessions.find((session) => session.id === id)?.title;
    if (title === stateTitle || !stateTitle) return title;
    return stateTitle;
  }, [state, environmentId]);

  const sessionTitleChange = (e: any) => {
    if (!environmentId) return;
    const fId = id.split("session");
    dispatch({
      type: "UPDATE_SESSION",
      payload: {
        session: { title: e.target.value },
        sessionId: fId[0],
        environmentId,
      },
    });
  };

  return (
    <div
      className="relative border-none text-md"
      onClick={(e) => {
        e.stopPropagation();
        navigatePage(id);
      }}
    >
      <div className="hover:no-underline text-muted-foreground text-md">
        <div className="text-black whitespace-nowrap flex justify-between items-center w-full relative group/session">
          <div className="overflow-hidden">
            <input
              onDoubleClick={handleDoubleClick}
              onBlur={handleBlur}
              readOnly={!isEditing}
              type="text"
              value={sessionTitle}
              onChange={sessionTitleChange}
              className={clsx("outline-none overflow-hidden w-[140px]", {
                "bg-muted cursor-text": isEditing,
                "bg-transparent cursor-pointer": !isEditing,
              })}
            />
          </div>
          <div className="h-full hidden rounded-sm absolute right-0 items-center justify-center group-hover/session:block">
            <TooltipComponent message="Delete Session">
              <Trash
                onClick={moveToTrash}
                size={15}
                className="hover:text-black transition-colors"
              />
            </TooltipComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
