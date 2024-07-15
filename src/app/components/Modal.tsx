import React, { Dispatch, ReactNode, SetStateAction } from "react";

type Props = {
  active: boolean;
  setActive: Dispatch<SetStateAction<boolean>>;
  children: ReactNode;
};

const Modal = ({ active, setActive, children }: Props) => {
  return (
    <div
      className={`modal ${active && "active"}`}
      onClick={() => setActive(false)}
    >
      <div
        className="modal-content relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
