import { Component } from '@angular/core';
import { DocumentService } from 'src/app/document.service';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss']
})
export class NewDocumentComponent {

  constructor(private docServ: DocumentService) { }

  createDocument(title: string): void {
    this.docServ.createDocument(title).subscribe((response: any) => {
      console.log(response);

      // Navigate to /main/docs/response._id
    });
  }

}
