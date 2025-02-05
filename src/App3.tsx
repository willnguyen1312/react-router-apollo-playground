import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useLoaderData,
  Await,
  useFetcher,
  useAsyncValue,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { Suspense } from "react";
import { onError } from "@apollo/client/link/error";

// Log any GraphQL errors or network error that occurred
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
  // uri: "http://localhost:5173",
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    errorLink,
    new HttpLink({ uri: "http://localhost:5173" }),
  ]),
});

let value = 0;

const loader = async () => {
  console.log("loader");
  const nonCriticalData = new Promise((res) =>
    setTimeout(() => res(value++), 3000),
  );

  const criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300),
  );

  return { nonCriticalData, criticalData };
};

let router = createBrowserRouter([
  {
    path: "/",
    loader: async () => {
      const data = await fetch("http://jsonplaceholder.typicode.com/posts/1");
      const result = await data.json();
      return result;
    },
    id: "root",
    Component: Root,
    children: [
      {
        index: true,
        loader,
        action: async () => {
          console.log("action");
          return null;
        },
        Component: Home,
      },
      {
        path: "about",
        Component: () => {
          return <div>About</div>;
        },
      },
    ],
  },
]);

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
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
  const { nonCriticalData, criticalData } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div>
      <h1>Streaming example</h1>
      <h2>Critical data value: {criticalData}</h2>

      <fetcher.Form method="post">
        <button type="submit">Refresh data</button>
      </fetcher.Form>

      <Suspense fallback={<div>Loading...</div>}>
        <Await resolve={nonCriticalData}>
          {(value) => (
            <>
              <h3>Non critical value: {value}</h3>
              <LateComponent />
            </>
          )}
        </Await>
      </Suspense>
    </div>
  );
}

function LateComponent() {
  const value = useAsyncValue() as number;
  // const { nonCriticalData } = useLoaderData<typeof loader>();
  // const value = use(nonCriticalData);
  return <div>Late component: {value}</div>;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
