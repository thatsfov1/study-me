"use client";
import React, { useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/lib/types";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/loader";
import { Input } from "@/components/ui/input";
import { actionLoginUser } from "@/lib/server-actions/auth-actions";

const Login = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>();

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (
    formData
  ) => {
    const { error } = await actionLoginUser(formData);
    if (error) {
      form.reset();
      setSubmitError(error.message);
    }
    router.replace("/dashboard");
  };

  return (
    <Form {...form}>
      <form
        onChange={() => {
          if (submitError) setSubmitError("");
        }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
      >
        <Link href="/" className="w-full flex justify-left items-center">
          {/* <Image /> suppose to be a logo */}
          <span className="font-semibold text-4xl first-letter:ml-2">
            study-me
          </span>
        </Link>
        <FormDescription>Productivity app</FormDescription>
        <FormField
          disabled={isLoading}
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" placeholder="john@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          disabled={isLoading}
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="password" placeholder="Your password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitError && <FormMessage>{submitError}</FormMessage>}
        <Button
          type="submit"
          className="p-6 w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : "Login"}{" "}
        </Button>
        <span className="self-container">
          Don't have an account?{" "}
          <Link href="/signup" className="text-indigo-500">
            Sign up
          </Link>
        </span>
      </form>
    </Form>
  );
};

export default Login;
