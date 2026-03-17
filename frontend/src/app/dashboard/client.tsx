/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
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
import { IoMdAdd } from "react-icons/io";
import { IoMdLogOut } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";

export default function Dashboard() {
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const pagination = useSelector((state: RootState) => state.task.pagination);

  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { sendRequest: getTaskRequest, loading: getTaskLoading } = useApi();
  const { sendRequest: createTaskRequest, loading: createTaskLoading } =
    useApi();
  const { sendRequest: deleteTaskRequest, loading: deleteTaskLoading } =
    useApi();
  const { sendRequest: logoutRequest, loading: logoutLoading } = useApi();
  const filterParams = searchParams.get("filter");

  const handleFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };
  const search = searchParams.get("search") || "";
  const [firstRender, setFirstRender] = useState(false);
  const [toggle, setToggle] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);
  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1"); //  reset page

    router.push(`?${params.toString()}`);
  };
  //Debouncing logic to make some delay on every strike so that in ms request can be avoided
  useEffect(() => {
    const delay = setTimeout(() => {
      if (firstRender) {
        handleSearch(searchInput);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);
  useEffect(() => {
    async function loadTasks() {
      const params = searchParams.toString();
      await getTaskRequest(`tasks?${params}`, "GET").then((result) => {
        const data = result?.data as Data<Task[]> | undefined;

        if (result && result.success) {
          dispatch(setTask(data?.data || []));

          if (data?.pagination) {
            dispatch(setPagination(data.pagination));
          }
        } else {
          toast.error(data?.message || "Failed to fetch tasks");
        }
      });
    }
    loadTasks();
    setFirstRender(true);
  }, [searchParams, dispatch, getTaskRequest]);

  const createTask = async () => {
    setSearchInput("");
    if (!title || title.trim().length < 2) {
      toast.error("Invalid Task Title");
      return;
    }
    createTaskRequest("tasks", "POST", { title }).then((result) => {
      const data = result?.data as Data<Task> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Created new Task");
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        router.push(`?${params.toString()}`);
        setTitle("");
      } else {
        toast.error(data?.message || "Failed to create task");
      }
    });
  };
  const deleteTheTask = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    deleteTaskRequest(`tasks/${id}`, "DELETE").then((result) => {
      const data = result?.data as Data<number> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Task Deleted");
        const currentPage = Number(searchParams.get("page") || 1);
        if (tasks.length === 1 && currentPage > 1) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("page", (currentPage - 1).toString());
          router.push(`?${params.toString()}`);
        } else {
          router.refresh();
        }
        //Don't need after pagination, so let be here
        if (data?.data) {
          dispatch(deleteTask(data?.data));
        }
      } else {
        const errMessage = data?.message || "Failed to delete task";
        toast.error(errMessage);
      }
    });
  };
  // pagination logic
  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", page.toString());

    router.push(`?${params.toString()}`);
  };

  const goNext = () => {
    if (!pagination?.thisPage) return;
    changePage(pagination.thisPage + 1);
  };

  const goPrev = () => {
    if (!pagination?.thisPage) return;
    changePage(pagination.thisPage - 1);
  };

  const totalPages = pagination?.totalPages;
  //avoiding every render page calculation
  const pageNumbers = useMemo(() => {
    if (!totalPages) return [];
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  const handleLogout = async () => {
    logoutRequest("auth/logout", "PATCH").then((result) => {
      if (result && result.success) {
        window.localStorage.clear();
        router.push("login");
      }
    });
  };
  return (
    <section className="max-w-screen min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 text-white box-border">
      <article className="max-w-4xl p-8 m-auto">
        <div className="flex justify-center-safe">
          <IoHome
            className="text-5xl text-amber-900 cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">Task Dashboard</h1>
        <div className="absolute top-2 right-2 cursor-pointer">
          {logoutLoading ? (
            <div className="spinner"></div>
          ) : (
            <IoMdLogOut
              title="logout"
              className=" text-4xl text-blue-600 "
              onClick={handleLogout}
            />
          )}
        </div>

        {/* Add and Search Task */}
        <div className="flex flex-wrap min-[480]:flex-nowrap justify-between gap-4">
          <div className="flex gap-2 mb-6 w-full">
            <button
              disabled={createTaskLoading}
              className=" text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center gap-2"
              onClick={() => {
                if (search.length == 0) {
                  setToggle("search");
                } else {
                  handleSearch(searchInput);
                }
              }}
            >
              <CiSearch className="text-3xl" />
            </button>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Here..."
              className="border p-2 rounded w-full"
            />
          </div>
          <div className="flex gap-2 mb-6 w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !createTaskLoading) createTask();
              }}
              placeholder="Add new task..."
              className="border p-2 rounded w-full"
            />

            <button
              disabled={createTaskLoading}
              className="bg-green-600 text-white cursor-pointer min-w-10 h-10 rounded-full flex items-center justify-center gap-2"
              onClick={() => {
                if (title.length == 0) {
                  setToggle("create");
                } else {
                  createTask();
                }
              }}
            >
              {createTaskLoading ? (
                <span className="spinner"></span>
              ) : (
                <IoMdAdd className="text-3xl" />
              )}
            </button>
          </div>
        </div>
        {/* filter buttons */}

        <div className="flex flex-wrap gap-4 items-center mb-8 mt-4">
          <button
            className={`py-1 px-3 text-sm rounded-full hover:scale-105 transition-all ${filter == "complete" ? "bg-green-500 text-black font-bold" : "bg-white text-black font-bold"} cursor-pointer`}
            onClick={() => {
              setFilter("complete");
              handleFilterChange("true");
            }}
          >
            Complete
          </button>
          <button
            className={`py-1 px-3 text-sm rounded-full hover:scale-105 transition-all ${filter == "incomplete" ? "bg-green-500 text-black font-bold" : "bg-white text-black font-bold"} cursor-pointer`}
            onClick={() => {
              setFilter("incomplete");
              handleFilterChange("false");
            }}
          >
            InComplete
          </button>
          <p
            className="text-red-500 cursor-pointer"
            onClick={() => {
              setFilter(null);
              handleFilterChange(null);
            }}
          >
            clear
          </p>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-4">
          {getTaskLoading ? (
            <Loading />
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
            <strong className="text-red-700 col-span-full text-center">
              No Task Found!
            </strong>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center-safe overflow-x-auto noscrollbar items-center mt-8">
          {pagination && !getTaskLoading && pagination.totalPages > 1 && (
            <div className="flex flex-nowrap items-center gap-2 ">
              {pagination.thisPage > 1 && (
                <FaCaretLeft
                  onClick={goPrev}
                  className="cursor-pointer text-xl"
                />
              )}

              {pageNumbers.map((i) => (
                <button
                  key={i}
                  onClick={() => changePage(i)}
                  className={`px-3 py-1 cursor-pointer rounded border ${
                    pagination.thisPage === i
                      ? "bg-blue-600 text-white"
                      : "bg-white text-black"
                  }`}
                >
                  {i}
                </button>
              ))}

              {pagination.thisPage < pagination.totalPages && (
                <FaCaretRight
                  onClick={goNext}
                  className="cursor-pointer text-xl"
                />
              )}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
