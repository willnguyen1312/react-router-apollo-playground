import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// Separate router for admin section
const adminRouter = createBrowserRouter([
  {
    path: "/",
    Component: () => {
      return (
        <div>
          <div>Admin Dashboard</div>
          <Outlet />
        </div>
      );
    }, // Placeholder for nested routes
    children: [
      {
        path: "users",
        element: <div>Users</div>,
      },
      {
        path: "reports",
        element: <div>Reports</div>,
      },
    ],
  },
]);

// Component that uses the nested router
const AdminSection = () => {
  return (
    <div>
      <h2>Admin Area</h2>
      <RouterProvider router={adminRouter} />
    </div>
  );
};

// Main app router
const mainRouter = createBrowserRouter([
  {
    path: "/",
    Component: () => {
      return (
        <div>
          <h1>Main Application</h1>
          <Outlet />
        </div>
      );
    },
    children: [
      {
        index: true,
        element: <AdminSection />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={mainRouter} />;
}
