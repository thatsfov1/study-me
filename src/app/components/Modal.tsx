import React, { Dispatch, SetStateAction } from "react";

type Props = {
    active:boolean,
    setActive: Dispatch<SetStateAction<boolean>>
}

const Modal = ({active, setActive}:Props) => {
  return (
    <div
      className={`modal ${active && "active"}`}
      onClick={() => setActive(false)}
    >
      <div className='modal-content' onClick={e => e.stopPropagation()}>
        modal
      </div>
    </div>
  );
};

export default Modal;
