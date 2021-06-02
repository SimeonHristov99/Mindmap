import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private webReqServ: WebRequestService) { }

  createDocument(title: string): Observable<object> {
    // Send a web request to create a new document
    return this.webReqServ.post('docs', { title });
  }

  getDocs(): Observable<object> {
    return this.webReqServ.get('docs');
  }

  /**
   * This function sends a post request to the database to create a shape.
   *
   * @param[in] docId This is the id of the document into which the shape will be created.
   *
   * @param[in] type This is the type of the shape that will be created.
   * Should only be 'cirlce' or 'line'.
   *
   * @returns An Observable with which it indicated whether the creation was successful.
   */
  createShape(
    docId: string,
    type: string,
    /* ??? */
  ): Observable<object> {

    return this.webReqServ.post(`docs/${docId}/shapes`, {
      type,
      /* ??? */
    });

  }

  getShapes(docId: string): Observable<object> {

    return this.webReqServ.get(`docs/${docId}/shapes`);

    // return {
    //   type: 'circle',
    //   data: {
    //     translate: [78.0404, 365.4],
    //     rotate: -392.359,
    //     transformOrigin: '50% 50%',
    //     width: 372,
    //     height: 208,
    //   }
    // };

  }
}
