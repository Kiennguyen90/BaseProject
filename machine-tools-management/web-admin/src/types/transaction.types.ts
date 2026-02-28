export enum TransactionType {
  Borrow = 0,
  Return = 1,
  MarkBroken = 2,
  Consume = 3,
  Maintenance = 4,
  Retire = 5,
}

export interface DeviceTransaction {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  employeeId: string;
  employeeName: string;
  borrowRequestId?: string;
  returnRequestId?: string;
  transactionType: TransactionType;
  quantity: number;
  transactionDate: string;
  notes?: string;
  performedBy: string;
  creationTime: string;
}

export interface TransactionFilter {
  filter?: string;
  deviceId?: string;
  employeeId?: string;
  transactionType?: TransactionType;
  fromDate?: string;
  toDate?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
