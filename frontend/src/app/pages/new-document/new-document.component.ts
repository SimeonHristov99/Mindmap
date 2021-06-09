import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/document.service';
import { Document } from 'src/app/models/document.model';
import { Shape } from 'src/app/models/shape.model';

@Component({
  selector: 'app-new-document',
  templateUrl: './new-document.component.html',
  styleUrls: ['./new-document.component.scss']
})
export class NewDocumentComponent implements OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private docServ: DocumentService,
    private router: Router,
  ) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * This method calls the web service to create a new document.
   *
   * @param[in] title
   *     The name of the document to be created.
   */
  createDocument(title: string): void {
    this.subscription = this.docServ.createDocument(title).subscribe((document: object) => {
      this.router.navigate(['/docs', (document as Document)._id]);
    });
  }

}
