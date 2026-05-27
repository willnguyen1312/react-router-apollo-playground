import { useEffect } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";

function fireLeaveRequest(from: string) {
  // `keepalive` lets the request survive a full page unload too.
  // For client-side route changes it isn't strictly required, but it's a
  // sensible default for "fire-and-forget on the way out".
  return fetch("/api/leave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from }),
    keepalive: true,
  });
}

function useFireRequestOnLeave(from: string) {
  useEffect(() => {
    return () => {
      // Runs when the route component unmounts, i.e. when navigating away.
      void fireLeaveRequest(from);
    };
  }, [from]);
}

function RouteA() {
  useFireRequestOnLeave("a");
  return (
    <section>
      <h2>Route A</h2>
      <p>Leaving this route will POST /api/leave with {`{ from: "a" }`}.</p>
    </section>
  );
}

function RouteB() {
  useFireRequestOnLeave("b");
  return (
    <section>
      <h2>Route B</h2>
      <p>Leaving this route will POST /api/leave with {`{ from: "b" }`}.</p>
    </section>
  );
}

function Layout() {
  return (
    <div>
      <h1>Before-leave request demo</h1>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/a">Go to A</Link>
        <Link to="/b">Go to B</Link>
      </nav>
      <hr />
      <Outlet />
      <hr />
      <p>
        Open DevTools → Network and watch <code>POST /api/leave</code> fire each
        time you switch routes. The request is handled by MSW (see the service
        worker console log).
      </p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <p>Pick route A or B above.</p> },
      { path: "a", Component: RouteA },
      { path: "b", Component: RouteB },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
