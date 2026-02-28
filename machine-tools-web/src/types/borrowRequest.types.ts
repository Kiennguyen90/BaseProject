export enum BorrowRequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Returned = 3,
  Overdue = 4,
}

export interface BorrowRequest {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  quantity: number;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowRequestStatus;
  purpose?: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  creationTime: string;
}

export interface CreateBorrowRequestDto {
  deviceId: string;
  quantity: number;
  expectedReturnDate: string;
  purpose?: string;
  notes?: string;
}

export interface ApproveBorrowRequestDto {
  notes?: string;
}

export interface RejectBorrowRequestDto {
  reason: string;
}

export interface BorrowRequestListFilter {
  deviceId?: string;
  employeeId?: string;
  status?: BorrowRequestStatus;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
