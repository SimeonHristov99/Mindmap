import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent {

  constructor(private authService: AuthService) { }
  
  btnSignOnAction(email: string, password: string): void {
    this.authService.signup(email, password).subscribe((res: any) => {
      console.log(res as HttpResponse<any>);
    });
  }

}
