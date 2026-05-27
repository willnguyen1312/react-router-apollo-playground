import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  useBlocker,
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

function useFireRequestOnTabClose(shouldPrompt: boolean) {
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      fetch("/api/closing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "beforeunload", at: Date.now() }),
      });
      if (shouldPrompt) {
        // Triggers the browser's native "Leave site?" dialog.
        // The message is browser-controlled and cannot be customised.
        e.preventDefault();
        e.returnValue = ""; // legacy, still required by some browsers
      }
    }
    // `beforeunload` fires just before the page is unloaded (tab close,
    // reload, or navigation away). Doesn't fire on mobile Safari, and
    // requires prior user interaction in modern Chrome.
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [shouldPrompt]);
}

function Layout() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  useFireRequestOnTabClose(hasUnsavedChanges);

  // `useBlocker` intercepts in-app navigation only — it has no effect on
  // tab close or full page reload (use `beforeunload` for those).
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  return (
    <div>
      <h1>Before-leave request demo</h1>
      <nav style={{ display: "flex", gap: 12 }}>
        <Link to="/a">Go to A</Link>
        <Link to="/b">Go to B</Link>
      </nav>
      <label style={{ display: "block", marginTop: 12 }}>
        <input
          type="checkbox"
          checked={hasUnsavedChanges}
          onChange={(e) => setHasUnsavedChanges(e.target.checked)}
        />{" "}
        I have unsaved changes (block in-app navigation)
      </label>
      <hr />
      {blocker.state === "blocked" && (
        <div
          style={{
            padding: 12,
            border: "1px solid #c33",
            marginBottom: 12,
          }}
          role="alertdialog"
          aria-labelledby="blocker-title"
        >
          <p id="blocker-title" style={{ margin: 0, marginBottom: 8 }}>
            You have unsaved changes. Leave anyway?
          </p>
          <button onClick={() => blocker.proceed()}>Leave</button>{" "}
          <button onClick={() => blocker.reset()}>Stay</button>
        </div>
      )}
      <Outlet />
      <hr />
      <p>
        Open DevTools → Network and watch <code>POST /api/leave</code> fire each
        time you switch routes, and <code>POST /api/closing</code> fire when you
        close the tab or navigate away. Both are logged by the Node server.
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
