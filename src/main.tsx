import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
// import App from "./App2.tsx";
// import App from "./App3.tsx";
// import App from "./App4.tsx";
// import App from "./SubRouter.tsx";
import App from "./AppPromises.tsx";

import { worker } from "./mocks/browser";

// worker.start().then(() => {
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
// });
