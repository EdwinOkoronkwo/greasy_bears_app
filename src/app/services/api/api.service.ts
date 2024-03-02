import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: any, data?: any) {
    const body = new HttpParams({
      fromObject: data,
    });
    return this.http.get<any>(`${environment.serverBaseUrl}${url}`, {
      params: body,
    });
  }

  post<T>(url: any, data: any, formData = false) {
    if (formData) {
      data = new HttpParams({
        fromObject: data,
      });
    }

    return this.http.post<any>(`${environment.serverBaseUrl}${url}`, data);
  }

  patch<T>(url: any, data: any, formData = false) {
    if (formData) {
      data = new HttpParams({
        fromObject: data,
      });
    }
    return this.http.patch<any>(`${environment.serverBaseUrl}${url}`, data);
  }

  put<T>(url: any, data: any, formData = false) {
    if (formData) {
      data = new HttpParams({
        fromObject: data,
      });
    }
    return this.http.put<any>(`${environment.serverBaseUrl}${url}`, data);
  }

  delete<T>(url: any) {
    return this.http.delete<any>(`${environment.serverBaseUrl}${url}`);
  }
}

////////////////////////////////////////////////////////////////////////////
///////////////  OLD CODE ///////////////////////////////////////////////
// bannerImages = [
//   { banner: 'assets/imgs/1.jpg' },
//   { banner: 'assets/imgs/2.jpg' },
//   { banner: 'assets/imgs/3.jpg' },
// ];
