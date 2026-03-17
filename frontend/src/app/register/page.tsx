"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import toast from "react-hot-toast";
import { Data } from "@/types/data";

export default function Register() {
  const { sendRequest, loading } = useApi();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const handleRegistration = async () => {
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-95 p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-xl">
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
            className="px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
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
            className="px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
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
            className="px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-white/40"
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
