import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from 'src/app/auth.service';
import { Regexes } from 'src/app/regexes';
import { State } from 'src/app/state';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  /**
   * This property holds the various states of a state machine
   * that represents whether a user has successfully signed in.
   */
  private state = State.NO_ATTEMPT;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  btnSignOnAction(email: string, password: string): void {
    if (!email.match(Regexes.email)) {
      this.state = State.FAIL_EMAIL;
      return;
    }

    if (!password.match(Regexes.password)) {
      this.state = State.FAIL_PASSWORD;
      return;
    }

    this.authService.signup(email, password).pipe(take(1))
      .subscribe((res: object) => {
        if ((res as HttpResponse<any>).status === 200) {
          this.state = State.SUCCESS;
          this.router.navigateByUrl('docs');
        } else {
          this.state = State.FAIL_EMAIL_TAKEN;
        }
      });

    if ( // if the request does not succeed change the state
      this.state !== State.SUCCESS
      && this.state !== State.NO_ATTEMPT
    ) {
      this.state = State.FAIL_EMAIL_TAKEN;
    }
  }

  /**
   * This method checks whether the user has entered a valid email.
   * In order to be valid it has to pass the regex.
   *
   * @returns
   *     An indication of whether or not the user has entered a valid email.
   */
  emailFail(): boolean {
    return this.state === State.FAIL_EMAIL;
  }

  /**
   * This method checks whether the user
   * has entered an email that is already taken.
   *
   * @returns
   *     An indication of whether or not the user has entered a valid email.
   */
  emailTakenFail(): boolean {
    return this.state === State.FAIL_EMAIL_TAKEN;
  }

  /**
   * This method checks whether the user has entered a valid password.
   * In order to be valid it has to pass the regex
   * AND correspond to a real account in the database, i.e. be part
   * of exactly one tuple in the form: email <-> password.
   *
   * @returns
   *     An indication of whether or not the user has entered a valid email.
   */
  passwordFail(): boolean {
    return this.state === State.FAIL_PASSWORD;
  }

}
