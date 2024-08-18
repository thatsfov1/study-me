"use client";
import React, { useState } from "react";
import { CalendarIcon, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
  FormItem,
  FormLabel,
} from "../ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";

const taskSchema = z.object({
  name: z.string().min(3, {
    message: "Name of the task must be at least 3 characters.",
  }),
  description: z.string(),
  deadline: z.optional(
    z.date({
      required_error: "A date of birth is required.",
    })
  ),
  time: z
    .string()
    .refine((value) => Number(value) > 0, {
      message: "Provide the time of the task",
    })
    .refine((value) => Number(value) < 2400, {
      message:
        "Time of the task can't be longer than 24 hours, if the task is large, break it into small ones",
    }),
});

const TaskMenu: React.FC = () => {
  const [confirmation, setConfirmation] = useState(false);

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      time: "0000",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4 h-auto"
      >
        {!confirmation && (
          <>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="name"
                      placeholder="Practice problem-solving exercises"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what exactly do you need to accomplish in this task"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Clear understanding of task helps you to be more productive
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date of deadline</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    A deadline makes people work faster
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time to complete the task</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription>
                    {Number(field.value) === 0
                      ? "Setting the time for the task helps you concentrate"
                      : `Time of the task: ${
                          Number(field.value.slice(0, 2)) === 1
                            ? `${Number(field.value.slice(0, 2))} hour`
                            : Number(field.value.slice(0, 2)) === 0
                            ? ""
                            : `${Number(field.value.slice(0, 2))} hours`
                        } ${
                          Number(field.value.slice(0, 2)) === 0 ||
                          Number(field.value.slice(2, 4)) === 0
                            ? ""
                            : "and"
                        } ${
                          Number(field.value.slice(2, 4)) === 1
                            ? `${Number(field.value.slice(2, 4))} minute`
                            : Number(field.value.slice(2, 4)) === 0
                            ? ""
                            : `${Number(field.value.slice(2, 4))} minutes`
                        }`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full p-6">
              {!isLoading ? "Create a task" : <Loader />}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
};

export default TaskMenu;
