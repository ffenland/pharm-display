import { createBrowserRouter } from "react-router-dom";
import NotFound from "./components/router/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>hi</div>,
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
