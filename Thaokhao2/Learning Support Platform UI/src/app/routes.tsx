import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskList from "./pages/TaskList";
import FocusTimer from "./pages/FocusTimer";
import BreakScreen from "./pages/BreakScreen";
import Reward from "./pages/Reward";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/tasks",
    Component: TaskList,
  },
  {
    path: "/focus",
    Component: FocusTimer,
  },
  {
    path: "/break",
    Component: BreakScreen,
  },
  {
    path: "/reward",
    Component: Reward,
  },
  {
    path: "/progress",
    Component: Progress,
  },
  {
    path: "/settings",
    Component: Settings,
  },
]);
