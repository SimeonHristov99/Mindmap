import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from 'src/app/auth.service';
import { State } from 'src/app/state';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {

  private state = State.NO_ATTEMPT;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  btnLoginOnAction(email: string, password: string): void {
    if (!email.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      this.state = State.FAIL_EMAIL;
      return;
    }

    if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
      this.state = State.FAIL_PASSWORD;
      return;
    }

    this.authService.login(email, password).pipe(take(1)).subscribe((res: any) => {
      if ((res as HttpResponse<any>).status === 200) {
        this.state = State.SUCCESS;
        this.router.navigateByUrl('docs');
      } else {
        this.state = State.FAIL_PASSWORD;
      }
    });
  }

  emailFail(): boolean {
    return this.state === State.FAIL_EMAIL;
  }

  passwordFail(): boolean {
    return this.state === State.FAIL_PASSWORD;
  }
}
