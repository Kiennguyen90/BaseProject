export enum DeviceType {
  BorrowReturn = 0,
  Consumable = 1,
}

export enum DeviceStatus {
  Available = 0,
  Borrowed = 1,
  Broken = 2,
  UnderMaintenance = 3,
  Retired = 4,
}

export interface DeviceCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  deviceCount: number;
}

export interface Device {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  code: string;
  description?: string;
  deviceType: DeviceType;
  totalQuantity: number;
  availableQuantity: number;
  status: DeviceStatus;
  location?: string;
  serialNumber?: string;
  imageUrl?: string;
  notes?: string;
  creationTime: string;
}

export interface DeviceListFilter {
  filter?: string;
  categoryId?: string;
  deviceType?: DeviceType;
  status?: DeviceStatus;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
