import { Component } from '@angular/core';

@Component({
  selector: 'app-new-project-dialog',
  templateUrl: './new-project-dialog.component.html',
  styleUrls: ['./new-project-dialog.component.css']
})
export class NewProjectDialogComponent {


  constructor(){

  }

   ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    
   }

   confirm(){
    
   }

}
