"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useApi from "@/hooks/useApi";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Data } from "@/types/data";
import { setLoginStatus, setUser } from "@/redux/slices/UserSlice";
import { User } from "@/types/user";
import { AppDispatch } from "@/redux/Store";
import { House } from "lucide-react";

export default function Login() {
  const { sendRequest, loading } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const validate = () => {
    //  Email: Standard RFC format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      toast.error(
        "Please enter a valid email address (e.g., name@domain.com).",
      );
      return false;
    }
    if (password.trim().length < 8) {
      toast.error("Invalid Password");
      return false;
    }
    return true;
  };
  const handleLogin = async () => {
    if (!validate()) {
      return;
    }
    //sending request to the backend to verify user
    await sendRequest(
      "auth/login",
      "POST",
      { email, password },
      {},
      false,
    ).then((result) => {
      const data = result?.data as Data<User> | undefined;
      if (result && result.success) {
        setEmail("");
        setPassword("");
        toast.success(data?.message || "Successfully Authorized");
        if (data?.acTk) {
          localStorage.setItem("acTk", data.acTk);
        }

        if (data?.data) {
          dispatch(setUser(data.data));
          dispatch(setLoginStatus('authenticated'));
          localStorage.setItem("userInfo", JSON.stringify(data.data));
        }
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        if (data?.errors) {
          setErrors(data.errors);
        }
        const errorMessage =
          result?.error || data?.message || "An error occurred";
        toast.error(errorMessage);
        if (result.status === 404) {
          setTimeout(() => {
            router.push("/register");
          }, 2000);
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-gray-900 to-black text-white flex justify-center-safe items-center-safe p-4">
      <House
        className="text-4xl text-amber-900 cursor-pointer absolute top-2 left-2"
        onClick={() => router.push("/")}
      />
      <div className="w-95 p-4 rounded-2xl backdrop-blur-sm border border-white/20 shadow-xl">
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Welcome Back
        </h1>

        <div className="flex flex-col gap-4">
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
            onClick={handleLogin}
            className="flex items-center justify-center gap-2 mt-2 py-3 rounded-lg bg-white text-black font-semibold hover:scale-[1.02] transition cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Login"
            )}
          </button>
        </div>
        <div className="mt-6">
          Create account ?{" "}
          <span
            className="text-blue-700 cursor-pointer font-bold"
            onClick={() => router.push("/register")}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}
