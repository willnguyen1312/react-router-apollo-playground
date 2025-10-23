import { useEffect, useState, useRef } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  ApolloError,
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

const loader = async () => {
  // const result = await client.query({
  //   query: GET_SPACEX_TOTAL_EMPLOYEES,
  // });

  return {
    // result,
  };
};

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        loader,
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
  const [data, setData] = useState<DataResult | null>(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(
    new AbortController()
  );

  // useEffect(() => {
  //   console.log("Home mounted");
  //   setLoading(true);
  //   client
  //     .query({
  //       query: GET_SPACEX_TOTAL_EMPLOYEES,
  //       fetchPolicy: "no-cache",
  //       context: {
  //         fetchOptions: {
  //           signal: abortControllerRef.current?.signal,
  //         },
  //       },
  //     })
  //     .then((res) => {
  //       console.log("Data fetched on mount:", res.data);
  //       setData(res.data);
  //     })
  //     .catch((err) => {
  //       if (err instanceof ApolloError) {
  //         console.error("Apollo error:", err);
  //       } else {
  //         console.error("Unknown error:", err);
  //       }
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });

  //   setTimeout(() => {
  //     console.log("Aborting fetch request after 250ms");
  //     abortControllerRef.current?.abort();
  //   }, 500);

  //   return () => {
  //     console.log("Home unmounted");
  //     // abortController.abort("Component unmounted, so aborting fetch request");
  //     // abortController.abort();
  //   };
  // }, []);

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && data && (
        <h1>Total number of SpaceX 📡 employees: {data?.company.employees}</h1>
      )}

      <button
        onClick={() => {
          setLoading(true);
          setData(null);
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
          abortControllerRef.current?.abort(
            new Error("Fetch aborted by user 👋")
          );
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
