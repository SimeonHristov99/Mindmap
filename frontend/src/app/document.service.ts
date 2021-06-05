import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private webReqServ: WebRequestService) { }

  /**
   * This method calls the endpoint
   * that returns all the documents from the database.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  getDocs(): Observable<object> {
    return this.webReqServ.get('docs');
  }

  /**
   * This method sends a web request to create a new document.
   *
   * @param[in] title
   *     The name of the new document.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  createDocument(title: string): Observable<object> {
    return this.webReqServ.post('docs', { title });
  }

  /**
   * This method calls the endpoint
   * that returns all the shapes from a given documents in the database.
   *
   * @param[in] docId
   *     The id of the document that the shapes are part of.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  getShapes(docId: string): Observable<object> {
    return this.webReqServ.get(`docs/${docId}/shapes`);
  }

  /**
   * This method sends a web request to create
   * a new shape in a given document.
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
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  createShape(
    docId: string,
    id: number,
    type: string,
    translateX: number,
    translateY: number,
    borderColor: string,
    label?: string,
    backgroundColor?: string,
    textColor?: string,
  ): Observable<object> {
    return this.webReqServ.post(`docs/${docId}/shapes`, {
      id,
      type,
      label,
      translateX,
      translateY,
      backgroundColor,
      textColor,
      borderColor
    });
  }
}
