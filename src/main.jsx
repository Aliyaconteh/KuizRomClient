import ReactDOM from "react-dom/client";
import App from "./app/App";
import Providers from "./app/providers";
import "./app/styles/App.css";

import { registerSW } from "virtual:pwa-register";

registerSW();


ReactDOM.createRoot(document.getElementById("root")).render(
  <Providers>
    <App />
  </Providers>

);
