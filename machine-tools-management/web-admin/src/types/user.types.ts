export interface UserListItem {
  id: string;
  userName: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  fullName?: string;
  employeeCode?: string;
  department?: string;
  roles: string[];
  creationTime: string;
  lastModificationTime?: string;
}

export interface CreateUserDto {
  userName: string;
  password: string;
  email?: string;
  phoneNumber: string;
  fullName: string;
  employeeCode?: string;
  department?: string;
  roleNames: string[];
}

export interface UpdateUserDto {
  email?: string;
  phoneNumber?: string;
  fullName?: string;
  employeeCode?: string;
  department?: string;
  isActive?: boolean;
}

export interface UserDetail extends UserListItem {
  avatarUrl?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface SetUserRolesDto {
  roleNames: string[];
}

export interface UserListFilter {
  filter?: string;
  isActive?: boolean;
  role?: string;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
}
