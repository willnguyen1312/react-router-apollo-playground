import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
  const response = await client.query({
    query: GET_SPACEX_TOTAL_EMPLOYEES,
  });

  return {
    data: response.data as DataResult,
  };
};

let router = createBrowserRouter([
  {
    path: "/",
    loader,
    Component,
  },
]);

export default function App() {
  return (
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  );
}

function Component() {
  const { data } = useQuery<DataResult>(GET_SPACEX_TOTAL_EMPLOYEES);

  return <h1>Total SpaceX employees: {data?.company.employees} 📡</h1>;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
