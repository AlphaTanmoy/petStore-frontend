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
  lastUpdated?: string;
  dataStatus?: string;
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
  canCustomerCareAccess: boolean;
  isVisibleToGuest: boolean;
  isAssignedToParentMenu: boolean;
  isAvailableWhileLoggedOut?: boolean;
  svgFileDataLink: string;
  parent?: NavbarItemResponse;
  listOfSubMenu?: NavbarItemResponse[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: boolean;
  statusCode: number;
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
  isVisibleToGuest?: boolean;
}

export interface AddNavbarRequest {
  menuName: string;
  canMasterAccess: boolean;
  doHaveRedirectionLink: boolean;
  menuLink: string | null;
  isASubMenu: boolean;
  parentId: string | null;
  canAdminAccess: boolean;
  canUserAccess: boolean;
  canDoctorAccess: boolean;
  canSellerAccess: boolean;
  canRiderAccess: boolean;
  canCustomerCareAccess: boolean;
  isVisibleToGuest: boolean;
  isAvailableWhileLoggedOut: boolean;
  svgFileDataLink: string | null;
}

export interface EditNavbarRequest {
  id: string;
  menuName?: string;
  doHaveRedirectionLink?: boolean;
  menuLink?: string | null;
  canAdminAccess?: boolean;
  canUserAccess?: boolean;
  canDoctorAccess?: boolean;
  canSellerAccess?: boolean;
  canRiderAccess?: boolean;
  canCustomerCareAccess?: boolean;
  isVisibleToGuest?: boolean;
  isAvailableWhileLoggedOut?: boolean;
  svgFileDataLink?: string | null;
}

export interface IsParentMenuResponse {
  isParent: boolean;
  hasChildren: boolean;
  parentMenu: boolean;
  subMenuEffectiveCount: number;
}
