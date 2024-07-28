import { z } from 'zod'

export const FormSchema = z.object({
    email:z.string().describe('Email').email({message: 'Invalid email'}),
    password:z.string().describe('Password').min(1, "Password is required")
})


export const CreateSessionFormSchema = z.object({
    sessionName: z
      .string()
      .describe('Session Name')
      .min(1, 'Session name must be min of 1 character'),
  });