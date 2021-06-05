import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService } from 'src/app/document.service';
import { Document } from 'src/app/models/document.model';
import { Shape } from 'src/app/models/shape.model';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss']
})
export class NewDocumentComponent {

  constructor(
    private docServ: DocumentService,
    private router: Router,
  ) { }

  /**
   * This method calls the web service to create a new document.
   *
   * @param[in] title
   *     The name of the document to be created.
   */
  createDocument(title: string): void {
    this.docServ.createDocument(title).subscribe((document: object) => {
      this.router.navigate(['/docs', (document as Document)._id]);
    });
  }

  /**
   *  This method calls the web service to create a new shape
   *  in a given document.
   *
   * @param docId
   *     This is the id of the doument in which
   *     the new shape has to be created.
   *
   * @param id
   *     This is the id of the shape
   *     as it was stored in the shapes array.
   *
   * @param type
   *     This is the type/geometric interpretation of the shape.
   *
   * @param label
   *     This is the label of the shape (if any).
   *
   * @param translateX
   *     This is the position to which the shape has to be moved
   *     on the X axis.
   *
   * @param translateY
   *     This is the position to which the shape has to be moved
   *     on the Y axis.
   *
   * @param backgroundColor
   *     This is the last set background color.
   *
   * @param textColor
   *     This is the last set text color.
   *
   * @param borderColor
   *     This is the last set border color.
   */
  private createShape(
    docId: string,
    id: number,
    type: string,
    translateX: number,
    translateY: number,
    borderColor: string,
    label?: string,
    backgroundColor?: string,
    textColor?: string,
  ): void {

  }

}
