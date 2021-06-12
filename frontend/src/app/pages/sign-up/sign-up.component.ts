import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  btnSignOnAction(email: string, password: string): void {
    this.authService.signup(email, password).subscribe((res: any) => {
      if ((res as HttpResponse<any>).status === 200) {
        this.router.navigateByUrl('docs');
      }
    });
  }

}
