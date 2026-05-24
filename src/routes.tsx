import { createBrowserRouter } from "react-router-dom";
import Login from "./pages/login";
import ParentDashboard from "./pages/ParentDashboard";
import ChildDashboard from "./pages/ChildDashboard";
import ParentMissions from "./pages/ParentMissions";
import ChildMissions from "./pages/ChildMissions";
import ParentProgress from "./pages/ParentProgress";
import ChildProgress from "./pages/ChildProgress";
import ParentSettings from "./pages/ParentSettings";
import ChildSettings from "./pages/ChildSettings";
import Focus from "./pages/focus";
import Reward from "./pages/reward";
import ChildReader from "./pages/ChildReader";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/parent/dashboard",
    Component: ParentDashboard,
  },
  {
    path: "/parent/missions",
    Component: ParentMissions,
  },
  {
    path: "/parent/progress",
    Component: ParentProgress,
  },
  {
    path: "/parent/settings",
    Component: ParentSettings,
  },
  {
    path: "/child/dashboard",
    Component: ChildDashboard,
  },
  {
    path: "/child/missions",
    Component: ChildMissions,
  },
  {
    path: "/child/progress",
    Component: ChildProgress,
  },
  {
    path: "/child/settings",
    Component: ChildSettings,
  },
  {
    path: "/child/focus",
    Component: Focus,
  },
  {
    path: "/child/reward",
    Component: Reward,
  },
  {
    path: "/child/reader",
    Component: ChildReader,
  },
]);
