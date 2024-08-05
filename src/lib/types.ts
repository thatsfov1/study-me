import { Socket, Server as NetServer } from "net";
import { Server as SocketIOServer } from "socket.io";
import { NextApiResponse } from "next";
import { z } from "zod";

export const FormSchema = z.object({
  email: z.string().describe("Email").email({ message: "Invalid email" }),
  password: z.string().describe("Password").min(1, "Password is required"),
});

export const CreateEnvironmentFormSchema = z.object({
  environmentName: z
    .string()
    .describe("Environment Name")
    .min(1, "Environment name must be min of 1 character"),
});

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
