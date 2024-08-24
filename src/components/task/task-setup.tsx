import React from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import TaskMenu from "./task-menu";
import { Task as TTask } from "@/lib/supabase/supabase.types";

interface TaskProps {
  children: React.ReactNode;
  isForEditing?: boolean;
  task?:TTask
}

const Task: React.FC<TaskProps> = ({ children,isForEditing, task }) => {
  return (
    <CustomDialogTrigger
      content={<TaskMenu isForEditing={isForEditing} task={task} />}
      header="Create a task"
      description="You can change your task settings after creating the task too."
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default Task;
