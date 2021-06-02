import { Directive, ElementRef, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DraggableDirective } from './draggable.directive';

interface Position {
  x: number;
  y: number;
}

@Directive({
  selector: '[appMovable]'
})
export class MovableDirective extends DraggableDirective {

  @HostBinding('class.movable') movable = true;
  @HostBinding('style.transform') get transform(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      `translateX(${this.currentPosition.x}px) translateY(${this.currentPosition.y}px)`
    );
  }

  private startPosition: Position = { x: 0, y: 0 };

  @Input('appMovableReset') reset = false;
  @Input() currentPosition: Position = { x: 0, y: 0 };

  constructor(private sanitizer: DomSanitizer, public element: ElementRef) {
    super();
  }

  @HostListener('dragStart', ['$event'])
  onDragStart(event: PointerEvent): void {
    this.startPosition = {
      x: event.clientX - this.currentPosition.x,
      y: event.clientY - this.currentPosition.y
    };
  }

  @HostListener('dragMove', ['$event'])
  onDragMove(event: PointerEvent): void {
    this.currentPosition.x = event.clientX - this.startPosition.x;
    this.currentPosition.y = event.clientY - this.startPosition.y;
  }

  @HostListener('dragEnd', ['$event'])
  onDragEnd(event: PointerEvent): void {
    if (this.reset) {
      this.currentPosition = { x: 0, y: 0 };
    }
  }

}
