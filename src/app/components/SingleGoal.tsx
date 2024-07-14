"use client";
import React, { useState } from "react";
import { TGoal } from "../types/goals";
import { FaRegClock, FaPen, FaTrashCan } from "react-icons/fa6";
import Modal from "./Modal";

type SingleGoalProps = {
    goal: TGoal
    handleDeleteGoal: (id: string) => void;
    handleEditGoal: () => void;
}

const SingleGoal = ({ goal, handleDeleteGoal, handleEditGoal }: SingleGoalProps) => {
  const [showTools, setShowTools] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  return (
    <li
      onMouseEnter={() => setShowTools(true)}
      onMouseLeave={() => setShowTools(false)}
      className="flex items-center text-lg px-3 py-1 hover:bg-slate-100 transition-all rounded-lg before:content-['\2022'] before:mr-1"
    >
      {goal.title}
      {showTools ? (
        <div className="flex gap-4 ml-5 text-slate-500">
          <div
            onClick={() => setShowTimeModal(true)}
            className="cursor-pointer"
          >
            <FaRegClock />
          </div>
          <div onClick={handleEditGoal} className="cursor-pointer">
            <FaPen />
          </div>
          <div onClick={() => handleDeleteGoal(goal.id)} className="cursor-pointer">
            <FaTrashCan />
          </div>
        </div>
      ) : (
        ""
      )}
      <Modal active={showTimeModal} setActive={setShowTimeModal} />
    </li>
  );
};

export default SingleGoal;
