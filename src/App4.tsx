import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useLoaderData,
  useFetcher,
  replace,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { useState } from "react";

// Log any GraphQL errors or network error that occurred
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
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
  const nonCriticalData = new Promise((res) =>
    setTimeout(() => res(value++), 3000)
  );

  const criticalData = await new Promise((res) =>
    setTimeout(() => res("critical"), 300)
  );

  return { nonCriticalData, criticalData };
};

let router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    Component: Root,
    children: [
      {
        index: true,
        loader,
        action: async ({ request }) => {
          const payload = await request.json();

          const { intent } = payload;

          if (intent === "update-action-1.1") {
            return {
              success: true,
              error: null,
            };
          } else if (intent === "update-action-1.2") {
            return {
              success: false,
              error: "Error updating data from 1.2",
            };
          } else if (intent === "update-action-2") {
            return {
              success: true,
              error: "Error updating data from 2",
            };
          }

          return {
            success: true,
            error: null,
          };
        },
        Component: Home,
      },
      {
        path: "about",
        Component: () => {
          return (
            <div>
              <h1>About</h1>
              <Outlet />
            </div>
          );
        },
        children: [
          {
            path: "inside",
            Component: () => {
              return (
                <>
                  <div
                    style={{
                      height: 1000,
                    }}
                  />
                  <section
                    id="anchor"
                    style={{
                      height: 1000,
                    }}
                  >
                    Hola
                  </section>
                </>
              );
            },
          },
        ],
      },
    ],
    errorElement: <div>Error Boundary</div>,
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
            <Link to="/" state={{ message: "Hello to home from about" }}>
              Home
            </Link>
            <Link to="/about" state={{ message: "Hello to about from home" }}>
              About
            </Link>
            <Link to="/about/inside#anchor">About inside</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
}

function Home() {
  const { criticalData } = useLoaderData<typeof loader>();
  const fetcher1 = useFetcher();
  const fetcher2 = useFetcher();
  const [count, setCount] = useState(0);

  console.log("fetcher1", fetcher1.data);
  console.log("fetcher2", fetcher2.data);

  return (
    <div>
      <h2>Data value: {criticalData}</h2>
      <button
        onClick={async () => {
          fetcher1.submit(
            {
              intent: "update-action-1.1",
            },
            { method: "post", encType: "application/json" }
          );
        }}
      >
        Update data via action 1.1
      </button>
      <button
        onClick={async () => {
          fetcher1.submit(
            {
              intent: "update-action-1.2",
            },
            { method: "post", encType: "application/json" }
          );
        }}
      >
        Update data via action 1.2
      </button>

      <button
        onClick={async () => {
          fetcher2.submit(
            {
              intent: "update-action-2",
            },
            { method: "post", encType: "application/json" }
          );
        }}
      >
        Update data via action 2
      </button>

      <button onClick={() => setCount((prev) => prev + 1)}>
        Value: {count}
      </button>
    </div>
  );
}
