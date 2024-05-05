import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
} from "react-router-dom";

const loader = async () => {
  const response = await fetch(
    "https://jsonplaceholder.typicode.com/todos/1"
  ).then((res) => res.json());
  return { message: "Hello, world!", response };
};

let router = createBrowserRouter([
  {
    path: "/",
    loader,
    Component,
  },
]);

export default function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}

function Component() {
  const data = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  console.log(data.response);

  return <h1>{data.message}</h1>;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
