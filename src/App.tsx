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

const loader = async () => {
  client.query({
    query: GET_SPACEX_TOTAL_EMPLOYEES,
  });

  return null;
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
  const { data, loading } = useQuery<DataResult>(GET_SPACEX_TOTAL_EMPLOYEES, {
    fetchPolicy: "network-only",
  });
  console.log("loading: ", loading);

  return (
    <h1>Total number of SpaceX 📡 employees: {data?.company.employees}</h1>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
