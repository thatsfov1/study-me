// import React, { useState } from "react";
// import styled from "styled-components";
// import { TGoal } from "../../app/types/goals";

// const TimerWrapper = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #000;
//   padding: 20px;
// `;

// const InputWrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   margin: 0 10px;
// `;

// const Label = styled.span`
//   font-size: 12px;
//   color: #aaa;
//   margin-bottom: 5px;
// `;

// const NumberInput = styled.input`
//   width: 70px;
//   height: 60px;
//   font-size: 2rem;
//   text-align: center;
//   border: none;
//   color: #000;
//   outline: none;
//   ::-webkit-inner-spin-button,
//   ::-webkit-outer-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//   ::-moz-appearance: textfield;
// `;

// const Separator = styled.span`
//   font-size: 2rem;
//   margin: 0 5px;
// `;

// type TimerProps = {
//   setActive: React.Dispatch<React.SetStateAction<boolean>>;
//   setGoals: React.Dispatch<React.SetStateAction<TGoal[]>>;
//   goal: TGoal;
// };

// const Timer = ({ setGoals, goal, setActive }: TimerProps) => {
//   const [hours, setHours] = useState(0);
//   const [minutes, setMinutes] = useState(0);
//   const [seconds, setSeconds] = useState(0);

//   const handleChange = (setter: any) => (e: any) => {
//     const value = Math.max(0, Math.min(Number(e.target.value), 59));
//     setter(value);
//   };

//   const handleSaveTime = () => {
//     const newTime = {
//       hours,
//       minutes,
//       seconds,
//     };
//     if (newTime !== goal.time) {
//       setGoals((prevGoals) =>
//         prevGoals.map((g) => (g.id === goal.id ? { ...g, time: newTime } : g))
//       );
//     }
//     setActive(false);
//   };

//   return (
//     <div>
//       <TimerWrapper>
//         <InputWrapper>
//           <Label>hr</Label>
//           <NumberInput
//             type="number"
//             value={hours}
//             onChange={(e) =>
//               setHours(Math.max(0, Math.min(Number(e.target.value), 23)))
//             }
//           />
//         </InputWrapper>
//         <Separator>:</Separator>
//         <InputWrapper>
//           <Label>min</Label>
//           <NumberInput
//             type="number"
//             value={minutes}
//             onChange={handleChange(setMinutes)}
//           />
//         </InputWrapper>
//         <Separator>:</Separator>
//         <InputWrapper>
//           <Label>sec</Label>
//           <NumberInput
//             type="number"
//             value={seconds}
//             onChange={handleChange(setSeconds)}
//           />
//         </InputWrapper>
//       </TimerWrapper>
//       <button
//         className="py-1 px-2 bg-slate-200 rounded-lg"
//         onClick={handleSaveTime}
//       >
//         Set the time
//       </button>
//     </div>
//   );
// };

// export default Timer;
