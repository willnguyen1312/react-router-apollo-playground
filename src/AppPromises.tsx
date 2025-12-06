import { Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  Await,
  useAsyncValue,
  useLoaderData,
} from "react-router-dom";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loader = async () => {
  const contentPromise = fetch(
    "http://jsonplaceholder.typicode.com/posts/1",
  ).then(async (res) => {
    await sleep(1000);
    return res.json();
  });
  return {
    data: {
      id: 1,
      contentPromise,
    },
  };
};

const router = createBrowserRouter([
  {
    path: "/",

    id: "root",
    Component: Root,
    children: [
      {
        index: true,
        loader,
        Component: Home,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

function Root() {
  return (
    <main>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
}

function Home() {
  const { data } = useLoaderData();

  const { contentPromise, id } = data;
  return (
    <div>
      <h1>Home</h1>

      <h2>Content Data: {id}</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={contentPromise}>
          {(content) => (
            <div>
              <h3>Content:</h3>
              <p>{content.body}</p>
            </div>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
