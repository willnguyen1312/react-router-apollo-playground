import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";
import { useState, useRef } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  ApolloError,
  useApolloClient,
  useQuery,
} from "@apollo/client";

const client = new ApolloClient({
  uri: "https://spacex-production.up.railway.app/",
  cache: new InMemoryCache(),
});

const GET_SPACEX_TOTAL_EMPLOYEES = gql`
  query CEO {
    company {
      employees
    }
  }
`;

type DataResult = {
  company: {
    employees: number;
  };
};

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        loader: () => {
          fetch("https://jsonplaceholder.typicode.com/posts/1");
          return {};
        },
        Component: Home,
      },
      {
        path: "about",
        loader: () => {
          fetch("https://jsonplaceholder.typicode.com/posts/2");
          return {};
        },
        Component: About,
        children: [
          {
            path: "nested",
            loader: () => {
              fetch("https://jsonplaceholder.typicode.com/posts/3");
              return {};
            },
            Component: () => <div>Nested About</div>,
          },
        ],
      },
    ],
  },
]);

function About() {
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    GET_SPACEX_TOTAL_EMPLOYEES,
    {
      fetchPolicy: "cache-first",
    }
  );

  return (
    <>
      <div>About</div>
      <button
        onClick={() => {
          startPolling(1000);
        }}
      >
        Start poll
      </button>
      <button
        onClick={() => {
          stopPolling();
        }}
      >
        Stop poll
      </button>
      {data && <div>Total Employees: {data.company.employees}</div>}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
    </>
  );
}

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
            <Link to="/about/nested">Nested</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
}

function Home() {
  const [data, setData] = useState<DataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(
    new AbortController()
  );
  const client = useApolloClient();

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && data && (
        <h1>Total number of SpaceX 📡 employees: {data?.company.employees}</h1>
      )}

      <button
        onClick={() => {
          setLoading(true);
          console.log("Fetching data on button click");
          client
            .query({
              query: GET_SPACEX_TOTAL_EMPLOYEES,
              fetchPolicy: "network-only",
              context: {
                fetchOptions: {
                  signal: abortControllerRef.current?.signal,
                },
              },
            })
            .then((res) => {
              console.log("Data fetched on mount:", res.data);
              setData(res.data);
            })
            .catch((err) => {
              if (err instanceof ApolloError) {
                console.error("Apollo error:", err);
              } else {
                console.error("Unknown error:", err);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        Fetch Data
      </button>

      <button
        onClick={() => {
          abortControllerRef.current?.abort();
          abortControllerRef.current = new AbortController();
        }}
      >
        Cancel
      </button>
    </>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
