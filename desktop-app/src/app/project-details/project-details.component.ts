import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { concatMap, from, retry, tap } from 'rxjs';

declare global {
  interface Window {
    electronAPI: {
      openFolderDialog: () => Promise<string | null>;
      watchFolder: (folderPath: string) => Promise<void>;
      onNewFileDetected: (callback: (filePath: string) => void) => void;
      readImagesInFolder: (folderPath: string) => Promise<string[]>;
      readFileAsBase64: (filePath: string) => Promise<string | null>;
    };
  }
}
@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent {
  projectId: number = 0;
  projectImages: string[] = [];
  folderPath:any;
  uploadDuration = 0;
  uploadQueue: string[] = [];
  isUploading = false;


  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private apiService : ApiService,

  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    // Example images (replace with dynamic data)
    this.projectImages = [];
  }

  SyncData(){
        window.electronAPI.readImagesInFolder(this.folderPath).then((files: string[]) => {
      const imageFiles = files.filter(filePath => this.isImageFile(filePath));

      // อัปโหลดภาพที่ยังไม่ถูกอัปโหลดผ่าน ImageService
      imageFiles.forEach(filePath => this.uploadImage(filePath));

      this.projectImages = imageFiles.map(filePath => `file://${filePath}`);
      this.cdr.detectChanges();
    });
  }

async selectFolder() {
  if (!window.electronAPI) {
    console.error('electronAPI not available');
    return;
  }

  const folderPath = await window.electronAPI.openFolderDialog();
  if (!folderPath) return;

  this.folderPath = folderPath;

  const files: string[] = await window.electronAPI.readImagesInFolder(folderPath);
  const imageFiles = files.filter(filePath => this.isImageFile(filePath));

  imageFiles.forEach(filePath => {
    this.uploadImageQueued(filePath);
  });

  this.projectImages = imageFiles.map(filePath => `file://${filePath}`);
  this.cdr.detectChanges();

  // เริ่ม watch โฟลเดอร์
  window.electronAPI.watchFolder(folderPath);

  // เมื่อพบไฟล์ใหม่
  window.electronAPI.onNewFileDetected((filePath: string) => {
    if (this.isImageFile(filePath)) {
      const imageSrc = `file://${filePath}`;
      if (!this.projectImages.includes(imageSrc)) {
        this.projectImages.unshift(imageSrc);
        this.cdr.detectChanges();
      }

      this.uploadImageQueued(filePath); // อัปโหลดแบบคิว
    }
  });
}


  isImageFile(fileName: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(fileName);
  }


  deleteImage(index: number): void {
  this.projectImages.splice(index, 1);
}

getFileNameFromPath(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || '';
}
// uploadImage(filePath: string) {
//   this.apiService.uploadImageFromPath(filePath, this.projectId)
//     .then(response => console.log("Image uploaded successfully", response))
//     .catch(error => console.error("Upload failed", error));
// }

 async uploadImage(filePath: string): Promise<void> {
  if (!window.electronAPI) {
    console.error('[angular] electronAPI is undefined');
    return;
  }

  try {
    const base64Data = await window.electronAPI.readFileAsBase64(filePath);
    if (!base64Data) {
      console.error('[angular] Failed to read base64 from:', filePath);
      return;
    }

    const fileName = this.getFileNameFromPath(filePath);
    const payload = {
      filename: fileName,
      base64: base64Data
    };

    const start = performance.now();

    // Wrap Observable เป็น Promise และทำ retry 3 ครั้ง
    await this.apiService.uploadBase64ImageToServer(payload.base64, payload.filename, 1).pipe(
      retry(10)
    ).toPromise();

    const end = performance.now();
    const duration = (end - start) / 1000;
    console.log(`✅ Uploaded: ${payload.filename} in ${duration.toFixed(2)}s`);
    this.uploadDuration = duration;

  } catch (err) {
    console.error('❌ Upload failed:', err);
  }
}


async uploadImageQueued(filePath: string) {
  // ป้องกันการอัปโหลดไฟล์ซ้ำ
  if (this.uploadQueue.includes(filePath)) return;

  this.uploadQueue.push(filePath);

  // ถ้ามีการอัปโหลดอยู่แล้ว ไม่ต้องเริ่มรอบใหม่
  if (this.isUploading) return;

  this.isUploading = true;

  while (this.uploadQueue.length > 0) {
    const currentFile = this.uploadQueue.shift();
    if (!currentFile) continue;

    try {
      await this.uploadImage(currentFile);
    } catch (error) {
      console.error('Upload failed:', currentFile, error);
      // ถ้าต้องการ retry หรือ log ซ้ำ สามารถใส่ตรงนี้ได้
    }
  }

  this.isUploading = false;
}



}
