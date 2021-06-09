import { Input } from '@angular/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-greeting',
  templateUrl: './hero-greeting.component.html',
  styleUrls: ['./hero-greeting.component.scss']
})
export class HeroGreetingComponent {

  @Input() greeting = 'Enter text';
}
