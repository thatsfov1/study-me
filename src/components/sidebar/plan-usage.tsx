'use client'
import { MAX_SESSIONS_PER_FREE } from '@/lib/constants'
import { useAppState } from '@/lib/providers/state-provider'
import { Subscription } from '@/lib/supabase/supabase.types'
import React, { useEffect, useState } from 'react'
import { Progress } from '../ui/progress'

interface PlanUsageProps {
    sessionsLength: number
    subscription: Subscription | null
}



const PlanUsage:React.FC<PlanUsageProps> = ({sessionsLength, subscription}) => {
    const {environmentId, state} = useAppState()
    const [usagePercentage, setUsagePercentage] = useState((sessionsLength/MAX_SESSIONS_PER_FREE)*100)
    useEffect(() => {
        const stateSessionsLength = state.environments.find((environment) => environment.id === environmentId)?.sessions.length

        if(stateSessionsLength === undefined) return;
        setUsagePercentage((stateSessionsLength/MAX_SESSIONS_PER_FREE)*100)
    }, [environmentId, state])
    
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