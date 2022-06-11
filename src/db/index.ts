import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

export const getOtherDb = () =>
  new JsonDB(new Config("src/db/otherDb", true, false, "/"));

export default () => new JsonDB(new Config("src/db/castDb", true, false, "/"));
