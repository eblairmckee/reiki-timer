import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./router";
import "./index.css";

const root = document.querySelector("#root");
if (!root) {
  throw new Error("The application root is missing.");
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
