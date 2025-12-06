import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useLoaderData,
  ActionFunction,
  useFetcher,
  useFetchers,
} from "react-router-dom";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const db = {
  list: [
    { id: 1, name: "Item 1", isFavorite: false },
    { id: 2, name: "Item 2", isFavorite: false },
  ],
};

const loader = async () => {
  console.log("Loader called");
  return {
    data: {
      list: db.list,
    },
  };
};

const action: ActionFunction = async ({ request }) => {
  const formData = await request.json();
  db.list = db.list.map((item) => {
    if (item.id === formData.id) {
      return { ...item, isFavorite: !item.isFavorite };
    }
    return item;
  });

  await sleep(1000);
  return {
    data: {
      list: db.list,
    },
  };
};

const router = createBrowserRouter([
  {
    path: "/",

    id: "root",
    Component: Root,
    children: [
      {
        index: true,
        loader,
        action,
        Component: Home,
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
      <Outlet />
    </main>
  );
}

function Home() {
  const { data } = useLoaderData();
  const fetcher = useFetcher({ key: "item-1" });
  // const fetchers = useFetchers();

  const isFavorite = fetcher.json
    ? (fetcher.json as any).id === 1 && (fetcher.json as any).isFavorite
    : data.list[0].isFavorite;

  // console.log("Fetchers:", fetchers);

  return (
    <div>
      <h1>Home</h1>

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <span>Edit item 1</span>
        <button
          onClick={() => {
            fetcher.submit(
              {
                intent: "toggle-favorite",
                id: 1,
                isFavorite: !isFavorite,
              },
              {
                method: "post",
                encType: "application/json",
              }
            );
          }}
        >
          {isFavorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {data.list.map((item: any) => (
          <ItemRenderer key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

const ItemRenderer = ({ item }: { item: any }) => {
  const fetcher = useFetcher({ key: `item-${item.id}` });
  const isFavorite = fetcher.json
    ? (fetcher.json as any).id === item.id && (fetcher.json as any).isFavorite
    : item.isFavorite;

  return (
    <div key={item.id}>
      <span>{item.name}</span>
      <button
        onClick={() => {
          fetcher.submit(
            {
              intent: "toggle-favorite",
              id: item.id,
              isFavorite: !isFavorite,
            },
            {
              method: "post",
              encType: "application/json",
            }
          );
        }}
      >
        {isFavorite ? "Unfavorite" : "Favorite"}
      </button>
    </div>
  );
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
