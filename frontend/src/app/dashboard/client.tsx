"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/Store";
import { deleteTask, setPagination, setTask } from "@/redux/slices/TaskSlice";
import Loading from "@/components/loaders/Loading";
import { Data } from "@/types/data";
import { Task } from "@/types/task";
import toast from "react-hot-toast";
import TaskCard from "./Task";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { useSearchParams, useRouter } from "next/navigation";
import { IoMdAdd, IoMdLogOut } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import DashboardSkeleton from "./skeleton";
import { User } from "@/types/user";
import { setLoginStatus, setUser } from "@/redux/slices/UserSlice";

export default function Dashboard() {
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const pagination = useSelector((state: RootState) => state.task.pagination);
  const user = useSelector((state: RootState) => state.user);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  const { sendRequest: getTaskRequest, loading: getTaskLoading } = useApi();
  const { sendRequest: createTaskRequest, loading: createTaskLoading } =
    useApi();
  const { sendRequest: deleteTaskRequest, loading: deleteTaskLoading } =
    useApi();
  const { sendRequest: userRequest } = useApi();
  const { sendRequest: logoutRequest, loading: logoutLoading } = useApi();

  const loadTasks = useCallback(async () => {
    const query = searchParams.toString();
    getTaskRequest(`tasks?${query}`, "GET").then((result) => {
      const data = result?.data as Data<Task[]> | undefined;
      if (result && result.success) {
        dispatch(setTask(data?.data || []));
        if (data?.pagination) {
          dispatch(setPagination(data.pagination));
        }
      } else {
        toast.error(data?.message || "Looks Like Your Session Expired");
      }
    });
  }, [searchParams, getTaskRequest, dispatch]);

  const applyChanges = useCallback(
    (params: URLSearchParams) => {
      const newQuery = params.toString();
      const currentQuery = searchParams.toString();

      if (newQuery === currentQuery) {
        loadTasks();
      } else {
        router.push(`?${newQuery}`);
      }
    },
    [router, searchParams, loadTasks],
  );

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Debounced Search Logic
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    if (searchInput === currentSearch) return;

    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("search", searchInput);
      else params.delete("search");

      params.set("page", "1"); // Reset to page 1 on search
      applyChanges(params);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput, applyChanges, searchParams]);

  useEffect(() => {
    if (user.loginStatus == "loading" && !getTaskLoading) {
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
  }, [dispatch, router, user.loginStatus, userRequest, getTaskLoading]);

  const handleFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("filter");
      setFilter(null);
    } else {
      params.set("filter", value);
      setFilter(value === "true" ? "complete" : "incomplete");
    }
    params.set("page", "1");
    applyChanges(params);
  };

  const createTask = async () => {
    if (!title || title.trim().length < 2) {
      toast.error("Invalid Task Title");
      return;
    }

    const result = await createTaskRequest("tasks", "POST", { title });
    const data = result?.data as Data<Task> | undefined;

    if (result && result.success) {
      toast.success(data?.message || "Created new Task");
      setTitle("");
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      applyChanges(params);
    } else {
      toast.error(data?.message || "Failed to create task");
    }
  };

  const deleteTheTask = async (id: number) => {
    const result = await deleteTaskRequest(`tasks/${id}`, "DELETE");
    const data = result?.data as Data<number> | undefined;

    if (result && result.success) {
      toast.success(data?.message || "Task Deleted");

      const currentPage = Number(searchParams.get("page") || 1);
      if (tasks.length === 1 && currentPage > 1) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", (currentPage - 1).toString());
        router.push(`?${params.toString()}`);
      } else {
        loadTasks(); // Just refresh the current view
      }

      if (data?.data) dispatch(deleteTask(data.data));
    } else {
      toast.error(data?.message || "Failed to delete task");
    }
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    applyChanges(params);
  };

  const handleLogout = async () => {
    const result = await logoutRequest("auth/logout", "PATCH");
    if (result && result.success) {
      window.localStorage.clear();
      router.push("/");
    }
  };

  // --- Using Memos to avoid recalculation---
  const pageNumbers = useMemo(() => {
    const total = pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [pagination?.totalPages]);

  return user.loginStatus == "loading" ? (
    <DashboardSkeleton />
  ) : user.loginStatus == "authenticated" ? (
    <section className="max-w-screen min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white box-border">
      <article className="max-w-4xl p-4 m-auto">
        <div className="flex justify-between items-center mb-6 w-full fixed top-0 right-0 p-4 z-10 backdrop-blur-3xl">
          <IoHome
            className="text-4xl text-amber-900 cursor-pointer "
            onClick={() => router.push("/")}
          />
          <div className=" cursor-pointer flex gap-2 items-center">
            Welcome {user?.userInfo?.name.split(" ")[0]}
            {logoutLoading ? (
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            ) : (
              <IoMdLogOut
                title="logout"
                className="text-4xl text-blue-600 hover:text-blue-400 transition-colors"
                onClick={handleLogout}
              />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 mt-20 text-center">
          Task Dashboard
        </h1>

        {/* Add and Search Task */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 mb-2 w-full">
            <div className="flex items-center justify-center w-10">
              <CiSearch className="text-3xl text-gray-400" />
            </div>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Here..."
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 mb-2 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !createTaskLoading && createTask()
              }
              placeholder="Add new task..."
              className="border border-gray-700 bg-gray-800 p-2 rounded w-full focus:outline-none focus:border-green-500"
            />
            <button
              disabled={createTaskLoading}
              className="bg-green-600 hover:bg-green-500 text-white cursor-pointer min-w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
              onClick={createTask}
            >
              {createTaskLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <IoMdAdd className="text-3xl" />
              )}
            </button>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-4 items-center mb-8 mt-4">
          <button
            className={`py-1 px-4 text-sm rounded-full transition-all ${filter === "complete" ? "bg-green-500 text-black font-bold" : "bg-white text-black font-bold"} cursor-pointer`}
            onClick={() => handleFilterChange("true")}
          >
            Complete
          </button>
          <button
            className={`py-1 px-4 text-sm rounded-full transition-all ${filter === "incomplete" ? "bg-green-500 text-black font-bold" : "bg-white text-black font-bold"} cursor-pointer`}
            onClick={() => handleFilterChange("false")}
          >
            Incomplete
          </button>
          <button
            className="text-red-500 hover:text-red-400 cursor-pointer text-sm"
            onClick={() => handleFilterChange(null)}
          >
            Clear Filters
          </button>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {getTaskLoading ? (
            <div className="col-span-full flex justify-center py-10">
              <Loading />
            </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                deleteTaskLoading={deleteTaskLoading}
                deleteTheTask={deleteTheTask}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-gray-800/50 rounded-lg">
              <strong className="text-red-400">No Tasks Found!</strong>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && !getTaskLoading && (
          <div className="flex justify-center items-center gap-4 mt-10">
            {pagination.thisPage > 1 && (
              <FaCaretLeft
                onClick={() => changePage(pagination.thisPage - 1)}
                className="cursor-pointer text-2xl hover:text-blue-500"
              />
            )}
            <div className="flex gap-2 overflow-x-auto px-2">
              {pageNumbers.map((i) => (
                <button
                  key={i}
                  onClick={() => changePage(i)}
                  className={`px-3 py-1 min-w-8.75 cursor-pointer rounded border transition-colors ${
                    pagination.thisPage === i
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            {pagination.thisPage < pagination.totalPages && (
              <FaCaretRight
                onClick={() => changePage(pagination.thisPage + 1)}
                className="cursor-pointer text-2xl hover:text-blue-500"
              />
            )}
          </div>
        )}
      </article>
    </section>
  ) : (
    <div className="w-screen h-screen flex justify-center items-center">
      <Loading />
    </div>
  );
}
