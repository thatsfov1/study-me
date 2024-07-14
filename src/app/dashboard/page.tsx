"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { v4 as uuidv4 } from "uuid";
import { TGoal } from "../types/goals";
import SingleGoal from "../components/SingleGoal";

const Dashboard = () => {
  const [goals, setGoals] = useState<TGoal[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (goalTitle.length > 0) {
      const goal = {
        id: uuidv4(),
        title: goalTitle,
      };

      setGoals((prev) => [...prev, goal]);
      setGoalTitle("");
    }
  };
  // TODO: end edit funtional
  const handleEditGoal = () => {
    setEditMode(true);
  };

  const handleDeleteGoal = (id: string) => {
    const filteredGoals = goals.filter((goal) => goal.id !== id);
    setGoals(filteredGoals);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="px-8 py-4 relative w-[80vw]">
        <h1 className="text-3xl font-bold text-slate-800">
          What's your goal for today's session
        </h1>
        <ul className="p-4">
          {goals &&
            goals.map((goal: TGoal) => (
              <SingleGoal
                key={goal.id}
                handleDeleteGoal={handleDeleteGoal}
                handleEditGoal={handleEditGoal}
                goal={goal}
              />
            ))}
        </ul>
        <form onSubmit={(e: any) => handleSubmit(e)}>
          <input
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            className="border-none w-[400px] p-4 pb-80 focus:outline-none"
            type="text"
            placeholder="Add a task you need to do today"
          />
        </form>
        {goals.length > 0 ? (
          <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
            Move to next phase
          </div>
        ) : (
          <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
            Skip this part
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
