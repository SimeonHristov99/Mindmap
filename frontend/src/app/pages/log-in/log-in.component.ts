import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  btnLoginOnAction(email: string, password: string): void {
    this.authService.login(email, password).pipe(take(1)).subscribe((res: any) => {
      if ((res as HttpResponse<any>).status === 200) {
        this.router.navigateByUrl('docs');
      }
    });
  }
}
