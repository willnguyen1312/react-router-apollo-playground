/// <reference types="vite/client" />
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link,
  useParams,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "store",
        Component: StoreLayout,
        children: [
          {
            index: true,
            Component: StoreList,
          },
          {
            path: ":id",
            Component: StoreDetail,
          },
          {
            path: ":id/edit",
            Component: StoreEdit,
          },
        ],
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
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "1rem",
            padding: 0,
          }}
        >
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/store">Stores</Link>
          </li>
        </ul>
      </nav>

      <div style={{ padding: "1rem" }}>
        <Outlet />
      </div>
    </main>
  );
}

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the store management system!</p>
      <Link to="/store">Browse Stores →</Link>
    </div>
  );
}

function StoreLayout() {
  return (
    <div>
      <h2>Store Section</h2>
      <Outlet />
    </div>
  );
}

function StoreList() {
  // Mock store data
  const stores = [
    { id: 1, name: "Downtown Store" },
    { id: 2, name: "Mall Store" },
    { id: 3, name: "Airport Store" },
  ];

  return (
    <div>
      <h3>Store List</h3>
      <ul>
        {stores.map((store) => (
          <li key={store.id}>
            <Link to={`/store/${store.id}`}>{store.name}</Link>
            {" | "}
            <Link to={`/store/${store.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoreDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h3>Store Details</h3>
      <p>Viewing store with ID: {id}</p>
      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <Link to="/store">← Back to Store List</Link>
        <Link to={`/store/${id}/edit`}>Edit This Store</Link>
      </div>
    </div>
  );
}

function StoreEdit() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h3>Edit Store</h3>
      <p>Editing store with ID: {id}</p>
      <form style={{ marginTop: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Store Name: <input type="text" placeholder={`Store ${id}`} />
          </label>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit">Save</button>
          <Link to={`/store/${id}`}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
