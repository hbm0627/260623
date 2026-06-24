import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { databasePath } from "./config.js";

export function openDatabase() {
  return open({
    filename: databasePath,
    driver: sqlite3.Database,
  });
}
