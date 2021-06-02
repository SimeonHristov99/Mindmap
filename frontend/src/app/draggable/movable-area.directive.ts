import { AfterContentInit, ContentChildren, Directive, ElementRef, QueryList } from '@angular/core';
import { Subscription } from 'rxjs';
import { MovableDirective } from './movable.directive';

interface Boundary {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

@Directive({
  selector: '[appMovableArea]'
})
export class MovableAreaDirective implements AfterContentInit {

  @ContentChildren(MovableDirective) movables!: QueryList<MovableDirective>;

  private boundary: Boundary = { minX: 0, maxX: 0, minY: 0, maxY: 0, };
  private previousSubscr: Subscription[] = [];

  constructor(private element: ElementRef) { }

  ngAfterContentInit(): void {
    this.movables.changes.subscribe(() => {
      this.previousSubscr.forEach(s => s.unsubscribe());

      this.movables.forEach(movable => {
        this.previousSubscr.push(movable.dragStart.subscribe(() => this.measureBoundaries(movable)));
        this.previousSubscr.push(movable.dragMove.subscribe(() => this.maintainBoundaries(movable)));
      });
    });

    this.movables.notifyOnChanges();
  }

  private measureBoundaries(movable: MovableDirective): void {
    const viewRect: ClientRect = this.element.nativeElement.getBoundingClientRect();
    const movableRect: ClientRect = movable.element.nativeElement.getBoundingClientRect();

    this.boundary = {
      minX: viewRect.left - movableRect.left + movable.currentPosition.x,
      maxX: viewRect.right - movableRect.right + movable.currentPosition.x,
      minY: viewRect.top - movableRect.top + movable.currentPosition.y,
      maxY: viewRect.bottom - movableRect.bottom + movable.currentPosition.y
    };
  }

  private maintainBoundaries(movable: MovableDirective): void {
    movable.currentPosition.x = Math.max(this.boundary.minX, movable.currentPosition.x);
    movable.currentPosition.x = Math.min(this.boundary.maxX, movable.currentPosition.x);
    movable.currentPosition.y = Math.max(this.boundary.minY, movable.currentPosition.y);
    movable.currentPosition.y = Math.min(this.boundary.maxY, movable.currentPosition.y);
  }

}
