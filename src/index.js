import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import {
  GoogleOAuthProvider,
} from "@react-oauth/google";

const root =
  ReactDOM.createRoot(
    document.getElementById("root")
  );

root.render(
  <GoogleOAuthProvider
    clientId="434368439082-2ksrrt2931jhg14qbd3he68c5l1qhsuo.apps.googleusercontent.com"
  >
    <App />
  </GoogleOAuthProvider>
);