import { Component } from '@angular/core';

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


}
