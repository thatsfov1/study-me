import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { TGoal } from "../types/goals";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import db from "@/lib/supabase/db";
import { redirect } from "next/navigation";
import DashboardSetup from "@/components/dashboard/dashboard-setup";
import { getUserSubscriptionStatus } from "@/lib/supabase/queries";

const Dashboard = async () => {

  const supabase = createServerComponentClient({cookies})
  const {data:{user}} = await supabase.auth.getUser();
  if(!user) return

  const environment = await db.query.environments.findFirst({
    where: (environment, {eq}) => eq(environment.environment_owner, user.id) 
  })

  const {data:subscription, error:subscriptionError} = await getUserSubscriptionStatus(user.id) 

  if(subscriptionError) return;
  
  if(!environment){
    return (
    <div className="bg-background h-screen w-screen flex justify-center items-center">
      <DashboardSetup user={user} subscription={subscription}/>
    </div>
    )
  } 

  redirect(`/dashboard/${environment.id}`)

  // const [goals, setGoals] = useState<TGoal[]>([]);
  // const [goalTitle, setGoalTitle] = useState("");

  // const handleSubmit = (e: any) => {
  //   e.preventDefault();
  //   if (goalTitle.length > 0) {
  //     const goal = {
  //       id: uuidv4(),
  //       title: goalTitle,
  //     };

  //     setGoals((prev) => [...prev, goal]);
  //     setGoalTitle("");
  //   }
  // };

  // const handleDeleteGoal = (id: string) => {
  //   const filteredGoals = goals.filter((goal) => goal.id !== id);
  //   setGoals(filteredGoals);
  // };

  // return (
  //   <div className="flex">
  //     <div className="px-8 py-4 relative w-[80vw]">
  //       <h1 className="text-3xl font-bold text-slate-800">
  //         What's your goal for today's environment
  //       </h1>
  //       {/* <ul className="p-4">
  //         {goals &&
  //           goals.map((goal: TGoal) => (
  //             <SingleGoal
  //               key={goal.id}
  //               handleDeleteGoal={handleDeleteGoal}
  //               goal={goal}
  //               setGoals={setGoals}
  //             />
  //           ))}
  //       </ul>
  //       <form onSubmit={(e: any) => handleSubmit(e)}>
  //         <input
  //           value={goalTitle}
  //           onChange={(e) => setGoalTitle(e.target.value)}
  //           className="border-none w-[400px] p-4 pb-80 focus:outline-none"
  //           type="text"
  //           placeholder="Add a task you need to do today"
  //         />
  //       </form>
  //       {goals.length > 0 ? (
  //         <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
  //           Move to next phase
  //         </div>
  //       ) : (
  //         <div className="absolute bottom-4 right-4 py-2 px-8 bg-slate-200 rounded-lg cursor-pointer">
  //           Skip this part
  //         </div>
  //       )} */}
  //     </div>
  //   </div>
  // );
};

export default Dashboard;
