import { House, Trash2, Settings as SettingsIcon, Music } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import Settings from '../settings/settings'

interface NativeNavigationProps {
    className?: string
    myEnvironmentId: string
    getSelectedElement?: (selection:string) => void
}

const NativeNavigation:React.FC<NativeNavigationProps> = ({className, myEnvironmentId,getSelectedElement}) => {
  return (
    <nav className={twMerge('my-2',className)}>
        <ul className='flex flex-col gap-2'>
            <li>
                <Link className='group/native flex gap-2' href={`/dashboard/${myEnvironmentId}`}>
                <House />
                <span>My environment</span>
                </Link>
            </li>
            <Settings>
                <li className='group/native flex gap-2'>
                <SettingsIcon />
                <span>Settings</span>
                </li>
            </Settings>
            <li>
                <Link className='group/native flex gap-2' href={`/dashboard/${myEnvironmentId}`}>
                <Music />
                <span>Background Music</span>
                </Link>
            </li>
            <li>
                <Link className='group/native flex gap-2' href={`/dashboard/${myEnvironmentId}`}>
                <Trash2 />
                <span>Trash</span>
                </Link>
            </li>
        </ul>
    </nav>
  )
}

export default NativeNavigation