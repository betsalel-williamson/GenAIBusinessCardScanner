import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

class ServerConfig {
  private static instance: ServerConfig;

  public readonly DB_PATH: string;
  public readonly JSON_DATA_SOURCE_MOUNT_PATH: string;
  public readonly CARDS_TO_PROCESS_MOUNT_PATH: string;
  public readonly JSON_DATA_PROCESSED_MOUNT_PATH: string;
  public readonly PUBLIC_MOUNT_PATH: string;
  public readonly PORT: number;
  public readonly NODE_ENV: string;

  private constructor() {
    this.NODE_ENV = process.env.NODE_ENV as string;
    const envFile = `.env.${this.NODE_ENV}`;

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    const envPath = path.resolve(__dirname, "..", "..", envFile);
    dotenv.config({ path: envPath });

    // Assign values from process.env or provide defaults
    this.DB_PATH = process.env.DB_PATH || "./app_data.db";
    this.JSON_DATA_SOURCE_MOUNT_PATH =
      process.env.JSON_DATA_SOURCE_MOUNT_PATH || "../examples/json_data_source";
    this.CARDS_TO_PROCESS_MOUNT_PATH =
      process.env.CARDS_TO_PROCESS_MOUNT_PATH ||
      "../examples/image_data_source";
    this.JSON_DATA_PROCESSED_MOUNT_PATH =
      process.env.JSON_DATA_PROCESSED_MOUNT_PATH ||
      "../examples/json_data_processed";
    this.PUBLIC_MOUNT_PATH = process.env.PUBLIC_MOUNT_PATH || "./public";
    this.PORT = Number(process.env.PORT) || 7456;
  }

  public static getInstance(): ServerConfig {
    if (!ServerConfig.instance) {
      ServerConfig.instance = new ServerConfig();
    }
    return ServerConfig.instance;
  }
}

export const config = ServerConfig.getInstance();
