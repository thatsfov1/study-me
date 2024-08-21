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
import { Subscription, environment } from "@/lib/supabase/supabase.types";
import { Button } from "../ui/button";
import Loader from "../global/loader";
import { createEnvironment } from "@/lib/supabase/queries";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { CreateEnvironmentFormSchema } from "@/lib/types";
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
  } = useForm<z.infer<typeof CreateEnvironmentFormSchema>>({
    mode: "onChange",
    defaultValues: {
      environmentName: '',
    },
  });

  const supabase = createClientComponentClient();

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateEnvironmentFormSchema>
  > = async (value) => {
    const environmentUUID = v4();
    
    try {
      const newEnvironment: environment = {
        data: null,
        created_at: new Date().toISOString(),
        id: environmentUUID,
        in_trash: "",
        title: value.environmentName,
        environment_owner: user.id,
      };
      const { data, error: createError } = await createEnvironment(newEnvironment);
      if (createError) {
        throw new Error();
      }
      dispatch({
        type: "ADD_ENVIRONMENT",
        payload: { ...newEnvironment, sessions: [] },
      });

      toast({
        title: "Environment Created",
        description: `${newEnvironment.title} has been created successfully.`,
      });

      router.push(`/dashboard/${newEnvironment.id}`);
    } catch (error) {
      console.log(error, "Error");
      toast({
        variant: "destructive",
        title: "Could not create your environment",
        description:
          "Oops! Something went wrong, and we couldn't create your environment. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  return (
    <Card className="w-[800px] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle>Create an environment</CardTitle>
        <CardDescription>Let's create a environment to get to work</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-full">
                <Label htmlFor="environmentName" className="text-sm ">
                  Name
                </Label>
                <Input
                  id="environmentName"
                  type="text"
                  disabled={isLoading}
                  placeholder="Environment Name"
                  {...register("environmentName", {
                    required: "Environment name is required",
                  })}
                />
                <small className="text-red-400">
                  {errors?.environmentName?.message?.toString()}
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
