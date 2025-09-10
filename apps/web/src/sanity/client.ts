import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "mw7e9in4",
  dataset: "production",
  apiVersion: "2025-07-09",
  useCdn: false,
});
