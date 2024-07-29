// "use client";
// import React, { useState } from "react";
// import { TGoal } from "../../app/types/goals";
// import { FaRegClock, FaPen, FaTrashCan } from "react-icons/fa6";
// import Modal from "../modal";
// import Timer from "./timer";
// import { IoClose } from "react-icons/io5";

// type SingleGoalProps = {
//   goal: TGoal;
//   handleDeleteGoal: (id: string) => void;
//   setGoals: React.Dispatch<React.SetStateAction<TGoal[]>>;
// };

// const SingleGoal = ({ goal, handleDeleteGoal, setGoals }: SingleGoalProps) => {
//   const [showTools, setShowTools] = useState(false);
//   const [showTimeModal, setShowTimeModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [newTitle, setNewTitle] = useState(goal.title);

//   const handleChangeExistingGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setNewTitle(e.target.value);
//   };

//   const handleBlur = () => {
//     setEditMode(false);
//     if (newTitle !== goal.title) {
//       setGoals((prevGoals) =>
//         prevGoals.map((g) => (g.id === goal.id ? { ...g, title: newTitle } : g))
//       );
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       handleBlur();
//     }
//   };

//   return (
//     <li
//       onMouseEnter={() => setShowTools(true)}
//       onMouseLeave={() => setShowTools(false)}
//       className="flex items-center text-lg px-3 py-1 hover:bg-slate-100 transition-all rounded-lg before:content-['\2022'] before:mr-1"
//     >
//       {editMode ? (
//         <input
//           className="border-gray-300 focus:border-gray-500 outline-none"
//           value={newTitle}
//           onChange={handleChangeExistingGoal}
//           onBlur={handleBlur}
//           onKeyPress={handleKeyPress}
//           autoFocus
//         />
//       ) : (
//         <span>{goal.title}</span>
//       )}

//       {showTools ? (
//         <div className="flex gap-4 ml-5 text-slate-500">
//           <div
//             onClick={() => setShowTimeModal(true)}
//             className="cursor-pointer"
//           >
//             <FaRegClock />
//           </div>
//           <div onClick={() => setEditMode(true)} className="cursor-pointer">
//             <FaPen />
//           </div>
//           <div
//             onClick={() => handleDeleteGoal(goal.id)}
//             className="cursor-pointer"
//           >
//             <FaTrashCan />
//           </div>
//         </div>
//       ) : (
//         ""
//       )}
//       <Modal active={showTimeModal} setActive={setShowTimeModal}>
//         <div
//           onClick={() => setShowTimeModal(false)}
//           className="absolute top-2 right-2 text-slate-500 cursor-pointer"
//         >
//           <IoClose />
//         </div>
//         {goal.title}
//         <p>Set the time of task</p>
//         <Timer setActive={setShowTimeModal} goal={goal} setGoals={setGoals} />
//       </Modal>
//     </li>
//   );
// };

// export default SingleGoal;
