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
  useApolloClient,
} from "@apollo/client";
import { signal } from "@preact/signals-react";
import React from "react";

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
        Component: Home,
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
          </li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
}

const employees = signal<number | null>(null);
const loadingEmployees = signal(false);
const errorLoadingEmployees = signal<Error | null>(null);

const useEmployeesData = () => {
  const apolloClient = useApolloClient();

  const getEmployees = async () => {
    loadingEmployees.value = true;
    errorLoadingEmployees.value = null;
    try {
      const result = await apolloClient.query<DataResult>({
        query: GET_SPACEX_TOTAL_EMPLOYEES,
        fetchPolicy: "network-only",
      });
      employees.value = result.data.company.employees;
      loadingEmployees.value = false;
      return result;
    } catch (error) {
      loadingEmployees.value = false;
    } finally {
      loadingEmployees.value = false;
    }
  };

  React.useEffect(() => {
    return () => {
      employees.value = null;
      loadingEmployees.value = false;
      errorLoadingEmployees.value = null;
    };
  }, []);

  return {
    getEmployees,
    loading: loadingEmployees.value,
    data: employees.value,
    error: errorLoadingEmployees.value,
  };
};

function Home() {
  const { loading, data } = useEmployeesData();
  const [rerenderCounter, setRerenderCounter] = React.useState(0);

  console.log("Home rendered ", loading, data);

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && data && <h1>Total number of SpaceX 📡 employees: {data}</h1>}

      <button
        onClick={() => {
          setRerenderCounter(rerenderCounter + 1);
        }}
      >
        Click {rerenderCounter}
      </button>

      <ChildComponent />
    </>
  );
}

function ChildComponent() {
  const { getEmployees, loading, data, error } = useEmployeesData();

  return (
    <div>
      <button
        onClick={() => {
          getEmployees();
        }}
      >
        Fetch total employees from Child Component
      </button>

      {loading && <p>Loading...</p>}
      {!loading && data && (
        <h2>[Child Component] Total number of SpaceX 📡 employees: {data}</h2>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
