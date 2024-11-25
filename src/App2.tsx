import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
  useRevalidator,
} from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useMutation,
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

const HELLO_MUTATION = gql`
  mutation Hello {
    message
  }
`;

const loader = async () => {
  // Wait 100ms
  await new Promise((resolve) => setTimeout(resolve, 100));
  await client.query({
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

let time = 1;

function Home() {
  const { data, loading, refetch } = useQuery(GET_NUMBER_QUERY);
  const [mutateHello] = useMutation(HELLO_MUTATION, {
    errorPolicy: "all",
  });
  const navigate = useNavigate();
  const { state, revalidate } = useRevalidator();
  // console.log(state);

  return (
    <div>
      <p>Number: {data?.value}</p>
      <button
        onClick={() => {
          // client.query({
          //   query: GET_NUMBER_QUERY,
          //   fetchPolicy: "network-only",
          // });

          // The above and below code are equivalent

          // navigate(`/?time=${time++}`, { replace: true });
          revalidate();

          // refetch();
        }}
      >
        Refresh number
      </button>
      <p>{loading ? "Loading..." : null}</p>
      <button
        onClick={async () => {
          const data = await mutateHello();
          console.log(data);
        }}
      >
        Hello
      </button>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
