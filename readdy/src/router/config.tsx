
import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Dashboard from "../pages/dashboard/page";
import Projects from '../pages/projects/page';
import Archives from '../pages/archives/page';

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/projects",
    element: <Projects />
  },
  {
    path: "/archives",
    element: <Archives />
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
