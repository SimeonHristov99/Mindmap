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
   *     The name of the new document to be created.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  createDocument(title: string): Observable<object> {
    return this.webReqServ.post('docs', { title });
  }

  /**
   * This method sends a web request to
   * update the name of an existing document (specified by an id).
   *
   * @param[in] id
   *     The id of the document to have its name changed.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  updateDocument(id: string, title: string): Observable<object> {
    // return this.webReqServ.post('docs', { title });
    return this.webReqServ.patch(`docs/${id}`, { title });
  }

  /**
   * This method sends a web request to
   * delete a new document (specified by an id).
   *
   * @param[in] id
   *     The id of the new document to be deleted.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  deleteDocument(id: string): Observable<object> {
    return this.webReqServ.delete(`docs/${id}`);
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

  /**
   * This method sends a web request to update
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
  updateShape(
    docId: string,
    shapeId: string,
    id: number,
    type: string,
    translateX: number,
    translateY: number,
    borderColor: string,
    label?: string,
    backgroundColor?: string,
    textColor?: string,
  ): Observable<object> {
    return this.webReqServ.patch(`docs/${docId}/shapes/${shapeId}`, {
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

  /**
   * This method sends a web request to
   * delete a shape (specified by an id)
   * from a document (specified by an id).
   *
   * @param[in] docId
   *      The id of the document where the shape to be deleted is.
   *
   * @param[in] shapeId
   *      The id of the shape to be deleted.
   *
   * @returns
   *     The object returned from the database wrapped in an Observable.
   */
  deleteShape(docId: string, shapeId: string): Observable<object> {
    return this.webReqServ.delete(`docs/${docId}/shapes/${shapeId}`);
  }
}
