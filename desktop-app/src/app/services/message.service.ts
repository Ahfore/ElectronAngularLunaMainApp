import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
    showAlert(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'info', // Default icon is 'info'
    confirmButtonText: string = 'OK' // Default button text is 'OK'
  ): void {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      confirmButtonText: confirmButtonText,
    });
  }

  showConfirm(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'warning',
    confirmButtonText: string = 'Yes',
    denyButtonText: string = 'No',
    cancelButtonText: string = 'Cancel'
  ): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
    }).then((result) => {
      return result.isConfirmed === true; // Return true if confirmed, false otherwise
    });
  }
}
