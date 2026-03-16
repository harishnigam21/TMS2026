"use client";

import { Provider } from "react-redux";
import Store from "./Store";

export function ReduxProvider({ children }) {
  return <Provider store={Store}>{children}</Provider>;
}
