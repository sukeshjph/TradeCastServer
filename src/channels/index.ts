import { createChannel } from "better-sse";

import { Cast } from "../model";
import { getACastUntilValid } from "../util";
import getDB from "../db";

const randomCastChannel = createChannel();

const db = getDB();
const allCasts: Cast[] = db.getData("/casts");

setInterval(() => {
  const { castIndex, ...cast } = getACastUntilValid(allCasts);

  if (castIndex === -1) {
    db.push("/casts[]", cast, true);
  } else {
    db.delete("/casts[" + castIndex + "]");
    db.push("/casts[]", cast, true);
  }

  randomCastChannel.broadcast(cast, "streamCasts");
}, 1000);

export { randomCastChannel };
