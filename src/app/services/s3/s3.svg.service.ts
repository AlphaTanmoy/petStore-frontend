import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UPLOAD_SVG_IMAGE, DELETE_SVG_IMAGE } from '../../constants/api-endpoints';

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

  deleteSvg(link: string): Observable<{status: boolean, message: string}> {
    const userRole = sessionStorage.getItem('userRole');
    if (!userRole) {
      throw new Error('User role not found');
    }

    const requestBody = {
      userRole: userRole,
      link: link
    };

    // Get token from sessionStorage
    const token = sessionStorage.getItem('jwt');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    return this.http.post<{status: boolean, message: string}>(
      DELETE_SVG_IMAGE, 
      requestBody
    );
  }

  uploadSvg(file: File): Observable<SvgUploadResponse> {
    const formData = new FormData();
    formData.append('svgFile', file);
    const userRole = sessionStorage.getItem('userRole');
    if (userRole) {
      formData.append('userRole', userRole);
    } else {
      throw new Error('User role not found');
    }

    return this.http.post<SvgUploadResponse>(
      this.UPLOAD_SVG_ENDPOINT,
      formData
    );
  }
}