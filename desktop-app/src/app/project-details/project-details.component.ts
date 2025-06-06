import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';

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

selectFolder() {
  if (!window.electronAPI) {
    console.error();
    return;
  }

  window.electronAPI.openFolderDialog().then((folderPath: string | null) => {
    if (!folderPath) return;
    this.folderPath = folderPath;

    window.electronAPI.readImagesInFolder(folderPath).then((files: string[]) => {
      const imageFiles = files.filter(filePath => this.isImageFile(filePath));

      // อัปโหลดภาพที่ยังไม่ถูกอัปโหลดผ่าน ImageService
      imageFiles.forEach(filePath => this.uploadImage(filePath));

      this.projectImages = imageFiles.map(filePath => `file://${filePath}`);
      this.cdr.detectChanges();
    });

    // ตรวจจับการเปลี่ยนแปลงในโฟลเดอร์
    window.electronAPI.watchFolder(folderPath);

    window.electronAPI.onNewFileDetected((filePath: string) => {
      if (this.isImageFile(filePath)) {
        const imageSrc = `file://${filePath}`;
        if (!this.projectImages.includes(imageSrc)) {
          this.projectImages.unshift(imageSrc);
          this.cdr.detectChanges();
        }

        // อัปโหลดทันทีผ่าน ImageService
        this.uploadImage(filePath);
      }
    });
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

uploadImage(filePath: string): void {
  if (!window.electronAPI) {
    console.error('[angular] electronAPI is undefined');
    return;
  }

  window.electronAPI.readFileAsBase64(filePath).then((base64Data: string | null) => {
    if (!base64Data) {
      console.error('[angular] Failed to read base64 from:', filePath);
      return;
    }

    const fileName = this.getFileNameFromPath(filePath);

    const payload = {
      filename: fileName,
      base64: base64Data
    };

    console.log('[angular] Upload payload:', payload);

    this.apiService.uploadBase64ImageToServer(payload.base64,payload.filename,1).subscribe(response=>{
      console.log(response)
    })

    

  });
}



}
