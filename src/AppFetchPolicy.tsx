import { useEffect, useState, type ChangeEvent } from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  NetworkStatus,
  gql,
  useQuery,
  type NormalizedCacheObject,
  type WatchQueryFetchPolicy,
} from "@apollo/client";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

const CACHE_KEY = "apollo-fetch-policy";

const RANDOM_NUMBER = gql`
  query RandomNumber {
    randomNumber
  }
`;

type RandomNumberQuery = {
  randomNumber: number;
};

const FETCH_POLICIES: WatchQueryFetchPolicy[] = [
  "cache-first",
  "cache-and-network",
  "network-only",
  "no-cache",
  "cache-only",
];

function RandomNumberView({
  fetchPolicy,
}: {
  fetchPolicy: WatchQueryFetchPolicy;
}) {
  const { data, loading, error, networkStatus, refetch } =
    useQuery<RandomNumberQuery>(RANDOM_NUMBER, {
      fetchPolicy,
      notifyOnNetworkStatusChange: true,
    });

  const statusLabel = `${networkStatus} (${NetworkStatus[networkStatus]})`;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 24,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 56, fontVariantNumeric: "tabular-nums" }}>
        {data ? data.randomNumber : "—"}
      </div>
      <p style={{ color: "#888", margin: "8px 0" }}>
        {loading ? "Fetching from network…" : "Idle"} · networkStatus:{" "}
        <code>{statusLabel}</code>
      </p>
      {error && <p style={{ color: "crimson" }}>Error: {error.message}</p>}
      <button onClick={() => refetch()}>Refetch (force network)</button>
    </div>
  );
}

export default function App() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();
  const [persistor, setPersistor] =
    useState<CachePersistor<NormalizedCacheObject>>();
  const [fetchPolicy, setFetchPolicy] =
    useState<WatchQueryFetchPolicy>("cache-and-network");
  const [mountKey, setMountKey] = useState(0);

  useEffect(() => {
    async function init() {
      const cache = new InMemoryCache();
      const newPersistor = new CachePersistor({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        key: CACHE_KEY,
        trigger: "write",
        debug: true,
      });

      await newPersistor.restore();
      setPersistor(newPersistor);

      setClient(new ApolloClient({ uri: "/graphql", cache }));
    }

    init().catch(console.error);
  }, []);

  const remount = () => setMountKey((key) => key + 1);

  const handlePolicyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPolicy = FETCH_POLICIES.find(
      (policy) => policy === event.target.value,
    );
    if (nextPolicy) setFetchPolicy(nextPolicy);
  };

  const clearCache = async () => {
    if (!client || !persistor) return;
    await client.clearStore();
    await persistor.purge();
    remount();
  };

  if (!client) {
    console.log("Initializing Apollo + cache-persist…");
    return <p>Initialising Apollo + cache-persist…</p>;
  }

  return (
    <ApolloProvider client={client}>
      <div
        style={{ maxWidth: 720, margin: "24px auto", fontFamily: "sans-serif" }}
      >
        <h1>Fetch policy playground</h1>
        <p>
          The <code>RandomNumber</code> query is mocked by MSW and returns a{" "}
          <strong>new random value on every network request</strong> (after a
          1&nbsp;second delay). The number is your signal: if it{" "}
          <em>changes</em>, Apollo hit the network; if it{" "}
          <em>stays the same</em>, Apollo served it from the cache.
        </p>
        <p>
          The cache is persisted to <code>localStorage</code> (
          <code>apollo3-cache-persist</code>), and the persisted cache is{" "}
          <code>restore()</code>d <strong>before</strong> the{" "}
          <code>ApolloClient</code> is created. So on <strong>reload</strong>,{" "}
          <code>cache-first</code> finds the value already in the cache and
          skips the network entirely — no 1&nbsp;second wait. Meanwhile{" "}
          <code>network-only</code> still burns the full 1&nbsp;second every
          reload.
        </p>
        <p>
          Try it: load once (1&nbsp;s), then reload — <code>cache-first</code>{" "}
          paints instantly. <strong>Remount query</strong> simulates navigating
          away and back within the session; <strong>Clear cache</strong> wipes
          both the in-memory cache and the persisted copy, so the next{" "}
          <code>cache-first</code> load fetches fresh.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            margin: "16px 0",
            flexWrap: "wrap",
          }}
        >
          <label>
            fetchPolicy:{" "}
            <select value={fetchPolicy} onChange={handlePolicyChange}>
              {FETCH_POLICIES.map((policy) => (
                <option key={policy} value={policy}>
                  {policy}
                </option>
              ))}
            </select>
          </label>
          <button onClick={remount}>Remount query</button>
          <button onClick={clearCache}>Clear cache</button>
        </div>

        <RandomNumberView
          key={`${fetchPolicy}-${mountKey}`}
          fetchPolicy={fetchPolicy}
        />
      </div>
    </ApolloProvider>
  );
}
