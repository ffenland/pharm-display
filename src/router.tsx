import { createBrowserRouter } from "react-router-dom";
import NotFound from "./components/router/NotFound";
import Root from "./components/Root";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <div>main</div>,
      },
    ],
  },
]);

export default router;
