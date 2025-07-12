import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UPLOAD_SVG_IMAGE } from '../../constants/api-endpoints';

export interface SvgUploadResponse {
  message: string;
  status: boolean;
  data: string;
}

@Injectable({
  providedIn: 'root'
})
export class S3SvgService {
  private readonly UPLOAD_SVG_ENDPOINT = UPLOAD_SVG_IMAGE;

  constructor(private http: HttpClient) {}

  uploadSvg(file: File): Observable<SvgUploadResponse> {
    const formData = new FormData();
    formData.append('svgFile', file);
    const userRole = sessionStorage.getItem('userRole');
    if (userRole) {
      formData.append('userRole', userRole);
    } else {
      console.error('User role not found in sessionStorage');
      throw new Error('User role not found');
    }

    return this.http.post<SvgUploadResponse>(
      this.UPLOAD_SVG_ENDPOINT,
      formData
    );
  }
}