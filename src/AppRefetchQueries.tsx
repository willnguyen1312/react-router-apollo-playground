import { useEffect, useRef, useState } from "react";
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

// Third query — fetched via client.watchQuery() + subscribe (no useQuery).
// Parameterised so we can spawn multiple ObservableQueries with different variables.
const GET_CONTINENT = gql`
  query GetContinent($code: ID!) {
    continent(code: $code) {
      name
      countries {
        name
      }
    }
  }
`;

const CONTINENT_CODES = ["NA", "EU", "AS"] as const;
type ContinentCode = (typeof CONTINENT_CODES)[number];

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
  const [results, setResults] = useState<Record<string, any>>({});
  // One subscription per continent code — each is its own ObservableQuery.
  const subscriptionsRef = useRef<Map<string, { unsubscribe: () => void }>>(
    new Map(),
  );

  // External-system cleanup: tear down all Apollo subscriptions on unmount.
  useEffect(() => {
    const subs = subscriptionsRef.current;
    return () => {
      subs.forEach((sub) => sub.unsubscribe());
      subs.clear();
    };
  }, []);

  const handleLogLatest = () => {
    // Apollo's internal query IDs (the Map keys) are monotonically increasing
    // numeric strings, so the highest ID = most recently created ObservableQuery.
    const entries = Array.from(
      apolloClient.getObservableQueries().entries(),
    ).filter(([, q]) => q.queryName === "GetContinent");
    console.log(entries);

    const latest = entries.sort(([a], [b]) => Number(b) - Number(a))[0];

    if (!latest) {
      console.log("No active GetContinent watchQuery yet.");
      return;
    }

    const [latestId, latestQuery] = latest;
    console.log("Latest GetContinent:", {
      id: latestId,
      variables: latestQuery.variables,
      currentResult: latestQuery.getCurrentResult(),
    });
  };

  const handleFetch = (code: ContinentCode) => {
    // Drop the previous subscription for this code before starting a new one.
    subscriptionsRef.current.get(code)?.unsubscribe();

    // Each (query, variables) pair becomes its OWN ObservableQuery, all sharing
    // the same operation name ("GetContinent"). They all show up in
    // getObservableQueries() with hasObservers() === true, so refetchQueries
    // will refetch every one of them with its own variables.
    const observable = apolloClient.watchQuery({
      query: GET_CONTINENT,
      variables: { code },
      fetchPolicy: "network-only",
    });

    const subscription = observable.subscribe({
      next: (result) => {
        setResults((prev) => ({ ...prev, [code]: result.data }));
      },
    });

    subscriptionsRef.current.set(code, subscription);
  };

  return (
    <div style={{ border: "1px solid orange", padding: 16, margin: 8 }}>
      <h3>ManualInfo (GetContinent — watchQuery, multi-variables)</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {CONTINENT_CODES.map((code) => (
          <button key={code} onClick={() => handleFetch(code)}>
            Fetch {code}
          </button>
        ))}
        <button onClick={handleLogLatest}>Log latest GetContinent</button>
      </div>
      {CONTINENT_CODES.map((code) => {
        const data = results[code];
        if (!data) return null;
        return (
          <div key={code} style={{ marginTop: 8 }}>
            <strong>{code}:</strong>
            <pre>{JSON.stringify(data.continent, null, 2)}</pre>
          </div>
        );
      })}
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

    console.log(allObservableQueries.length);

    // Dedupe — multiple ObservableQueries can share an operation name
    // (e.g. several watchQuery calls of GetContinent with different variables).
    // refetchQueries by name will refetch ALL active instances of that name,
    // each with its own variables, so one entry per name is enough.
    const include = [
      ...new Set(
        allActiveQueries
          .map((query) => query.queryName)
          .filter((name): name is string => Boolean(name)),
      ),
    ];

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
