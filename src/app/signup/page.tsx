'use client'
import React from 'react'
import { Input } from '../components/Input'

const Signup = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center ">
      <div className="p-8 shadow-md rounded-lg text-center">
        <p className="text-2xl mb-4 font-bold">Sign up</p>
        <div className="flex flex-col gap-4">
          <Input placeholder="Your name" type="text" />
          <Input placeholder="johndoe@gmail.com" type="text" />
          <Input placeholder="*********" type="password" />
          <Input placeholder="*********" type="password" />
          <button className='text-xl py-2 px-4 bg-indigo-500 text-white rounded-lg'>Sign Up</button>
        </div>
      </div>
    </div>
  )
}

export default Signup