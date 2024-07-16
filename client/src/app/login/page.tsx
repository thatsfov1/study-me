"use client";
import React, { useRef } from "react";
import { Input } from "../components/Input";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  const form = useRef(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const handleLogin = async (data: any) => {
    if (form.current) {
      try {
        const { email, password } = data;
        // const  userData = await login({ email, password}).unwrap()
        router.push("/dashboard");
      } catch (err) {
        reset();
      }
    }
  };
  return (
    <div className="w-screen h-screen flex items-center justify-center ">
      <div className="p-8 shadow-md rounded-lg text-center">
        <p className="text-2xl mb-4 font-bold">Login</p>
        <form
          ref={form}
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="johndoe@gmail.com"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: "Email is incorrect",
              },
              minLength: {
                value: 7,
                message: "Email is too short",
              },
            })}
          />
          {errors?.email && (
            <div className="error">{errors.email?.message as string}</div>
          )}
          <Input
            placeholder="*********"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password is too short",
              },
            })}
          />
          {errors?.password && (
            <div className="error">{errors?.password.message as string}</div>
          )}
          <button className="text-xl py-2 px-4 bg-indigo-500 text-white rounded-lg">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
