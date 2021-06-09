import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { DocumentService } from 'src/app/document.service';

@Component({
  selector: 'app-edit-document',
  templateUrl: './edit-document.component.html',
  styleUrls: ['./edit-document.component.scss']
})
export class EditDocumentComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private docServ: DocumentService,
    private router: Router,
  ) { }

  private static subscriptions: Subscription[] = [];

  private docId = '';

  ngOnInit(): void {
    EditDocumentComponent.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.docId = params.docId;
    }));
  }

  ngOnDestroy(): void {
    EditDocumentComponent.subscriptions.forEach(s => s.unsubscribe());
  }

  updateDocument(title: string): void {
    if (this.docId.length === 0) {
      return;
    }

    EditDocumentComponent.subscriptions.push(
      this.docServ.updateDocument(this.docId, title).subscribe(() => {
        this.router.navigateByUrl(`/docs/${this.docId}`);
      })
    );
  }

}
