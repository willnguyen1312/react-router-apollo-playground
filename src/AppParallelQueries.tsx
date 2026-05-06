import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
} from "@apollo/client";

const client = new ApolloClient({
  uri: "https://countries.trevorblades.com/graphql",
  cache: new InMemoryCache(),
});

// SUBSET: only asks for name and capital
const GET_COUNTRY_BASIC = gql`
  query GetCountryBasic {
    country(code: "CA") {
      name
      capital
    }
  }
`;

// SUPERSET: asks for name, capital, AND extra fields
const GET_COUNTRY_FULL = gql`
  query GetCountryFull {
    country(code: "CA") {
      name
      capital
      currency
      languages {
        name
      }
      continent {
        name
      }
    }
  }
`;

function BasicInfo() {
  const { data, loading } = useQuery(GET_COUNTRY_BASIC, {
    fetchPolicy: "network-only",
  });

  return (
    <div style={{ border: "1px solid blue", padding: 16, margin: 8 }}>
      <h3>BasicInfo (subset query)</h3>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data.country, null, 2)}</pre>}
    </div>
  );
}

function FullInfo() {
  const { data, loading } = useQuery(GET_COUNTRY_FULL, {
    fetchPolicy: "network-only",
  });

  return (
    <div style={{ border: "1px solid green", padding: 16, margin: 8 }}>
      <h3>FullInfo (superset query)</h3>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data.country, null, 2)}</pre>}
    </div>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <h1>Parallel Queries: Subset vs Superset</h1>
      <p>
        Open the Network tab — you should see <strong>2 requests</strong> fired
        (one for each query). Apollo does NOT deduplicate queries with different
        operation names/shapes, even if one is a subset of the other.
      </p>
      <div style={{ display: "flex" }}>
        <BasicInfo />
        <FullInfo />
      </div>
    </ApolloProvider>
  );
}
