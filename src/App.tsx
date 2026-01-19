import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./modules/Home/Home";
import { Movies } from "./modules/movies/Movies";
import { Latest } from "./modules/movies/Latest";
import { MovieDetails } from "./modules/movies/MovieDetails";
import { AdminPanel } from "./modules/admin/AdminPanel";


function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home/>,
    },
    {
      path: "/movies",
      element: <Movies/>,
    },
    {
      path: "/movies/:id",
      element: <MovieDetails/>,
    },
    {
      path: "/latest",
      element: <Latest/>,
    },
    {
      path: "/admin",
      element: <AdminPanel/>,
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
