'use client'
import { MAX_FOLDERS_PER_FREE } from '@/lib/constants'
import { useAppState } from '@/lib/providers/state-provider'
import { Subscription } from '@/lib/supabase/supabase.types'
import React, { useEffect, useState } from 'react'
import { Progress } from '../ui/progress'

interface PlanUsageProps {
    foldersLength: number
    subscription: Subscription | null
}



const PlanUsage:React.FC<PlanUsageProps> = ({foldersLength, subscription}) => {
    const {sessionId, state} = useAppState()
    const [usagePercentage, setUsagePercentage] = useState((foldersLength/MAX_FOLDERS_PER_FREE)*100)
    useEffect(() => {
        const stateFoldersLength = state.sessions.find((session) => session.id === sessionId)?.folders.length

        if(stateFoldersLength === undefined) return;
        setUsagePercentage((stateFoldersLength/MAX_FOLDERS_PER_FREE)*100)
    }, [sessionId, state])
    
  return (
    <article className='mb-4'>
        {subscription?.status !== 'active' && (
            <div className='flex justify-between items-center w-full'>
                <div>Free plan</div>
                <small>{usagePercentage.toFixed(0)}% /100%</small>
            </div>
        )}
        {subscription?.status !== 'active' && <Progress className='h-1' value={usagePercentage}/>}
    </article>
  )
}

export default PlanUsage