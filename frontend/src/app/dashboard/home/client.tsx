"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteTask, setPagination, setTask } from "@/redux/slices/TaskSlice";
import { Task } from "@/types/task";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/Store";
import TaskCard from "./TaskCard";
import useApi from "@/hooks/useApi";
import { Data } from "@/types/data";
export default function DashBoardHome() {
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const pagination = useSelector((state: RootState) => state.task.pagination);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { sendRequest: getTaskRequest, loading: getTaskLoading } = useApi();
  const { sendRequest: createTaskRequest, loading: createTaskLoading } =
    useApi();
  const { sendRequest: deleteTaskRequest, loading: deleteTaskLoading } =
    useApi();

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

  const handleFilterChange = (
    value: "completed" | "incompleted" | "starred" | null,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("filter");
      setFilter(null);
    } else {
      params.set("filter", value);
      setFilter(value);
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

  // --- Using Memos to avoid recalculation---
  const pageNumbers = useMemo(() => {
    const total = pagination?.totalPages || 0;
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [pagination?.totalPages]);
  return (
    <section className="m-auto p-4">
      <div className="m-auto max-w-4xl">
        <h2 className="text-3xl text-amber-900 sm:tet-4xl md:text-5xl xl:text-6xl font-extrabold tracking-wider font-serif text-center my-8 text-outline-white">
          Task Dashboard
        </h2>
        {/* Add and Search Task */}
        <div className="flex flex-col min-[480]:flex-row justify-between gap-4 mb-2">
          <div className="flex flex-row-reverse min-[480]:flex-row mb-2 w-full border border-amber-900/30 overflow-hidden bg-gray-800 rounded-xl">
            <button
              disabled={getTaskLoading}
              className="bg-amber-900 hover:bg-amber-900/50 transition-all text-white cursor-pointer min-w-10 h-10 flex items-center justify-center disabled:opacity-50"
              onClick={createTask}
            >
              {getTaskLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Search strokeWidth={3} className="text-3xl" />
              )}
            </button>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Here..."
              className=" p-2 w-full focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex mb-2 w-full border border-amber-900/30 bg-gray-800 rounded-xl overflow-hidden">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !createTaskLoading && createTask()
              }
              placeholder="Add new task..."
              className="p-2 w-full focus:outline-none border-r border-amber-900/30"
            />
            <button
              disabled={createTaskLoading}
              className="bg-amber-900 hover:bg-amber-900/50 text-white cursor-pointer min-w-10 h-10 flex items-center justify-center disabled:opacity-50"
              onClick={createTask}
            >
              {createTaskLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Plus strokeWidth={3} className="text-3xl" />
              )}
            </button>
          </div>
        </div>
        {/* Filter buttons */}
        <div className="flex flex-nowrap gap-4 items-center mb-8 w-full px-2 overflow-auto noscrollbar">
          <button
            className={`py-0.5 px-2 text-sm rounded-full transition-all ${filter === "completed" ? "bg-green-500 text-black" : "bg-white text-amber-900"} font-bold tracking-tight cursor-pointer`}
            onClick={() => handleFilterChange("completed")}
          >
            Complete
          </button>
          <button
            className={`py-0.5 px-2 text-sm rounded-full transition-all ${filter === "incompleted" ? "bg-green-500 text-black" : "bg-white text-amber-900"} font-bold tracking-tight cursor-pointer`}
            onClick={() => handleFilterChange("incompleted")}
          >
            Incomplete
          </button>
          <button
            className={`py-0.5 px-2 text-sm rounded-full transition-all ${filter === "starred" ? "bg-green-500 text-black" : "bg-white text-amber-900"} font-bold tracking-tight cursor-pointer`}
            onClick={() => handleFilterChange("starred")}
          >
            Starred
          </button>
          <button
            className="text-red-500 hover:text-red-400 cursor-pointer text-xs whitespace-nowrap"
            onClick={() => handleFilterChange(null)}
          >
            Clear Filters
          </button>
        </div>
      </div>
      <article className="max-w-4xl m-auto px-2">
        {/* Task List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {getTaskLoading ? (
            Array.from({ length: 9 }).map((_, i) => (
              <div
                key={`task/skelton/${i}`}
                className="w-full h-20 bg-gray-700 rounded-xl animate-pulse"
              ></div>
            ))
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
              <ChevronLeft
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
              <ChevronRight
                onClick={() => changePage(pagination.thisPage + 1)}
                className="cursor-pointer text-2xl hover:text-blue-500"
              />
            )}
          </div>
        )}
      </article>
    </section>
  );
}
