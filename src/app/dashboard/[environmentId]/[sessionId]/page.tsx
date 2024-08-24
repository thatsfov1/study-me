export const dynamic = 'force-dynamic';
import QuillEditor from '@/components/quill-editor/quill-editor'
import { getSessionDetails } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import React from 'react'

const SessionPage = async ({params}:{params: {sessionId:string}}) => {

  const {data, error} = await getSessionDetails(params.sessionId)
  if(error || !data?.length) {
    console.log('error',error)
    redirect('/dashboard')
  }
  console.log('selectedDir',data)
  return (
  <div className='relative'>
      <QuillEditor fileId={params.sessionId} dirDetails={data[0] || {}} />
    </div>
  )
}

export default SessionPage