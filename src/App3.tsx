import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useLoaderData,
  Await,
  useFetcher,
  useAsyncValue,
  Form,
  useLocation,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { Suspense, use } from "react";
import { onError } from "@apollo/client/link/error";
import { promiseState } from "promise-status-async";

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
  console.log("loader");
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
    // loader: async () => {
    //   const data = await fetch("http://jsonplaceholder.typicode.com/posts/1");
    //   const result = await data.json();
    //   console.log("finish loader");
    //   return result;
    // },
    id: "root",
    Component: Root,
    children: [
      {
        index: true,
        loader,
        action: async ({ request }) => {
          console.log("finish action");
          return {
            success: true,
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
  const { state } = useLocation();

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
  const fetcher = useFetcher();

  console.log("render home");
  return (
    <div>
      <h2>Data value: {criticalData}</h2>
      <button
        onClick={async () => {
          // fetcher.submit(null, { method: "post" });
          fetcher.load("");
        }}
      >
        Update data via action
      </button>
    </div>
  );
}
