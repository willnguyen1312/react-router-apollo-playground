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
  ApolloLink,
  HttpLink,
  useApolloClient,
} from "@apollo/client";

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([new HttpLink({ uri: "http://localhost:5173" })]),
});

const GET_NUMBER_QUERY = gql`
  query GetNumber {
    value
  }
`;

const loader = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  // client.query({
  //   query: GET_NUMBER_QUERY,
  //   fetchPolicy: "network-only",
  // });

  return null;
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
  const { data, loading } = useQuery(GET_NUMBER_QUERY);
  const client = useApolloClient();

  return (
    <div>
      <p>Number: {data?.value}</p>
      <button
        onClick={() => {
          client.query({
            query: GET_NUMBER_QUERY,
            fetchPolicy: "network-only",
          });
        }}
      >
        Refresh number
      </button>
      <p>{loading ? "Loading..." : null}</p>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
