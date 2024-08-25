import { Task as TTask } from "@/lib/supabase/supabase.types";
import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import TooltipComponent from "../global/tooltip-component";
import { CalendarIcon, PencilLine, Trash } from "lucide-react";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { useAppState } from "@/lib/providers/state-provider";
import { updateTask } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import Task from "./task-setup";

type TaskDropdownProps = {
  task: TTask;
};

const TaskDropdown: React.FC<TaskDropdownProps> = ({ task }) => {
  const { title, description, id, deadline } = task;
  const { state, dispatch, environmentId, sessionId } = useAppState();
  const { user } = useSupabaseUser();
  const { toast } = useToast();

  const moveToTrash = async () => {
    if (!user || !environmentId || !sessionId) return;
    dispatch({
      type: "UPDATE_TASK",
      payload: {
        task: { in_trash: `Deleted by ${user?.email}` },
        sessionId,
        environmentId,
        taskId: id,
      },
    });
    const { data, error } = await updateTask(
      { in_trash: `Deleted by ${user?.email}` },
      id
    );
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: `Failed to move task to trash `,
      });
    } else {
      toast({
        title: "Success",
        description: `Moved task to trash `,
      });
    }
  };

  return (
    <AccordionItem
      className="relative text-md w-[90%]"
      value={id}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <AccordionTrigger
        id="task"
        className="hover:no-underline 
        p-4 
        text-sm"
      >
        <div className="whitespace-nowrap outline-none overflow-hidden cursor-pointer flex justify-between items-center w-full relative text-lg group/task">
          <div className="overflow-hidden">{title}</div>
          <div className="h-full hidden rounded-sm absolute right-0 items-center justify-center group-hover/task:block ">
            <div className="flex gap-3">
              <Task isForEditing task={task}>
                <TooltipComponent message="Edit task">
                  <PencilLine
                    size={15}
                    className="text-muted-foreground hover:text-black transition-colors"
                  />
                </TooltipComponent>
              </Task>
              <TooltipComponent message="Delete Task">
                <Trash
                  onClick={moveToTrash}
                  size={15}
                  className="text-muted-foreground hover:text-black transition-colors"
                />
              </TooltipComponent>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        <div className="flex flex-col gap-4">
          <p>{description}</p>
          {deadline && <p className='flex gap-2 items-center'>
            <CalendarIcon className="h-4 w-4 " />
            {deadline.toDateString()}
          </p>}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TaskDropdown;
