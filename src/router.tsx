import { createBrowserRouter } from "react-router-dom";
import NotFound from "./components/router/NotFound";
import Root from "./components/Root";
import DisplayUpload from "./components/display/DisplayUpload";
import Display from "./components/display/Display";
import Home from "./components/home/Home";
import Monitor from "./components/Monitor/Monitor";

const router = createBrowserRouter([
  { path: "monitor", element: <Monitor /> },
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "display",
        children: [
          { index: true, element: <Display /> },
          {
            path: "upload", //
            element: <DisplayUpload />,
          },
        ],
      },
    ],
  },
]);

export default router;
