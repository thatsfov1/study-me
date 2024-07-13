"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { v4 as uuidv4 } from 'uuid';

type TGoal = {
  id: string;
  title: string;
  time?: number;
  description?: string;
};

const Dashboard = () => {
  const [goals, setGoals] = useState<TGoal[]>([]);
  const [goalTitle, setGoalTitle] = useState('')

  const handleSubmit = (e:any) => {
    const goal = {
        id: uuidv4(),
        title:goalTitle,
    };
    e.preventDefault();
    setGoals((prev) => [
        ...prev,
        goal
    ])
    setGoalTitle('')
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="px-8 py-4 relative w-[80vw]">
        <h1 className="text-3xl font-bold text-slate-800">
          What's your goal for today's session
        </h1>
        <ul className="p-4">
          {goals && goals.map((goal: TGoal) => (
            <li className="text-lg" key={goal.id}>{goal.title}</li>
          ))}
        </ul>
        <form onSubmit={(e:any) => handleSubmit(e)}>
          <input
            value={goalTitle}
            onChange={(e) => setGoalTitle(e.target.value)}
            className="border-none w-[400px] p-4 pb-80 focus:outline-none"
            type="text"
            placeholder="Add a task you need to do today"
          />
        </form>
        {goals.length > 0 ? <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
         Move to next phase
        </div> : <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
         Skip this part
        </div>}
        
      </div>
    </div>
  );
};

export default Dashboard;
