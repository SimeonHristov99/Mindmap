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

  private subscription = new Subscription();
  private isTooShort = false;

  constructor(
    private docServ: DocumentService,
    private router: Router,
  ) { }

  /**
   * This method is a lifecycle hook in which
   * any subscriptions are cleared.
   */
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
    if (title.length < 3) {
      this.isTooShort = true;
      return;
    }

    this.subscription = this.docServ.createDocument(title).subscribe((document: object) => {
      this.router.navigate(['/docs', (document as Document)._id]);
    });
  }

  /**
   * This method returns whether or not the title is too short
   * for the document to be created.
   * 
   * @returns
   *     An indication of whether or not the title is too short
   *     for the document to be created.
   */
  titleTooShort(): boolean {
    return this.isTooShort;
  }

}
