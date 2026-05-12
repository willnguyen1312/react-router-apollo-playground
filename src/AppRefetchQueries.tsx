import { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  useApolloClient,
} from "@apollo/client";

const client = new ApolloClient({
  uri: "https://countries.trevorblades.com/graphql",
  cache: new InMemoryCache(),
});

const GET_COUNTRY_BASIC = gql`
  query GetCountryBasic {
    country(code: "CA") {
      name
      capital
    }
  }
`;

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

// Third query — fetched imperatively via client.query(), NOT via useQuery.
const GET_CONTINENT = gql`
  query GetContinent {
    continent(code: "NA") {
      name
      countries {
        name
      }
    }
  }
`;

function BasicInfo() {
  const { data, loading } = useQuery(GET_COUNTRY_BASIC);

  return (
    <div style={{ border: "1px solid blue", padding: 16, margin: 8 }}>
      <h3>BasicInfo (GetCountryBasic)</h3>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data.country, null, 2)}</pre>}
    </div>
  );
}

function FullInfo() {
  const { data, loading } = useQuery(GET_COUNTRY_FULL);

  return (
    <div style={{ border: "1px solid green", padding: 16, margin: 8 }}>
      <h3>FullInfo (GetCountryFull)</h3>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data.country, null, 2)}</pre>}
    </div>
  );
}

function ManualInfo() {
  const apolloClient = useApolloClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    // Imperative fetch — no useQuery, no React subscription.
    const result = await apolloClient.query({
      query: GET_CONTINENT,
      fetchPolicy: "network-only",
    });
    setData(result.data);
    setLoading(false);
  };

  return (
    <div style={{ border: "1px solid orange", padding: 16, margin: 8 }}>
      <h3>ManualInfo (GetContinent — imperative)</h3>
      <button onClick={handleFetch}>Fetch via client.query()</button>
      {loading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data.continent, null, 2)}</pre>}
    </div>
  );
}

function RefetchButton() {
  const apolloClient = useApolloClient();

  const handleRefetch = async () => {
    const allObservableQueries = Array.from(
      apolloClient.getObservableQueries().values(),
    );

    console.log(
      "All observable queries:",
      allObservableQueries.map((q) => ({
        name: q.queryName,
        hasObservers: q.hasObservers(),
      })),
    );

    const allActiveQueries = allObservableQueries.filter((query) =>
      query.hasObservers(),
    );

    const include = allActiveQueries
      .map((query) => query.queryName)
      .filter((name): name is string => Boolean(name));

    console.log("Include list passed to refetchQueries:", include);

    const results = await apolloClient.refetchQueries({ include });
    console.log("Refetched:", results);
  };

  return (
    <button onClick={handleRefetch} style={{ padding: "8px 16px" }}>
      Refetch both queries
    </button>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <h1>Refetch multiple queries via ApolloClient</h1>
      <p>
        Click the button — open the Network tab and you should see{" "}
        <strong>2 requests</strong> fired (one for each query). Both queries are
        refetched in parallel via <code>client.refetchQueries</code>.
      </p>
      <RefetchButton />
      <div style={{ display: "flex" }}>
        <BasicInfo />
        <FullInfo />
        <ManualInfo />
      </div>
    </ApolloProvider>
  );
}
