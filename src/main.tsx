import ReactDOM from "react-dom/client";
import App from "./AppFetchPolicy.tsx";
import { worker } from "./mocks/browser.ts";

worker.start({ onUnhandledRequest: "bypass" }).then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
});
