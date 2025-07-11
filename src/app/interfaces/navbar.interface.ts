export interface FilterOption {
  key: string;
  value: string;
  id: string;
}

export interface PaginationResponse<T> {
  data: T[];
  offsetToken?: string;
  recordCount?: number;
  filterUsed?: FilterOption[];
}

export interface NavbarItemResponse {
  id: string;
  createdDate: string;
  menuName: string;
  doHaveRedirectionLink: boolean;
  menuLink: string | null;
  isASubMenu: boolean;
  canMasterAccess: boolean;
  canAdminAccess: boolean;
  canUserAccess: boolean;
  canDoctorAccess: boolean;
  canSellerAccess: boolean;
  canRiderAccess: boolean;
  customerCareAccess: boolean;
  isVisibleToGuest: boolean;
  isAssignedToParentMenu: boolean;
  svgFileDataLink: string;
}

export interface NavbarListRequest {
  queryString?: string;
  giveCount?: boolean;
  giveData?: boolean;
  fromDate?: string;
  toDate?: string;
  dateRangeType?: string;
  considerMaxDateRange?: boolean;
  limit?: number;
  offsetToken?: string;
  showInActive?: boolean;
  applyParentSubMenuFilter?: boolean;
  showSubMenusOnly?: boolean;
  listOfRolesCanAccess?: string[];
}
