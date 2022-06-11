import { Cast, Status } from "../model";
import { randNumber } from "@ngneat/falso";
import { getOtherDb } from "../db";

export const getSuccessResponse = (message, result, statusCode) => {
  return {
    message,
    error: false,
    code: statusCode,
    result,
  };
};

export const getErrorResponse = (message, statusCode) => {
  const codes = [200, 201, 400, 401, 404, 403, 422, 500];

  const findCode = codes.find((code) => code == statusCode);

  if (!findCode) statusCode = 500;
  else statusCode = findCode;

  return {
    message,
    code: statusCode,
    error: true,
  };
};

// Generate a random cast, In ideal world Traders will publish realtime updates via Kafka topics/ AWS SNS/SQS or RabbitMq
export const getRandomGeneratedCast = (): Cast => {
  const db = getOtherDb();

  const originatorTradersList = db.getData("/originators");
  const bondIdsList = db.getData("/bondIds");
  const sideList = db.getData("/sides");
  const targetIds = db.getData("/targetUserIds");

  let initialCast = {
    originatorUserId: 102,
    bondId: 1,
    side: "Buy",
    price: undefined,
    quantity: undefined,
    status: Status.ACTIVE,
    targetUserIds: [...targetIds],
  };

  const originatorUserId =
    Math.random() > 0.5 ? originatorTradersList[0] : originatorTradersList[1];
  const bondId = Math.random() < 0.5 ? bondIdsList[0] : bondIdsList[1];
  const side = Math.random() < 0.5 ? sideList[0] : sideList[1];
  const price = randNumber({ min: 200, max: 3000 });
  const quantity = randNumber({ min: 1, max: 200 });

  return {
    ...initialCast,
    originatorUserId,
    bondId,
    side,
    price,
    quantity,
  };
};

type CastWithIndex = Cast & { castIndex: number };

export const getACastUntilValid = (allCasts: Cast[]): CastWithIndex => {
  let validCast = false;
  let randomCast: Cast;
  let castIndex = -1;

  while (!validCast) {
    randomCast = getRandomGeneratedCast();

    const { originatorUserId, bondId, side } = randomCast;

    const existingCastIndex = allCasts.findIndex(
      (cst) =>
        cst.bondId === bondId &&
        cst.originatorUserId === originatorUserId &&
        cst.side === side
    );

    if (existingCastIndex === -1) {
      validCast = true;
      break;
    }

    if (allCasts[existingCastIndex].status === Status.CANCELLED) {
      continue;
    } else {
      validCast = true;
      castIndex = existingCastIndex;
    }
  }

  return {
    ...randomCast,
    castIndex,
  };
};
