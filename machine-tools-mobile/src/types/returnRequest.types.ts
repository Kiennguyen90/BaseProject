export enum ReturnRequestStatus {
  Pending = 0,
  Confirmed = 1,
  Rejected = 2,
  ConfirmedBroken = 3,
}

export interface ReturnRequest {
  id: string;
  borrowRequestId: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  employeeId: string;
  employeeName: string;
  quantity: number;
  returnDate: string;
  status: ReturnRequestStatus;
  condition?: string;
  isBroken: boolean;
  brokenDescription?: string;
  confirmedBy?: string;
  confirmedDate?: string;
  rejectionReason?: string;
  notes?: string;
  creationTime: string;
}

export interface CreateReturnRequestDto {
  borrowRequestId: string;
  quantity: number;
  condition?: string;
  isBroken: boolean;
  brokenDescription?: string;
  notes?: string;
}

export interface ConfirmReturnDto {
  deviceCondition: string;
  note?: string;
}

export interface RejectReturnDto {
  reason: string;
}
