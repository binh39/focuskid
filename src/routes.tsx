import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Mission from "./pages/mission";
import Progress from "./pages/progress";
import Settings from "./pages/settings";
import Focus from "./pages/focus";
import Reward from "./pages/reward";

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
    path: "/mission",
    Component: Mission,
  },
  {
    path: "/progress",
    Component: Progress,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/focus",
    Component: Focus,
  },
  {
    path: "/reward",
    Component: Reward,
  },
]);