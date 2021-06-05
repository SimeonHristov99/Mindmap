import { Component } from '@angular/core';
import { DocumentService } from 'src/app/document.service';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss']
})
export class NewDocumentComponent {

  constructor(private docServ: DocumentService) { }

  /**
   * This method calls the web service to create a new document.
   * 
   * @param[in] title
   *     The name of the document to be created.
   */
  createDocument(title: string): void {
    this.docServ.createDocument(title).subscribe((response: any) => {
      console.log(response);

      // Navigate to /docs/response._id
    });
  }

}
