export interface ApiResponse<T = any> {
  /** Response message */
  message?: string;
  
  /** Status of the API response */
  status: boolean;
  
  /** Response data of type T */
  data?: T;
}

export const DEFAULT_API_RESPONSE: ApiResponse<any> = {
  message: '',
  status: false,
  data: null
};
