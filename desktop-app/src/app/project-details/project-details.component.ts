import { ChangeDetectorRef, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare global {
  interface Window {
    electronAPI: {
      openFolderDialog: () => Promise<string | null>;
      watchFolder: (folderPath: string) => Promise<void>;
      onNewFileDetected: (callback: (filePath: string) => void) => void;
      readImagesInFolder: (folderPath: string) => Promise<string[]>;
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
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    // Example images (replace with dynamic data)
    this.projectImages = [];
  }

selectFolder() {
  if (!window.electronAPI) {
    console.error('[angular] electronAPI is undefined');
    return;
  }

  window.electronAPI.openFolderDialog().then((folderPath: string | null) => {
    if (!folderPath) return;

    this.folderPath = folderPath;

    // โหลดภาพที่มีอยู่ในโฟลเดอร์
    window.electronAPI.readImagesInFolder(folderPath).then((files: string[]) => {
      const imageFiles = files
        .filter(filePath => this.isImageFile(filePath))
        .map(filePath => `file://${filePath}`);

      this.projectImages = imageFiles;
      this.cdr.detectChanges();
    });

    // เริ่มเฝ้าดูโฟลเดอร์
    window.electronAPI.watchFolder(folderPath);

    // รับ event เมื่อมีไฟล์ใหม่
    window.electronAPI.onNewFileDetected((filePath: string) => {
      const imageSrc = `file://${filePath}`;
      if (this.isImageFile(filePath) && !this.projectImages.includes(imageSrc)) {
        this.projectImages.push(imageSrc);
        this.cdr.detectChanges();
      }
    });
  });
}

  isImageFile(fileName: string): boolean {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(fileName);
  }




}
