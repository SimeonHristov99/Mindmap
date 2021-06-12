import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { AuthService } from 'src/app/auth.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-share-document',
  templateUrl: './share-document.component.html',
  styleUrls: ['./share-document.component.scss']
})
export class ShareDocumentComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private authServ: AuthService,
    private router: Router,
  ) { }

  private static subscriptions: Subscription[] = [];

  private docId = '';
  users: User[] = [];

  ngOnInit(): void {
    ShareDocumentComponent.subscriptions.push(this.route.params.subscribe((params: Params) => {
      this.docId = params.docId;
    }));

    ShareDocumentComponent.subscriptions.push(this.authServ.getUsers().subscribe((users) => {
      this.users = users as User[];
    }));
  }

  ngOnDestroy(): void {
    ShareDocumentComponent.subscriptions.forEach(s => s.unsubscribe());
  }

  shareDocument(selectedUser: string): void {
    console.log(selectedUser);
    this.router.navigateByUrl(`docs/${this.docId}`);
  }

}
