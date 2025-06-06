import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    // private authService : AuthService
  ) { }

    httpJson() {

    const token = localStorage.getItem('token'); // Replace with your token logic

    const httpJsonOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      }),
    };

    return httpJsonOptions;
  }

    uploadBase64ImageToServer(base64: string, fileName: string, projectId?: number) {
    const base64Body = base64.split(',')[1]; // ลบ prefix `data:image/...;base64,`

    const payload = {
      projectId: projectId ?? null,
      imageJsonstring: base64,
      imageName: fileName,
      fileSizeBytes: Math.round((base64Body.length * 3) / 4), // ประมาณขนาดไฟล์
    };

    return this.http.post(environment.apiUrl+"AutoUploadImage/upload", payload);
  }

  
}
