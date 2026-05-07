"use client";

import useApi from "@/hooks/useApi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/Store";
import Loading from "@/components/loaders/Loading";
import { Data } from "@/types/data";
import DashboardSkeleton from "./home/skeleton";
import { User } from "@/types/user";
import { setLoginStatus, setUser } from "@/redux/slices/UserSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { House, LogOut } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { sendRequest: userRequest } = useApi();
  const { sendRequest: logoutRequest, loading: logoutLoading } = useApi();
  useEffect(() => {
    if (user.loginStatus == "loading") {
      userRequest("user", "GET").then((result) => {
        const data = result?.data as Data<User> | undefined;
        if (result && result.success) {
          if (data?.data) {
            dispatch(setUser(data.data));
            dispatch(setLoginStatus("authenticated"));
          }
        } else {
          dispatch(setLoginStatus("unauthenticated"));
          router.push("/login");
        }
      });
    }
  }, [dispatch, router, user.loginStatus, userRequest]);

  const handleLogout = async () => {
    const result = await logoutRequest("auth/logout", "PATCH");
    if (result && result.success) {
      window.localStorage.clear();
      router.push("/");
    }
  };

  return user.loginStatus == "loading" ? (
    <DashboardSkeleton />
  ) : user.loginStatus == "authenticated" ? (
    <section className="max-w-screen min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white box-border">
      <div className="flex justify-between items-center w-full sticky top-0 right-0 p-4 z-10 backdrop-blur-3xl">
        <div className="flex items-center gap-4 tracking-widest text-gray-300">
          {/* put logo her */}
          <House
            className="text-4xl text-amber-900 cursor-pointer "
            onClick={() => router.push("/")}
          />
          <Link
            href={"home"}
            className="font-semibold rounded-full hover:underline hover:underline-offset-8 hover:decoration-amber-900 decoration-2 text-sm cursor-pointer transition-all"
          >
            Home
          </Link>
          <Link
            href={"visuals"}
            className="font-semibold rounded-full hover:underline hover:underline-offset-8 hover:decoration-amber-900 decoration-2 text-sm cursor-pointer transition-all"
          >
            Visuals
          </Link>
          <Link
            href={"setting"}
            className="font-semibold rounded-full hover:underline hover:underline-offset-8 hover:decoration-amber-900 decoration-2 text-sm cursor-pointer transition-all"
          >
            Setting
          </Link>
        </div>
        <div className=" cursor-pointer flex gap-2 items-center">
          <span className="hidden sm:block tracking-widest text-sm">
            Welcome {user?.userInfo?.name.split(" ")[0]}
          </span>
          {logoutLoading ? (
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          ) : (
            <LogOut
              className="text-4xl text-blue-600 hover:text-blue-400 transition-colors"
              onClick={handleLogout}
            >
              <title>Logout</title>
            </LogOut>
          )}
        </div>
      </div>
      {/* outlet */}
      <div className="">{children}</div>
    </section>
  ) : (
    <div className="w-screen h-screen flex justify-center items-center">
      <Loading />
    </div>
  );
}
