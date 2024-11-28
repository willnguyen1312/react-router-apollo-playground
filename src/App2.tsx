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
  ApolloLink,
  HttpLink,
} from "@apollo/client";
import { useState } from "react";
import { onError } from "@apollo/client/link/error";

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

const GET_NUMBER_QUERY = gql`
  query GetNumber {
    value
  }
`;

const ERROR_QUERY = gql`
  query Error {
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
  // await client
  //   .query({
  //     query: ERROR_QUERY,
  //     fetchPolicy: "network-only",
  //     errorPolicy: "all",
  //   })
  //   .then((data) => {
  //     console.log(data.errors);
  //   });
  // .catch((error) => {
  //   console.error(error);
  // });

  // throw new Error("Error nha 😎");

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
  const { data, loading, refetch } = useQuery(GET_NUMBER_QUERY, {
    skip: true,
  });
  const { data: errorData, error } = useQuery(ERROR_QUERY, {
    // errorPolicy: "",
  });

  if (error?.networkError) {
    debugger;
  }

  if (error?.graphQLErrors) {
    debugger;
  }

  const [value, setValue] = useState(0);

  const [mutateHello] = useMutation(HELLO_MUTATION, {
    errorPolicy: "all",
  });
  const navigate = useNavigate();
  const { state, revalidate } = useRevalidator();

  return (
    <div>
      <p>Number: {data?.value}</p>
      <button onClick={() => setValue(value + 1)}>Value: {value}</button>
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
