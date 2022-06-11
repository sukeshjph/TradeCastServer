import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clone from "clone";
import { createSession } from "better-sse";
import { randNumber } from "@ngneat/falso";

import { Cast, Status } from "./model";
import getDb, { getOtherDb } from "./db";

import { getSuccessResponse, getErrorResponse } from "./util";

import { randomCastChannel } from "./channels";

export async function app() {
  dotenv.config();

  const port = process.env.PORT;
  const app = express();
  app.use(cors());

  app.use(express.static("./public"));

  // SSE stream to send Price and Quantity updates of Published trading data
  app.get("/sse", async (req, res) => {
    const { targetUserId } = req.query;
    const convertedTargetId = targetUserId
      ? parseInt(targetUserId as string, 10)
      : randNumber({ min: 200, max: 3000 });

    const otherDb = getOtherDb();
    const targetIds = otherDb.getData("/targetUserIds");

    const doesIdExist = targetIds.findIndex((id) => id === convertedTargetId);

    if (doesIdExist === -1) {
      otherDb.push("/targetUserIds[]", convertedTargetId, true);
    }

    let session = await createSession(req, res);
    
    session.push("Joining StreamCasts");
    randomCastChannel.register(session);

    req.on("close", () => {
      // Remove connection targetUserid once the client stops listening
      console.log(`Client disconnected: ${targetUserId}`);
      const currentTargetIndex = otherDb
        .getData("/targetUserIds")
        .findIndex((id) => id === convertedTargetId);

      otherDb.delete("/targetUserIds[" + currentTargetIndex + "]");
    });
  });

  // Get the latest Cast
  app.get(
    "/sendCast/originatorUserId/:orgId/bondId/:bondId/side/:side",
    async (req, res) => {
      try {
        const { orgId, bondId, side } = req.params;
        const db = getDb();
        const allCasts: Cast[] = db.getData("/casts");

        const getLastCastIndex = allCasts.findIndex(
          (cast) =>
            cast.bondId === parseInt(bondId, 10) &&
            cast.originatorUserId === parseInt(orgId, 10) &&
            cast.side === side &&
            cast.status !== Status.CANCELLED

        );

        if (getLastCastIndex !== -1) {
          return res.send(
            getSuccessResponse("success", allCasts[getLastCastIndex], 200)
          );
        }

        return res.send(getSuccessResponse("success", null, 200));
      } catch (error) {
        return res.send(getErrorResponse("error", 404));
      }
    }
  );

  // Get the all active Casts for targetId
  app.get("/getActiveCasts/targetUserId/:targetUserId", async (req, res) => {
    try {
      const { targetUserId } = req.params;
      const db = getDb();
      const allCasts: Cast[] = db.getData("/casts");

      const onlyActiveCastsForTargetUser = allCasts.filter(
        (cst) =>
          cst.status === "Active" &&
          cst.targetUserIds.includes(parseInt(targetUserId, 10))
      );

      if (onlyActiveCastsForTargetUser.length !== 0) {
        return res.send(
          getSuccessResponse("success", onlyActiveCastsForTargetUser, 200)
        );
      }

      return res.send(getSuccessResponse("success", [], 200));
    } catch (error) {
      return res.send(error("error", 404));
    }
  });

  // Cancel an active cast
  app.post(
    "/cancelCast/originatorUserId/:orgId/bondId/:bondId/side/:side",
    async (req, res) => {
      try {
        const { orgId, bondId, side } = req.params;
        const db = getDb();
        const allCasts: Cast[] = db.getData("/casts");

        const getCastIndex = allCasts.findIndex(
          (cast) =>
            cast.bondId === parseInt(bondId, 10) &&
            cast.originatorUserId === parseInt(orgId, 10) &&
            cast.side === side
        );

        if (getCastIndex === -1) {
          return res.send(getSuccessResponse("success", "Cast Not found", 200));
        }

        if (allCasts[getCastIndex].status === Status.CANCELLED) {
          return res.send(
            getSuccessResponse("success", "Cast is Already cancelled", 200)
          );
        }

        const castToInsert = clone(allCasts[getCastIndex]); // Deep clone before db deletes the record

        db.delete("/casts[" + getCastIndex + "]");
        db.push(
          `/casts[]`,
          {
            ...castToInsert,
            status: Status.CANCELLED,
          },
          true
        );

        return res.send(getSuccessResponse("success", "Cancelled", 200));
      } catch (error) {
        return res.send(getErrorResponse("error", 404));
      }
    }
  );

  await app.listen(port);
  console.log(`Listening on port ${port}`);
}
