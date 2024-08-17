import React from 'react'
import CustomDialogTrigger from '../global/custom-dialog-trigger'
import TrashRestore from './trash-restore'


interface TrashProps {
    children : React.ReactNode
}

const Trash:React.FC<TrashProps> = ({children}) => {
  return (
    <CustomDialogTrigger content={<TrashRestore/>} header='Trash'>
        {children}
    </CustomDialogTrigger>
  )
}

export default Trash