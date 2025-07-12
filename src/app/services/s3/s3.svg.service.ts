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

  uploadSvg(file: File, userRole: string): Observable<SvgUploadResponse> {
    const formData = new FormData();
    formData.append('svgFile', file);
    formData.append('userRole', userRole);

    return this.http.post<SvgUploadResponse>(
      this.UPLOAD_SVG_ENDPOINT,
      formData
    );
  }
}