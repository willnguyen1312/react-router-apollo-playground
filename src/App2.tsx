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
  uri: "http://localhost:5173",
  cache: new InMemoryCache(),
});

const GET_NUMBER_QUERY = gql`
  query GetNumber {
    value
  }
`;

const loader = async () => {
  // Wait 100ms
  await new Promise((resolve) => setTimeout(resolve, 100));
  client.query({
    query: GET_NUMBER_QUERY,
    fetchPolicy: "network-only",
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
  const { data } = useQuery(GET_NUMBER_QUERY, {
    fetchPolicy: "network-only",
  });

  return (
    <div>
      <p>Number: {data?.value}</p>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
