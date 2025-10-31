import {
  ApolloClient,
  InMemoryCache,
  gql,
  useQuery,
  ApolloLink,
  HttpLink,
} from "@apollo/client";

export const client = new ApolloClient({
  // uri: "http://localhost:5173",
  cache: new InMemoryCache(),
  link: ApolloLink.from([
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
