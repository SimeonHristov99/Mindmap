import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { AuthService } from 'src/app/auth.service';
import { Regexes } from 'src/app/regexes';
import { State } from 'src/app/state';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {

  /**
   * This property holds the various states of a state machine
   * that represents whether a user has successfully logged in.
   *
   * @Note
   *     Even though the password could be entered correctly
   *     but the username might be wrong, we would still show a
   *     message that the password is correct. This is because
   *     users (who are not logged in!) needn't know what profiles
   *     have been created.
   */
  private state = State.NO_ATTEMPT;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * This method gets called when the user clicks on the "Log in"
   * button in the login page. It validates the username and
   * password and checks to see whether such a user really
   * exists in the database. If the user exits, the login is successful
   * and the user is redirected to the main page ('/docs').
   *
   * @param[in] email
   *     The email the user entered.
   *
   * @param[in] password
   *     The password the user entered.
   */
  btnLoginOnAction(email: string, password: string): void {
    if (!email.match(Regexes.email)) {
      this.state = State.FAIL_EMAIL;
      return;
    }

    if (!password.match(Regexes.password)) {
      this.state = State.FAIL_PASSWORD;
      return;
    }

    this.authService.login(email, password).pipe(take(1))
      .subscribe((res: object) => {
        if ((res as HttpResponse<any>).status === 200) {
          this.state = State.SUCCESS;
          this.router.navigateByUrl('docs');
        } else {
          this.state = State.FAIL_PASSWORD;
        }
      });

    if ( // if the request does not succeed change the state
      this.state !== State.SUCCESS
      && this.state !== State.NO_ATTEMPT
    ) {
      this.state = State.FAIL_PASSWORD;
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
