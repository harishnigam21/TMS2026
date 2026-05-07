import { Pagination } from "@/types/pagination";
import { Note, Task } from "@/types/task";
import { arrayMove } from "@dnd-kit/sortable";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

interface TaskState {
  tasks: Task[];
  pagination: Pagination | null;
  priorityChanges: Map<string, string>;
}

const initialState: TaskState = {
  tasks: [],
  pagination: null,
  priorityChanges: new Map(),
};

const TaskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          completed: action.payload.completed,
          updatedAt: action.payload.updatedAt,
        };
      }
    },
    starTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          star: action.payload.star,
          updatedAt: action.payload.updatedAt,
        };
      }
    },
    deleteTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter((item) => item.id != action.payload);
    },
    setPagination: (state, action: PayloadAction<Pagination>) => {
      state.pagination = action.payload;
    },
    addNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          noteCount: state.tasks[index].noteCount + 1,
          updatedAt: action.payload.updatedAt,
          notes: [...state.tasks[index].notes, action.payload],
        };
      }
    },
    addAllNote: (state, action: PayloadAction<Note[]>) => {
      if (action.payload.length > 0) {
        const index = state.tasks.findIndex(
          (item) => item.id === action.payload[0].taskId,
        );

        if (index !== -1) {
          state.priorityChanges.clear();
          state.tasks[index] = {
            ...state.tasks[index],
            notes: action.payload,
          };
        }
      }
    },
    clearpriorityChanges: (state, action: PayloadAction<{ id: number }>) => {
      const changes = state.priorityChanges;
      const taskId = action.payload.id;
      const Tindex = state.tasks.findIndex(
        (item) => item.id === Number(taskId),
      );
      if (changes.size > 0) {
        for (const [key, value] of changes) {
          const Nindex = state.tasks[Tindex].notes.findIndex(
            (item) => item.id === Number(key),
          );
          const chc = state.tasks[Tindex].notes[Nindex];
          if (chc.prevPriority) {
            chc.priority = chc.prevPriority;
            delete chc.prevPriority;
          } else {
            toast.error(
              `Their is some suspicious Change at Note with Title : ${chc.note}`,
            );
          }
        }
        changes.clear();
        state.tasks[Tindex].notes.sort((a, b) => a.priority - b.priority);
      } else {
        toast.error("There are no changes to make.");
      }
    },
    onlyClearpriorityChange: (state) => {
      const changes = state.priorityChanges;
      if (changes.size > 0) {
        changes.clear();
      } else {
        toast.error("There are no changes to make.");
      }
    },

    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: state.tasks[index].notes.map((item) => {
            if (item.id == action.payload.id) {
              return action.payload;
            } else {
              return item;
            }
          }),
        };
      }
    },
    deleteNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          noteCount: state.tasks[index].noteCount - 1,
          notes: state.tasks[index].notes.filter((item) => {
            if (item.id != action.payload.id) {
              return item;
            }
          }),
        };
      }
    },
    markNote: (state, action: PayloadAction<Note>) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.taskId,
      );

      if (index !== -1) {
        state.tasks[index] = {
          ...state.tasks[index],
          updatedAt: action.payload.updatedAt,
          notes: state.tasks[index].notes.map((item) => {
            if (item.id == action.payload.id) {
              return action.payload;
            } else {
              return item;
            }
          }),
        };
      }
    },
    dragNote: (
      state,
      action: PayloadAction<{ old: number; new: number; id: number }>,
    ) => {
      const index = state.tasks.findIndex(
        (item) => item.id === action.payload.id,
      );
      const OldIndex = state.tasks[index].notes.findIndex(
        (item) => item.id == action.payload.old,
      );
      const NewIndex = state.tasks[index].notes.findIndex(
        (item) => item.id == action.payload.new,
      );
      const direction =
        state.tasks[index].notes[OldIndex].priority -
          state.tasks[index].notes[NewIndex].priority >
        0
          ? "up"
          : "down";
      const updatedPriority =
        direction == "up"
          ? (state.tasks[index].notes[NewIndex].priority +
              (state.tasks[index].notes[NewIndex - 1]
                ? state.tasks[index].notes[NewIndex - 1].priority
                : 0)) /
            2
          : (state.tasks[index].notes[NewIndex].priority +
              (state.tasks[index].notes[NewIndex + 1]
                ? state.tasks[index].notes[NewIndex + 1].priority
                : 2000 + state.tasks[index].notes[NewIndex].priority)) /
            2;
      state.priorityChanges.set(
        String(action.payload.old),
        String(updatedPriority),
      );
      if (!state.tasks[index].notes[OldIndex].prevPriority) {
        state.tasks[index].notes[OldIndex]["prevPriority"] =
          state.tasks[index].notes[OldIndex].priority;
      }
      state.tasks[index].notes[OldIndex].priority = updatedPriority;
      state.tasks[index].notes = arrayMove(
        state.tasks[index].notes,
        OldIndex,
        NewIndex,
      );
    },
  },
});
export const {
  setTask,
  addTask,
  updateTask,
  starTask,
  deleteTask,
  setPagination,
  addNote,
  addAllNote,
  clearpriorityChanges,
  onlyClearpriorityChange,
  updateNote,
  deleteNote,
  markNote,
  dragNote,
} = TaskSlice.actions;
export default TaskSlice.reducer;
