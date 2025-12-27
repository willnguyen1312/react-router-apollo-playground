import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useFetcher,
} from "react-router-dom";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "lazy-data",
        loader: async ({ request }) => {
          await sleep(2000);
          const url = new URL(request.url);
          const name = url.searchParams.get("query");
          return { data: `Hello, ${name}!` };
        },
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

function Root() {
  return (
    <main>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </main>
  );
}

const useEmployeesData = ({ ids }: { ids: string[] }) => {
  const fetcher = useFetcher({
    key: ids.join(","),
  });
  const getEmployees = async () => {
    fetcher.load(`lazy-data?query=${ids.join(",")}`);
  };

  return {
    getEmployees,
    data: fetcher.data?.data,
    loading: fetcher.state === "loading",
  };
};

function Home() {
  const { getEmployees, loading, data } = useEmployeesData({ ids: ["share"] });

  return (
    <>
      {loading && <p>Loading...</p>}
      {!loading && data && <p>[Home Component] Message: {data}</p>}

      <button
        onClick={() => {
          getEmployees();
        }}
      >
        Fetch total employees from Home Component
      </button>

      <ChildComponent />

      <StandAloneComponent />
    </>
  );
}

const StandAloneComponent = () => {
  const fetcher = useFetcher();
  const isLoading = fetcher.state === "loading";

  return (
    <div>
      <h4>Form Component</h4>
      <fetcher.Form action="lazy-data">
        <input name="query" />
        {isLoading && <p>Loading...</p>}
        {fetcher.data?.data && !isLoading && (
          <p>[StandAlone Component] Message: {fetcher.data.data}</p>
        )}
      </fetcher.Form>
    </div>
  );
};

function ChildComponent() {
  const { getEmployees, loading, data } = useEmployeesData({
    ids: ["share"],
  });

  return (
    <div>
      <button
        onClick={() => {
          getEmployees();
        }}
      >
        Fetch total employees from Child Component
      </button>

      {loading && <p>Loading...</p>}
      {!loading && data && <p>[Child Component] Message: {data}</p>}
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
