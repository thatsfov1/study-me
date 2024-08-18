import React from "react";
import CustomDialogTrigger from "../global/custom-dialog-trigger";
import TaskMenu from "./task-menu";

interface TaskProps {
  children: React.ReactNode;
}

const Task: React.FC<TaskProps> = ({ children }) => {
  return (
    <CustomDialogTrigger
      content={<TaskMenu />}
      header="Create a task"
      description="You can change your task settings after creating the task too."
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default Task;
