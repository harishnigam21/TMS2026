import useApi from "@/hooks/useApi";
import {
  addAllNote,
  addNote,
  starTask,
  updateNote,
  updateTask,
} from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Note, Task } from "@/types/task";
import { completeDate, getDaysBetween } from "@/utils/getDate";
import React, { useEffect, useRef, useState } from "react";
import { AppDispatch } from "@/redux/Store";
import Notes from "@/components/Notes";
import { BadgeInfo, SendHorizonal, Star, Trash } from "lucide-react";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type taskCardProps = {
  task: Task;
  deleteTaskLoading: boolean;
  deleteTheTask: (id: number) => void;
};

function ExpandTask({ task, deleteTheTask, deleteTaskLoading }: taskCardProps) {
  const [taskInfo, setTaskInfo] = useState<string>("more");
  const [filterSelected, setFilterSelected] = useState<
    "all" | "done" | "undone"
  >("all");
  const [afterFilter, setAfterFilter] = useState<Note[]>();
  useEffect(() => {
    const filterTask = async () => {
      setAfterFilter(
        task.notes.filter((item) => {
          if (filterSelected == "all") {
            return true;
          }
          if (filterSelected == "done") {
            return item.completed;
          }
          if (filterSelected == "undone") {
            return !item.completed;
          }
        }),
      );
    };
    filterTask();
  }, [filterSelected, task.notes]);
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id && afterFilter && afterFilter?.length > 0) {
      const oldIndex = afterFilter.findIndex((i) => i.id === active.id);
      const newIndex = afterFilter.findIndex((i) => i.id === over.id);
      // setItems((prev) => arrayMove(prev, oldIndex, newIndex)); //update through redux
    }
  }
  const dispatch = useDispatch<AppDispatch>();
  const [notesValue, setNotesValue] = useState<string>("");
  const [inputType, setInputType] = useState<{
    type: string;
    prevValue: string;
    id: number | null;
  } | null>(null);
  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
    useApi();
  const { sendRequest: noteCreateRequest, loading: noteCreateLoading } =
    useApi();
  const { sendRequest: noteEditRequest, loading: noteEditLoading } = useApi();
  const { sendRequest: starRequest, loading: starLoading } = useApi();
  const { sendRequest: notesRequest, loading: notesLoading } = useApi();

  const noteScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollToDown = () => {
    const el = noteScrollRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      });
    });
  };

  const updateTheTask = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    updateTaskRequest(`tasks/${id}/toggle`, "PATCH").then((result) => {
      const data = result?.data as Data<Task> | undefined;
      if (result && result.success) {
        toast.success(
          data?.message ||
            `${data?.data?.completed ? "Task Completed" : "Task not completed"}`,
        );
        if (data?.data) {
          dispatch(updateTask(data?.data));
        }
      } else {
        const errMessage = data?.message || "Failed to update task";
        toast.error(errMessage);
      }
    });
  };

  const handleNotesCreate = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    if (!notesValue || notesValue.trim().length < 2) {
      toast.error("Invalid Note");
      return;
    }
    if (inputType && inputType.type && inputType.type == "noteEdit") {
      if (inputType.prevValue.trim() == notesValue.trim()) {
        toast.error("No Modification done");
        return;
      }
      if (inputType.id) {
        noteEditRequest(`tasks/${id}/note/${inputType.id}/edit`, "POST", {
          note: notesValue,
        }).then((result) => {
          const data = result?.data as Data<Note> | undefined;
          if (result && result.success) {
            toast.success(data?.message || "Updated Note");
            if (data?.data) {
              dispatch(updateNote(data.data));
            }
            setNotesValue("");
            setInputType(null);
          } else {
            const errMessage = data?.message || "Failed to update note";
            toast.error(errMessage);
          }
        });
      }
      return;
    }
    noteCreateRequest(`tasks/${id}/note`, "PATCH", { note: notesValue }).then(
      (result) => {
        const data = result?.data as Data<Note> | undefined;
        if (result && result.success) {
          toast.success(data?.message || "Added new Note");
          if (data?.data) {
            dispatch(addNote(data.data));
          }
          setFilterSelected("undone");
          scrollToDown();
          setNotesValue("");
          setInputType(null);
        } else {
          const errMessage = data?.message || "Failed to add note";
          toast.error(errMessage);
        }
      },
    );
  };

  const handleTaskStar = async (task: Task) => {
    if (task) {
      starRequest(`tasks/${task.id}/star`, "PATCH").then((result) => {
        const data = result?.data as Data<Task> | undefined;
        if (result && result.success) {
          toast.success(
            data?.message ||
              `${data?.data?.completed ? "Star Added" : "Star Removed"}`,
          );
          if (data?.data) {
            dispatch(starTask(data?.data));
          }
        } else {
          const errMessage = data?.message || "Failed to star task";
          toast.error(errMessage);
        }
      });
    }
  };
  useEffect(() => {
    const getAllNotes = async () => {
      if (task && task.id && task.noteCount > 5) {
        await notesRequest(`tasks/${task.id}/note`, "GET").then((result) => {
          const data = result?.data as Data<Note[]> | undefined;
          if (result && result.success) {
            if (data?.data) {
              dispatch(addAllNote(data.data));
            }
          }
        });
      }
    };
    getAllNotes();
  }, [dispatch, notesRequest]);
  return (
    <article className="relative max-h-full w-full sm:w-[75%] lg:w-[60%] xl:w-1/2 flex flex-col bg-black">
      <div className="flex relative flex-col h-full gap-2 border p-6 rounded-xl overflow-hidden transition-all duration-200">
        <div>
          <div
            className={` ${
              task.completed ? "line-through text-gray-400" : ""
            } m-auto  gap-2`}
          >
            <div className="min-w-fit flex items-center gap-2 float-right">
              <Star
                className={`cursor-pointer transition-all ${starLoading ? "animate-spin" : "animate-none"}`}
                color="white"
                size={30}
                strokeWidth={1.5}
                fill={task.star ? "yellow" : "black"}
                onClick={() => handleTaskStar(task)}
              >
                <title>Star Your Task</title>
              </Star>
              <BadgeInfo
                size={30}
                className="text-blue-500 cursor-pointer hover:scale-150 transition-all"
                onClick={() => {
                  setTaskInfo((prev) => (prev == "more" ? "info" : "more"));
                }}
              >
                <title>Task Info</title>
              </BadgeInfo>
              {updateTaskLoading && <div className="spinner"></div>}
              <button
                disabled={updateTaskLoading}
                onClick={() => updateTheTask(task.id)}
                className={`w-12 h-6 flex items-center cursor-pointer rounded-full p-1 transition
      ${task.completed ? "bg-green-500" : "bg-gray-500"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${task.completed ? "translate-x-6" : "translate-x-0"}`}
                ></div>
              </button>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-medium">
              {task.title}
            </h2>
          </div>
          <small className="text-xs opacity-40">
            {getDaysBetween(task.createdAt)}
          </small>
        </div>
        {/* //notes */}
        {taskInfo == "info" ? (
          <div>
            <strong className="text-2xl text-blue-500 opacity-100 py-3">
              Task Info :
            </strong>
            <div className="opacity-40 flex flex-col gap-2 text-2xl pl-2">
              <small>Created At : {completeDate(task.createdAt)}</small>
              <small>Last Updated At : {completeDate(task.updatedAt)}</small>
              <small>
                Status :{" "}
                {task.completed ? (
                  <span className="text-green-500">completed</span>
                ) : (
                  <span className="text-red-500">InComplete</span>
                )}
              </small>
            </div>
          </div>
        ) : taskInfo == "more" ? (
          <div className="flex flex-col gap-2 grow justify-end-safe overflow-y-auto overflow-x-hidden">
            <div className="text-green-500 flex flex-wrap gap-2 items-center">
              <b className="text-2xl whitespace-nowrap">Notes :</b>
              {afterFilter && afterFilter.length > 0 ? (
                <div className="flex items-center py-3 gap-2 flex-nowrap w-full overflow-x-auto noscrollbar basis-full">
                  <button
                    className={`rounded-full py-0.5 px-3 ${filterSelected == "all" ? "bg-blue-500 text-white" : "bg-white text-black"}  hover:scale-90 font-semibold transition-all cursor-pointer`}
                    onClick={() => setFilterSelected("all")}
                  >
                    All
                  </button>
                  <button
                    className={`rounded-full py-0.5 px-3 ${filterSelected == "done" ? "bg-blue-500 text-white" : "bg-white text-black"}  hover:scale-90 font-semibold transition-all cursor-pointer`}
                    onClick={() => setFilterSelected("done")}
                  >
                    Done
                  </button>
                  <button
                    className={`rounded-full py-0.5 px-3 ${filterSelected == "undone" ? "bg-blue-500 text-white" : "bg-white text-black"}  hover:scale-90 font-semibold transition-all cursor-pointer`}
                    onClick={() => setFilterSelected("undone")}
                  >
                    UnDone
                  </button>
                </div>
              ) : (
                <small className="text-red-500">No notes !</small>
              )}
            </div>
            {afterFilter && afterFilter.length > 0 && !notesLoading ? (
              <div
                ref={noteScrollRef}
                className="flex flex-col overflow-x-hidden overflow-y-auto manual-scroll p-2 rounded-xl"
              >
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={afterFilter.map((i) => String(i.id))} // FIXED
                    strategy={verticalListSortingStrategy}
                  >
                    {afterFilter.map((note, index) => (
                      <Notes
                        key={`task/notes/${index}`}
                        note={note}
                        index={index}
                        setNotesValue={setNotesValue}
                        setInputType={setInputType}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`full/task/note/skeleton/${i}`}
                    className="w-full rounded-xl border border-gray-500/30 h-10 animate-pulse bg-gray-600/80"
                  ></div>
                ))}
              </div>
            )}
            {!task.completed && (
              <div className="flex gap-2 w-full items-center mt-4">
                <textarea
                  name="newNote"
                  id={`newNote/${task.id}`}
                  value={notesValue}
                  placeholder="Add Notes..."
                  className="w-full py-1 text-sm px-4 border border-blue-600/30 focus:border-green-600/30 focus:outline-none rounded-md"
                  onChange={(e) => setNotesValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !noteCreateLoading &&
                      !noteEditLoading
                    ) {
                      handleNotesCreate(task.id);
                    }
                  }}
                />
                {noteCreateLoading || noteEditLoading ? (
                  <span className="spinner"></span>
                ) : (
                  <SendHorizonal
                    size={30}
                    className="cursor-pointer text-blue-700 text-xl"
                    onClick={() => handleNotesCreate(task.id)}
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <></>
        )}
        <div className="flex gap-4 pt-4">
          <button
            disabled={deleteTaskLoading}
            className="text-red-500 flex items-center gap-2 cursor-pointer"
            onClick={() => deleteTheTask(task.id)}
          >
            <Trash
              className={`text-xl text-red-500 ${deleteTaskLoading ? "animate-ping duration-100" : ""}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}
export default React.memo(ExpandTask);
