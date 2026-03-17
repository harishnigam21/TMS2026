"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { setLoginStatus, setUser } from "@/redux/slices/UserSlice";
import { AppDispatch } from "@/redux/Store";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  status: number;
  error?: string;
};

const useApi = <T = unknown>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleGlobalStatus = useCallback(
    (statusCode: number) => {
      if (statusCode === 403) {
        localStorage.removeItem("acTk");
        dispatch(setLoginStatus(false));
        router.replace("/login");
      }
    },
    [router, dispatch],
  );

  const sendRequest = useCallback(
    async (
      url: string,
      method: string = "GET",
      body: unknown = null,
      customHeaders: Record<string, string> = {},
      redirect: boolean = true,
      retry: boolean = true, // prevent infinite loop
    ): Promise<ApiResponse<T>> => {
      setLoading(true);
      setError(null);
      setStatus(null);

      const updateUrl = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/${url}`;

      const makeRequest = async () => {
        const headers: Record<string, string> = {
          Authorization: localStorage.getItem("acTk")
            ? `Bearer ${localStorage.getItem("acTk")}`
            : "",
          ...customHeaders,
        };

        if (!(body instanceof FormData)) {
          headers["Content-Type"] = "application/json";
        }

        return fetch(updateUrl, {
          method,
          headers,
          credentials: "include",
          body:
            body instanceof FormData
              ? body
              : body
                ? JSON.stringify(body)
                : null,
        });
      };

      try {
        const response = await makeRequest();
        setStatus(response.status);

        if (response.status === 401 && retry) {
          try {
            const refreshRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/refresh`,
              {
                method: "PATCH",
                credentials: "include",
              },
            );

            if (!refreshRes.ok) throw new Error("Refresh failed");

            const refreshData = await refreshRes.json();
            localStorage.setItem("acTk", refreshData.acTk);
            dispatch(setUser(refreshData.data));
            dispatch(setLoginStatus(true));
            return await sendRequest(
              url,
              method,
              body,
              customHeaders,
              redirect,
              false,
            );
          } catch (err) {
            localStorage.removeItem("acTk");
            dispatch(setLoginStatus(false));
            router.replace("/login");

            return {
              success: false,
              data: null,
              status: 403,
              error: "Session expired",
            };
          }
        }

        if (redirect) handleGlobalStatus(response.status);

        const result = await response.json();

        if (!response.ok) {
          return {
            success: false,
            data: result,
            status: response.status,
            error: result.message || "Request failed",
          };
        }

        setData(result);

        return {
          success: true,
          data: result,
          status: response.status,
        };
      } catch (err: unknown) {
        const internalErrorStatus = 500;
        setStatus(internalErrorStatus);

        let errorMessage = "Unexpected error";

        if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        toast.error("An unexpected error occurred!");

        if (redirect) {
          handleGlobalStatus(internalErrorStatus);
        }

        return {
          success: false,
          data: null,
          error: errorMessage,
          status: internalErrorStatus,
        };
      } finally {
        setLoading(false);
      }
    },
    [handleGlobalStatus, dispatch, router],
  );

  return { data, loading, error, status, sendRequest };
};

export default useApi;
