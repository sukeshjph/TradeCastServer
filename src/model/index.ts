export enum Status {
  ACTIVE = "Active",
  CANCELLED = "Cancelled",
}

export interface Cast {
  originatorUserId: number;
  bondId: number;
  side: "Buy" | "Sell";
  price: number | undefined;
  quantity: number | undefined;
  status: Status;
  targetUserIds: number[];
}
