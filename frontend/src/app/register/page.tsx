"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import toast from "react-hot-toast";
import { Data } from "@/types/data";
import { IoHome } from "react-icons/io5";

export default function Register() {
  const { sendRequest, loading } = useApi();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const validate = () => {
    if (name.length < 3) {
      toast.error("Name must be at least 3 characters !");
      return false;
    }
    //  Email: Standard RFC format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error(
        "Please enter a valid email address (e.g., name@domain.com).",
      );
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password needs an uppercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password needs a number.");
      return false;
    }
    if (!/[@$!%*?&]/.test(password)) {
      toast.error("Password needs a special character.");
      return false;
    }
    return true;
  };
  const handleRegistration = async () => {
    if (!validate()) {
      return;
    }
    //sending request to the backend to verify user
    await sendRequest(
      "auth/register",
      "POST",
      { name, email, password },
      {},
      false,
    ).then((result) => {
      const data = result?.data as Data<string> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "You have been registered Successfully");
        setEmail("");
        setPassword("");
        setName("");
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        if (data?.errors) {
          setErrors(data.errors);
        }
        const errorMessage =
          result?.error || data?.message || "An error occurred";
        toast.error(errorMessage);
        if (result.status === 409) {
          setTimeout(() => {
            router.push("/register");
          }, 2000);
        }
      }
    });
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black text-white flex justify-center-safe items-center-safe">
      <IoHome
        className="text-4xl text-amber-900 cursor-pointer absolute top-2 left-2"
        onClick={() => router.push("/")}
      />
      <div className="w-95 p-8 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Welcome !
        </h1>
        <div className="flex flex-col gap-4">
          <input
            placeholder="Name"
            onChange={(e) => {
              setName(e.target.value);
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className="px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
          />
          {errors["name"] && (
            <small className="text-red-500">{errors["name"]} !</small>
          )}
          <input
            placeholder="Email"
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({ ...prev, email: "" }));
            }}
            className="px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
          />
          {errors["email"] && (
            <small className="text-red-500">{errors["email"]} !</small>
          )}
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({ ...prev, password: "" }));
            }}
            className="px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
          />
          {errors["password"] && (
            <small className="text-red-500">{errors["password"]} !</small>
          )}
          <button
            onClick={handleRegistration}
            className="flex items-center justify-center gap-2 mt-2 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:scale-[1.02] transition cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Register"
            )}
          </button>
        </div>
        <div className="mt-6">
          Already have account ?{" "}
          <span
            className="text-blue-700 cursor-pointer font-bold"
            onClick={() => router.push("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
