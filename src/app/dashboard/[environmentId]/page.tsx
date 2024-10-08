export const dynamic = 'force-dynamic';
import QuillEditor from '@/components/quill-editor/quill-editor'
import { getEnvironmentDetails } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import React from 'react'

const EnvironmentPage = async ({params}:{params: {environmentId:string}}) => {

  const {data, error} = await getEnvironmentDetails(params.environmentId)
  if(error || !data?.length) {
    console.log('env err' ,error )
    redirect('/dashboard')
  }

  return (
    <div className='relative'>
      {data[0].title}
      {/* <QuillEditor dirType="environment" fileId={params.environmentId} dirDetails={data[0] || {}} /> */}
    </div>
  )
}

export default EnvironmentPage