import { createBrowserRouter } from "react-router-dom";
import NotFound from "./components/router/NotFound";
import Root from "./components/Root";
import ProtectedRoute from "./components/router/ProtectedRoute";
import DisplayUpload from "./components/display/DisplayUpload";
import Display from "./components/display/Display";
import DisplayShow from "./components/display/DisplayShow";

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
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <div>This is only for admin</div>
          </ProtectedRoute>
        ),
      },
      {
        path: "display",
        children: [
          { index: true, element: <Display /> },
          {
            path: "upload", //
            element: (
              <ProtectedRoute requiredAdmin={false}>
                <DisplayUpload />
              </ProtectedRoute>
            ),
          },
          { path: "show", element: <DisplayShow /> },
        ],
      },
    ],
  },
]);

export default router;
