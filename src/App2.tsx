import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useNavigate,
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
  useApolloClient,
} from "@apollo/client";
import { use, useState } from "react";
import { onError } from "@apollo/client/link/error";

// Log any GraphQL errors or network error that occurred
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const spaceXClient = new ApolloClient({
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
  // const data = await fetch("http://jsonplaceholder.typicode.com/comments/1");
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

  client.query({
    query: GET_NUMBER_QUERY,
    fetchPolicy: "network-only",
  });

  return null;
};


const About = () => {
  const { data, loading, refetch, startPolling, stopPolling, error: errorQuery } = useQuery(
    GET_SPACEX_TOTAL_EMPLOYEES,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  console.log("errorQuery", errorQuery);

  return <div>About</div>;
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
        Component: About,
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

// let time = 1;

function Home() {
  // const _data = useRouteLoaderData("root")
  const { data, loading, refetch, startPolling, stopPolling } = useQuery(
    GET_NUMBER_QUERY,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const client = useApolloClient();
  // const { data: errorData, error } = useQuery(ERROR_QUERY, {
  // errorPolicy: "",
  // });

  // if (error?.networkError) {
  //   debugger;
  // }

  // if (error?.graphQLErrors) {
  //   debugger;
  // }

  const [value, setValue] = useState(0);

  const [mutateHello] = useMutation(HELLO_MUTATION, {
    errorPolicy: "all",
  });
  // const navigate = useNavigate();
  // const { state, revalidate } = useRevalidator();
  const { data: errorData, error } = useQuery(ERROR_QUERY, {
    // errorPolicy: "ignore",
    errorPolicy: "all",
    // errorPolicy: "none",
  });

  if (error) {
    // fetch("https://jsonplaceholder.typicode.com/comments");
    // throw error;
    console.log({ error, errorData });
  }

  return (
    <div>
      <p>Number: {data?.value}</p>
      <button onClick={() => setValue(value + 1)}>Value: {value}</button>
      <button
        onClick={() => {
          client.query({
            query: GET_NUMBER_QUERY,
            fetchPolicy: "network-only",
          });

          // The above and below code are equivalent

          // navigate(`/?time=${time++}`, { replace: true });
          // revalidate();

          refetch();
          // startPolling(1000);
          // client.query({
          //   query: GET_NUMBER_QUERY,
          //   fetchPolicy: "network-only",
          // });
        }}
      >
        Start polling
      </button>

      <button
        onClick={() => {
          stopPolling();
        }}
      >
        Stop polling
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

      <button
        onClick={() => {
          const watchQuery = client.watchQuery({
            query: GET_NUMBER_QUERY,
            fetchPolicy: "no-cache",
            errorPolicy: "all",
          });
          
          watchQuery.subscribe({
            error: (error) => {
              console.log("error");
              console.log(error);
            },
            next: (result) => {
              console.log("next");
              console.log(result);
            },
            complete: () => {
              console.log("complete");
            },
            start: () => {
              console.log("start");
            },
          })
        }}
      >
        Watch query
      </button>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
