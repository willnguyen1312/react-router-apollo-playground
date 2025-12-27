import { useState } from "react";
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

  await sleep(3000);
  return {
    success: true,
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
      {
        path: "home",
        loader,
        action,
        Component: Home,
      },
      {
        path: "cool",
        loader: async () => {
          console.log("Cool loader called");
          return {
            data: {
              message: "This is a cool page!",
            },
          };
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
      <Outlet />
    </main>
  );
}

function Home() {
  const { data } = useLoaderData();
  const fetcher = useKeyFetcher(`item-1`);
  const [value, setValue] = useState(0);
  const fetchers = useFetchers();
  console.log(
    "fetchers ",
    fetchers.map((f) => ({
      key: f.key,
      data: f.json,
    })),
  );

  const isFavorite = fetcher.json
    ? (fetcher.json as any).id === 1 && (fetcher.json as any).isFavorite
    : data.list[0].isFavorite;

  console.log("Fetcher data", fetcher.data);

  if (fetcher.state === "idle" && fetcher.data) {
    console.log("calling another action");
    queueMicrotask(fetcher.reset);
  }

  return (
    <div>
      <h1>Home</h1>
      <button
        onClick={() => {
          setValue(value + 1);
        }}
      >
        Increment {value}
      </button>

      <div
        style={{
          marginBottom: 16,
        }}
      >
        <span>Edit item 1</span>
        <button
          onClick={async () => {
            // fetcher.load("/cool");
            await fetcher.submit(
              {
                intent: "toggle-favorite",
                id: 1,
                isFavorite: !isFavorite,
              },
              {
                method: "post",
                encType: "application/json",
              },
            );

            console.log("Submitted toggle favorite for item 1");
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

const useKeyFetcher = (key: string) => {
  const fetcher = useFetcher({ key });
  return fetcher;
};

const ItemRenderer = ({ item }: { item: any }) => {
  const fetcher = useKeyFetcher(`item-${item.id}`);
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
            },
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
