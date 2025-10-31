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

export const client = new ApolloClient({
  // uri: "http://localhost:5173",
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    errorLink,
    new HttpLink({ uri: "https://api.example.com/graphql" }),
  ]),
});

export const GET_NUMBER_QUERY = gql`
  query GetNumber {
    value
  }
`;

export const FETCH_NUMBER_QUERY = gql`
  query FetchNumber {
    value
  }
`;

export function Home() {
  const { data, loading } = useQuery(GET_NUMBER_QUERY);
  const client = useApolloClient();

  return (
    <div>
      <p>Number: {data?.value}</p>
      <p>{loading ? "Loading..." : null}</p>
      <button
        onClick={async () => {
          console.log(data);
        }}
      >
        Hello
      </button>
    </div>
  );
}
