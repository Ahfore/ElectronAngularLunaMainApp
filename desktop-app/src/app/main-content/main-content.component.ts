import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NewProjectDialogComponent } from '../new-project-dialog/new-project-dialog.component';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.css']
})
export class MainContentComponent {
  projects = [
    { id: 1, name: "Wedding Album", image: "assets/wedding.jpg" },
    { id: 2, name: "Event Photography", image: "assets/event.jpg" },
    { id: 3, name: "Portrait Collection", image: "assets/portrait.jpg" }
  ];

  constructor(private dialog : MatDialog){

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
  }

    openDialog() {
    const dialogRef = this.dialog.open(NewProjectDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      //something here
    });
  }



}
