import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_ALL_CUSTOMERS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class CustomerViewService {
  private baseUrl = GET_ALL_CUSTOMERS;

  constructor(private http: HttpClient) {}

  getCustomers(offsetToken?: string): Observable<any> {
    let params = new HttpParams();
    if (offsetToken) {
      params = params.set('offsetToken', offsetToken);
    }

    return this.http.get(this.baseUrl, { params });
  }
}
