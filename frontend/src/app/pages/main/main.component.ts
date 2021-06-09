import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/document.service';
import { Shape } from 'src/app/models/shape.model';

enum Actions {
  ADD,
  REMOVE,
  ZOOM_OUT,
  ZOOM_IN,
  COPY,
  PASTE,
}

interface Action {
  type: Actions;
  alteredShape?: Shape;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {

  private static scalingFactor = 1;
  private static clipboard: Shape | null = null;
  private static currentShapeIndex = -1;
  private static actionsUndo: Action[] = [];
  private static actionsRedo: Action[] = [];
  private static subscriptions: Subscription[] = [];

  shapes: Shape[] = [];
  docs: any;
  currentDocName = '';
  private docId = '';

  @ViewChild('labelValue', { static: true }) labelValueRef: ElementRef;
  @ViewChild('fillColor', { static: true }) fillColorRef: ElementRef;
  @ViewChild('borderColor', { static: true }) borderColorRef: ElementRef;
  @ViewChild('textColor', { static: true }) textColorRef: ElementRef;

  @ViewChild('middleColumn', { static: true }) middleColumnRef: ElementRef;

  /**
   * This is a helper method for the 'zoomOut' public method.
   * It decreases the scaling factor of the middle column html element.
   *
   * @returns
   *     An indication of whether or not the scaling factor of the
   *     middle column html element was decreased is returned.
   */
  private didZoomOut(): boolean {
    if (MainComponent.scalingFactor < 0.10) {
      return false;
    }

    MainComponent.scalingFactor -= 0.25;
    this.middleColumnRef.nativeElement.style.transform = `scale(${MainComponent.scalingFactor})`;

    return true;
  }

  /**
   * This is a helper method for the 'zoomIn' public method.
   * It increases the scaling factor of the middle column html element.
   *
   * @returns
   *     An indication of whether or not the scaling factor of the
   *     middle column html element was increased is returned.
   */
  private didZoomIn(): boolean {
    if (MainComponent.scalingFactor >= 1) {
      return false;
    }

    MainComponent.scalingFactor += 0.25;
    this.middleColumnRef.nativeElement.style.transform = `scale(${MainComponent.scalingFactor})`;

    return true;
  }

  /**
   * This is a helper method for the 'remove' public method.
   * It removes a shape component at a current index.
   *
   * @param[in] idx
   *      This is the index, the element at which has to be removed.
   */
  private doRemove(idx: number): void {
    this.shapes.splice(idx, 1);
    MainComponent.currentShapeIndex = -1;
  }

  /**
   * This is a helper method for the 'add' public method.
   * It adds a default shape to the shapes array.
   *
   * @param[in] shape
   *      This is the shape to be added to the shapes array.
   */
  private didAdd(shape: Shape): void {
    MainComponent.currentShapeIndex = this.shapes.length - 1;

    MainComponent.subscriptions.push(this.docServ.createShape(this.docId,
      shape.id,
      shape.type,
      shape.translateX,
      shape.translateY,
      shape.borderColor,
      shape.label,
      shape.backgroundColor,
      shape.textColor,
      ).subscribe((newShape: object) => {
        this.shapes.push(newShape as Shape);
    }));
  }

  constructor(
    private docServ: DocumentService,
    private route: ActivatedRoute,
    labelValueRef: ElementRef,
    fillColorRef: ElementRef,
    borderColorRef: ElementRef,
    textColorRef: ElementRef,
    middleColumnRef: ElementRef,
  ) {
    this.labelValueRef = labelValueRef;
    this.fillColorRef = fillColorRef;
    this.borderColorRef = borderColorRef;
    this.textColorRef = textColorRef;
    this.middleColumnRef = middleColumnRef;
  }

  ngOnDestroy(): void {
    MainComponent.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    MainComponent.subscriptions.push(this.docServ.getDocs().subscribe((docs: any) => {
      this.docs = docs;
    }));

    MainComponent.subscriptions.push(this.route.params.subscribe((params: Params) => {
      if (params.docId) {
        this.docId = params.docId;

        MainComponent.subscriptions.push(this.docServ.getShapes(params.docId).subscribe((shapes: any) => {
          this.shapes = shapes;
        }));
      }
    }));

    this.labelValueRef.nativeElement.addEventListener('input', () => {
      if (
        MainComponent.currentShapeIndex < 0
        || MainComponent.currentShapeIndex >= this.shapes.length
        || this.shapes[MainComponent.currentShapeIndex].type === 'line'
      ) {
        return;
      }

      this.shapes[MainComponent.currentShapeIndex].label = this.labelValueRef.nativeElement.value;
    }, false);

    this.fillColorRef.nativeElement.addEventListener('input', () => {
      if (
        MainComponent.currentShapeIndex < 0
        || MainComponent.currentShapeIndex >= this.shapes.length
        || this.shapes[MainComponent.currentShapeIndex].type === 'line'
      ) {
        return;
      }

      this.shapes[MainComponent.currentShapeIndex].backgroundColor = this.fillColorRef.nativeElement.value;
    }, false);

    // works only for ellipses, since the line doesn't have text
    this.textColorRef.nativeElement.addEventListener('input', () => {
      if (
        MainComponent.currentShapeIndex < 0
        || MainComponent.currentShapeIndex >= this.shapes.length
        || this.shapes[MainComponent.currentShapeIndex].type === 'line'
      ) {
        return;
      }

      this.shapes[MainComponent.currentShapeIndex].textColor = this.textColorRef.nativeElement.value;
    }, false);

    this.borderColorRef.nativeElement.addEventListener('input', () => {
      if (
        MainComponent.currentShapeIndex < 0
        || MainComponent.currentShapeIndex >= this.shapes.length
      ) {
        return;
      }

      this.shapes[MainComponent.currentShapeIndex].borderColor = this.borderColorRef.nativeElement.value;
    }, false);

  }



  /**
   * The method sets the value of the variable
   * that traces the last selected shape, i.e. the shapes the user
   * clicks on.
   *
   * @param i
   *     The index of the shape that was most recently
   *     selected by the user.
   */
  setCurrentShapeIndex(i: number): void {
    MainComponent.currentShapeIndex = i;
  }

  /**
   * This method is used by ngFor. It allows for the rendering only of new shapes.
   * In other words, when a new shape is added the default behavior of ngFor is
   * to rerender all shapes from the array (which means linear time). By having
   * this function only the new shapes are rendered.
   *
   * @param[in] index
   *     This is the index of the shape in the array rendered by ngFor.
   * @param[in] shape
   *     This is the shape that is being rendered by ngFor.
   * @returns
   *     The id of the shape that was last rendered by ngFor.
   */
  trackById(index: number, shape: Shape): number {
    return shape.id;
  }

  /**
   * The method sets the value of the "Label" input tag in the left column
   * to the value of the selected ellipse.
   *
   * @Note
   *     If a shape hasn't been selected
   *     OR the selected shape is not an ellipse
   *     nothing is changed.
   */
  updateLabel(): void {
    if (MainComponent.currentShapeIndex < 0 || MainComponent.currentShapeIndex >= this.shapes.length) {
      return;
    }

    if (!this.shapes[MainComponent.currentShapeIndex].label) {
      this.labelValueRef.nativeElement.value = '';
      return;
    }

    this.labelValueRef.nativeElement.value = this.shapes[MainComponent.currentShapeIndex].label;
  }

  /**
   * This function hides any HTMLElement. Here it is used to hide
   * the sidemenus.
   *
   * @param[in] which
   *     This is the selector of the HTMLElement to be hidden.
   *     If an invalid selector is passed, then noting is changed.
   */
  hide(which: string): void {
    const col: HTMLElement | null = document.querySelector(which);

    if (col) {
      col.classList.toggle('is-hidden');
    }
  }

  /**
   * This function creates a new Shape object. It then pushes it into the array
   * holding the shapes.
   *
   * @param[in] what
   *     This is the type of the shape to be created.
   *     It should only be 'ellipse' or 'line'. If none of these are entered
   *     noting is created and hense, nothing is rendered.
   */
  add(what: string): void {

    let newShape: Shape;

    switch (what) {

      case 'ellipse': {
        newShape = {
          id: this.shapes.length,
          type: what,
          label: 'New Ellipse',
          translateX: 0,
          translateY: 0,
          textColor: 'black',
          borderColor: 'black'
        };
        break;
      }

      case 'line': {
        newShape = {
          id: this.shapes.length,
          type: what,
          translateX: 0,
          translateY: 0,
          textColor: 'black',
          borderColor: 'black'
        };
        break;
      }

      default: {
        return;
      }
    }

    this.didAdd(newShape);

    MainComponent.actionsUndo.push({
      type: Actions.ADD,
      alteredShape: newShape
    });

    return;
  }

  /**
   * This method gets called when the trash icon is clicked
   * in the second level of the navbar. It deleted the most
   * recently selected item.
   */
  remove(): void {
    if (
      MainComponent.currentShapeIndex < 0
      || MainComponent.currentShapeIndex >= this.shapes.length
    ) {
      return;
    }

    MainComponent.actionsUndo.push({
      type: Actions.REMOVE,
      alteredShape: this.shapes[MainComponent.currentShapeIndex],
    });

    this.doRemove(MainComponent.currentShapeIndex);
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Zoom Out' icon in the second-level navbar.
   */
  zoomOut(): void {
    if (this.didZoomOut()) {
      MainComponent.actionsUndo.push({
        type: Actions.ZOOM_OUT,
      });
    }
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Zoom In' icon in the second-level navbar.
   */
  zoomIn(): void {
    if (this.didZoomIn()) {
      MainComponent.actionsUndo.push({
        type: Actions.ZOOM_IN,
      });
    }
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Copy' icon in the second-level navbar.
   */
  copy(): void {
    if (
      MainComponent.currentShapeIndex < 0
      || MainComponent.currentShapeIndex >= this.shapes.length
    ) {
      return;
    }

    MainComponent.clipboard = {
      id: this.shapes.length,
      type: this.shapes[MainComponent.currentShapeIndex].type,
      label: this.shapes[MainComponent.currentShapeIndex].label,
      translateX: this.shapes[MainComponent.currentShapeIndex].translateX,
      translateY: this.shapes[MainComponent.currentShapeIndex].translateY,
      backgroundColor: this.shapes[MainComponent.currentShapeIndex].backgroundColor,
      textColor: this.shapes[MainComponent.currentShapeIndex].textColor,
      borderColor: this.shapes[MainComponent.currentShapeIndex].borderColor,
    };

    MainComponent.actionsUndo.push({
      type: Actions.COPY,
    });
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Paste' icon in the second-level navbar. After pasting
   * the new shape is now the selected shape. This can be done
   * multiple times without copying after pasting.
   */
  paste(): void {
    if (!MainComponent.clipboard) {
      return;
    }

    MainComponent.currentShapeIndex = this.shapes.length;
    this.shapes.push(MainComponent.clipboard);

    MainComponent.clipboard = null;

    MainComponent.actionsUndo.push({
      type: Actions.PASTE,
    });
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Undo' icon in the second-level navbar.
   */
  undo(): void {
    const act: Action | undefined = MainComponent.actionsUndo.pop();

    if (!act) {
      return;
    }

    switch (act.type) {

      case Actions.ADD: {
        if (!act.alteredShape) {
          return;
        }

        const idx = this.shapes.indexOf(act.alteredShape);

        if (idx !== -1) {
          this.doRemove(idx);
        }

        break;
      }

      case Actions.REMOVE: {
        if (!act.alteredShape) {
          return;
        }

        this.didAdd(act.alteredShape);
        break;
      }

      case Actions.ZOOM_OUT: {
        this.didZoomIn();
        break;
      }

      case Actions.ZOOM_IN: {
        this.didZoomOut();
        break;
      }

      case Actions.COPY: {
        // if a shape is copied that it is in the clipboard variable.
        // In order to undo copying just clear the clipboard variable.

        MainComponent.clipboard = null;
        break;
      }

      case Actions.PASTE: {
        // if a shape has been pasted then it was in the clipboard variable.
        // In order to undo pasting remove the last shape in the array
        // and put it back in the clipboard variable.

        const top: Shape | undefined = this.shapes.pop();

        if (top) {
          MainComponent.clipboard = top;
        }

        break;
      }

      default: {
        return;
      }
    }

    MainComponent.actionsRedo.push(act);
  }

  /**
   * This method gets triggered when the user clicks on the
   * 'Redo' icon in the second-level navbar.
   *
   * @Note
   *     Only actions that were undone can be redone.
   */
  redo(): void {
    const act: Action | undefined = MainComponent.actionsRedo.pop();

    if (!act) {
      return;
    }

    switch (act.type) {

      case Actions.ADD: {
        if (!act.alteredShape) {
          return;
        }

        this.didAdd(act.alteredShape);
        break;
      }

      case Actions.REMOVE: {
        if (!act.alteredShape) {
          return;
        }

        this.doRemove(this.shapes.indexOf(act.alteredShape));
        break;
      }

      case Actions.ZOOM_OUT: {
        this.didZoomOut();
        break;
      }

      case Actions.ZOOM_IN: {
        this.didZoomIn();
        break;
      }

      case Actions.COPY: {
        this.copy();
        break;
      }

      case Actions.PASTE: {
        this.paste();
        break;
      }

      default: {
        return;
      }
    }
  }

  // this part holds resizing
  // but because it doesn't work it's commented out
  // it's not removed because it may be used again
  ngAfterViewInit(): void {

    // const resizers = this.input.nativeElement.querySelectorAll('.resizer');

    // let currentResizer: HTMLElement;

    // resizers.forEach(resizer => {
    //   resizer.addEventListener('mousedown', mousedown);
    //   function mousedown(e: PointerEvent | any): void {

    //     currentResizer = e.target;
    //     let prevX = e.clientX;
    //     let prevY = e.clientY;

    //     window.addEventListener('mousemove', mousemove);
    //     window.addEventListener('mouseup', mouseup);

    //     function mousemove(e: PointerEvent | any): void {
    //       const parent = resizer.parentElement;

    //       if (!parent) {
    //         return;
    //       }

    //       const rect = parent.getBoundingClientRect();

    //       if (currentResizer.classList.contains('se')) {
    //         parent.style.width = rect.width - (prevX - e.clientX) + 'px';
    //         parent.style.height = rect.height - (prevY - e.clientY) + 'px';
    //       }

    //       prevX = e.clientX;
    //       prevY = e.clientY;
    //     }

    //     function mouseup(e: PointerEvent | any): void {
    //       window.removeEventListener('mousemove', mousemove);
    //       window.removeEventListener('mouseup', mouseup);
    //     }
    //   }
    // });
  }


}
