import { useCallback, useEffect, useState } from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  gql,
  useQuery,
  type NormalizedCacheObject,
} from "@apollo/client";
import { CachePersistor, LocalStorageWrapper } from "apollo3-cache-persist";

const CACHE_KEY = "apollo-cache-persist";

const GET_EPISODES = gql`
  query GetEpisodes {
    episodes {
      results {
        id
        name
        episode
        air_date
      }
    }
  }
`;

type Episode = {
  id: string;
  name: string;
  episode: string;
  air_date: string;
};

type EpisodesQuery = {
  episodes: {
    results: Episode[];
  };
};

function EpisodeList() {
  const { data, loading, error } = useQuery<EpisodesQuery>(GET_EPISODES);

  if (!data) {
    if (loading) return <p>Loading initial data from the network…</p>;
    if (error)
      return <p style={{ color: "crimson" }}>Error: {error.message}</p>;
    return <p>No data.</p>;
  }

  const episodes = data.episodes.results;

  return (
    <div>
      {loading && <p style={{ color: "#888" }}>Refreshing from network…</p>}
      <ol style={{ lineHeight: 1.6 }}>
        {episodes.map((episode) => (
          <li key={episode.id}>
            <strong>{episode.episode}</strong> — {episode.name}{" "}
            <small style={{ color: "#888" }}>({episode.air_date})</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function App() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();
  const [persistor, setPersistor] =
    useState<CachePersistor<NormalizedCacheObject>>();
  const [cacheSize, setCacheSize] = useState<number | null>(null);

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
      setCacheSize(await newPersistor.getSize());

      setClient(
        new ApolloClient({
          uri: "https://rickandmortyapi.com/graphql",
          cache,
        }),
      );
    }

    init().catch(console.error);
  }, []);

  const refreshSize = useCallback(async () => {
    if (!persistor) return;
    setCacheSize(await persistor.getSize());
  }, [persistor]);

  const clearCache = useCallback(async () => {
    if (!persistor) return;
    await persistor.purge();
    setCacheSize(await persistor.getSize());
  }, [persistor]);

  const reload = useCallback(() => window.location.reload(), []);

  if (!client) {
    return <p>Initialising Apollo + cache-persist…</p>;
  }

  return (
    <ApolloProvider client={client}>
      <div
        style={{ maxWidth: 720, margin: "24px auto", fontFamily: "sans-serif" }}
      >
        <h1>apollo3-cache-persist</h1>
        <p>
          The Apollo <code>InMemoryCache</code> is mirrored into{" "}
          <code>localStorage</code> under the key <code>{CACHE_KEY}</code> on
          every write (<code>trigger: "write"</code>). On boot we{" "}
          <code>restore()</code> it before creating the client, so a reload
          paints cached episodes instantly and only shows{" "}
          <em>“Refreshing from network…”</em> while Apollo revalidates (
          <code>fetchPolicy: "cache-and-network"</code>).
        </p>
        <p>
          Try it: load once, then hit <strong>Reload page</strong> — the list is
          there immediately. Hit <strong>Clear cache</strong> then reload to see{" "}
          <em>“Loading initial data…”</em> again. Cached bytes live under{" "}
          <i>DevTools → Application → Local Storage</i>;{" "}
          <code>debug: true</code> also logs persistence activity to the
          console.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            margin: "16px 0",
          }}
        >
          <button onClick={reload}>Reload page</button>
          <button onClick={clearCache}>Clear cache</button>
          <button onClick={refreshSize}>Refresh size</button>
          <span style={{ color: "#888" }}>
            Persisted cache size: {cacheSize ?? "—"} bytes
          </span>
        </div>

        <EpisodeList />
      </div>
    </ApolloProvider>
  );
}
