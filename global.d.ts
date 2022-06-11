interface Cast {
  originatorUserId: number;
  bondId: number;
  side: "Buy" | "Sell";
  price: number | undefined;
  quantity: number | undefined;
  status: "Active" | "Canceled";
  targetUserIds: number[];
}
