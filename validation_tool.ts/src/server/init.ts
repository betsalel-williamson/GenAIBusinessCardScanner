import { initDb } from "./db.js";

export async function initializeApplication() {
  // Data directories are expected to be mounted as volumes in the Docker environment.
  // No need to create them here.
  await initDb(); // Initialize the database
}
