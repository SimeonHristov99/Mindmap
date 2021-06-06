import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { PartialObserver } from 'rxjs';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {

  constructor(private authService: AuthService) { }

  btnLoginOnAction(email: string, password: string): void {
    this.authService.login(email, password).subscribe((res: any) => {
      console.log(res as HttpResponse<any>);
    });
  }
}
