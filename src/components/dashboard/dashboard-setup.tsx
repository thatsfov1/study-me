"use client";
import { AuthUser } from "@supabase/supabase-js";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { v4 } from "uuid";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Subscription, session } from "@/lib/supabase/supabase.types";
import { Button } from "../ui/button";
import Loader from "../global/loader";
import { createSession } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CreateSessionFormSchema } from "@/lib/types";
import { z } from "zod";

interface DashboardSetupProps {
  user: AuthUser;
  subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
  subscription,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { dispatch } = useAppState();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateSessionFormSchema>>({
    mode: "onChange",
    defaultValues: {
      sessionName: '',
    },
  });

  const supabase = createClientComponentClient();

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateSessionFormSchema>
  > = async (value) => {
    const sessionUUID = v4();

    try {
      const newSession: session = {
        data: null,
        created_at: new Date().toISOString(),
        id: sessionUUID,
        in_trash: "",
        title: value.sessionName,
        session_owner: user.id,
      };
      const { data, error: createError } = await createSession(newSession);
      if (createError) {
        throw new Error();
      }
      dispatch({
        type: "ADD_SESSION",
        payload: { ...newSession, folders: [] },
      });

      toast({
        title: "Session Created",
        description: `${newSession.title} has been created successfully.`,
      });

      router.replace(`/dashboard/${newSession.id}`);
    } catch (error) {
      console.log(error, "Error");
      toast({
        variant: "destructive",
        title: "Could not create your session",
        description:
          "Oops! Something went wrong, and we couldn't create your session. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create a session</CardTitle>
        <CardDescription>Let's create a session to get to work</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-full">
                <Label htmlFor="sessionName" className="text-sm ">
                  Name
                </Label>
                <Input
                  id="sessionName"
                  type="text"
                  disabled={isLoading}
                  placeholder="Session Name"
                  {...register("sessionName", {
                    required: "Session name is required",
                  })}
                />
                <small className="text-red-400">
                  {errors?.sessionName?.message?.toString()}
                </small>
              </div>
            </div>
            <div className="self-end">
              <Button disabled={isLoading} type="submit">
                {!isLoading ? "Get to work" : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
