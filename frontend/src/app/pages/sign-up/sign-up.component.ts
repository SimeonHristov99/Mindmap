import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from 'src/app/auth.service';
import { State } from 'src/app/state';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  private state = State.NO_ATTEMPT;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  btnSignOnAction(email: string, password: string): void {
    if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      this.state = State.FAIL_EMAIL;
      return;
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      this.state = State.FAIL_PASSWORD;
      return;
    }

    this.authService.signup(email, password).pipe(take(1)).subscribe((res: any) => {
      if ((res as HttpResponse<any>).status === 200) {
        this.router.navigateByUrl('docs');
        this.state = State.SUCCESS;
      }
    });

    this.state = State.FAIL_EMAIL_TAKEN;
  }

  emailFail(): boolean {
    return this.state === State.FAIL_EMAIL;
  }

  emailTakenFail(): boolean {
    return this.state === State.FAIL_EMAIL_TAKEN;
  }

  passwordFail(): boolean {
    return this.state === State.FAIL_PASSWORD;
  }

}
