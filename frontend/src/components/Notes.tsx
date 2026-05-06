import useApi from "@/hooks/useApi";
import { deleteNote, markNote } from "@/redux/slices/TaskSlice";
import { AppDispatch } from "@/redux/Store";
import { Data } from "@/types/data";
import { Note } from "@/types/task";
import { Check, GripVertical, Pencil, Trash, X } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useGesture } from "@use-gesture/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
export default function Notes({
  index,
  note,
  setNotesValue,
  setInputType,
}: {
  index: number;
  note: Note;
  setNotesValue: React.Dispatch<React.SetStateAction<string>>;
  setInputType: React.Dispatch<
    React.SetStateAction<{
      type: string;
      prevValue: string;
      id: number | null;
    } | null>
  >;
}) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [noteExpand, setNoteExpand] = useState<boolean>(false);
  const handleEdit = () => {
    setNotesValue(note.note);
    setInputType({ type: "noteEdit", prevValue: note.note, id: note.id });
  };
  const dispatch = useDispatch<AppDispatch>();
  const { sendRequest: noteDeletetRequest, loading: noteDeletetLoading } =
    useApi();
  const { sendRequest: markDoneRequest, loading: markDoneLoading } = useApi();
  const { sendRequest: markUnDoneRequest, loading: markUnDoneLoading } =
    useApi();
  const handleMarkDone = (note: Note) => {
    if (note.completed) {
      toast.error("This note is already marked done");
      return;
    }
    markDoneRequest(
      `tasks/${note.taskId}/note/${note.id}/mark-done`,
      "PATCH",
    ).then((result) => {
      const data = result?.data as Data<Note> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Marked Done");
        if (data?.data) {
          dispatch(markNote(data.data));
        }
      } else {
        const errMessage = data?.message || "Failed to mark";
        toast.error(errMessage);
      }
    });
  };
  const handleMarkNotDone = (note: Note) => {
    if (!note.completed) {
      toast.error("This note is already marked undone");
      return;
    }
    markUnDoneRequest(
      `tasks/${note.taskId}/note/${note.id}/mark-undone`,
      "PATCH",
    ).then((result) => {
      const data = result?.data as Data<Note> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Marked UnDone");
        if (data?.data) {
          dispatch(markNote(data.data));
        }
      } else {
        const errMessage = data?.message || "Failed to mark";
        toast.error(errMessage);
      }
    });
  };

  const handleDelete = (note: Note) => {
    noteDeletetRequest(
      `tasks/${note.taskId}/note/${note.id}/delete`,
      "DELETE",
    ).then((result) => {
      const data = result?.data as Data<Note> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Deleted Note");
        if (data?.data) {
          dispatch(deleteNote(data.data));
        }
      } else {
        const errMessage = data?.message || "Failed to delete note";
        toast.error(errMessage);
      }
    });
  };
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toggleOptions = useGesture({
    onPointerDown: () => {
      timerRef.current = setTimeout(() => {
        setShowOptions((prev) => !prev);
      }, 500);
    },

    onPointerUp: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },

    onPointerMove: () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
  });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: String(note.id) });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "10px",
    marginBottom: "8px",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex p-2 ${showOptions ? "bg-gray-50/10" : ""} rounded-xl border border-gray-500/30`}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div
        {...toggleOptions()}
        className="flex gap-2 cursor-pointer w-full"
        onClick={() => setNoteExpand((prev) => !prev)}
      >
        <small>{index + 1}.</small>
        <small
          className={`${noteExpand ? "" : "line-clamp-1"} w-full wrap-anywhere grow`}
        >
          {note.note}.
        </small>
        <div
          className="cursor-grab"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={20}>
            <title>Prioritize the notes</title>
          </GripVertical>
        </div>
      </div>
      <div
        className={`grid grid-cols-4 place-items-center rounded-full absolute right-0 top-0.5 text-sm z-10 bg-black max-w-0 overflow-hidden ${showOptions ? "max-w-40 " : "max-w-0 p-0"} transition-all duration-500`}
      >
        <div
          className={`hover:bg-gray-400/20 transition-all p-2`}
          onClick={handleEdit}
        >
          <Pencil size={15} className="text-blue-500 cursor-pointer">
            <title>Edit</title>
          </Pencil>
        </div>
        <div
          className={`hover:bg-green-400/20 transition-all p-2 ${note.completed ? "bg-green-700" : ""} cursor-pointer`}
          onClick={() => handleMarkDone(note)}
        >
          <Check
            size={15}
            className={`${markDoneLoading ? "animate-bounce" : "animate-none"}`}
          >
            <title>Mark Done</title>
          </Check>
        </div>
        <div
          onClick={() => handleMarkNotDone(note)}
          className={`hover:bg-red-400/20 transition-all p-2 ${note.completed ? "" : "bg-red-700"} cursor-pointer`}
        >
          <X
            className={`${markUnDoneLoading ? "animate-bounce" : "animate-none"}`}
            size={15}
          >
            <title>Mark Not Done</title>
          </X>
        </div>
        <div
          onClick={() => handleDelete(note)}
          className={`hover:bg-gray-400/20 transition-all p-2`}
        >
          <Trash
            size={15}
            className={`text-red-500 cursor-pointer ${noteDeletetLoading ? "animate-ping duration-100" : "animate-none"}`}
          >
            <title>Remove</title>
          </Trash>
        </div>
      </div>
    </div>
  );
}
