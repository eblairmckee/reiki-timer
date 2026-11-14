import "../../../src/app/styles/global.css";
import { createRoot } from "react-dom/client";
import { ArtworkReview } from "./artwork-review";

const root = document.querySelector("#root");
if (root) {
  createRoot(root).render(<ArtworkReview />);
}
