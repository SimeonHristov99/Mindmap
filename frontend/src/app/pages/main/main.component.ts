import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth.service';
import { DocumentService } from 'src/app/document.service';
import { Shape } from 'src/app/models/shape.model';
import { Actions } from 'src/app/user-actions';

/**
 * This is a helper interface for the undo and redo system.
 * It binds an actions with a shape, if a shape was affected.
 */
interface Action {
  type: Actions;
  alteredShape?: Shape;
}

/**
 * This is the component responsible for the creations/modifications
 * of documents and shapes.
 */
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * This static property is used to modify the zooming in and out.
   * It gets updated after one of those actions is performed in the
   * method that got called.
   */
  private static scalingFactor = 1;

  /**
   * This static property is used for storing a shape when it gets copied.
   */
  private static clipboard: Shape | null = null;

  /**
   * This static property is used for storing the index
   * of the last shape the user clicked on.
   */
  private static currentShapeIndex = -1;

  /**
   * This static property is used for storing any actions the user has undone.
   */
  private static actionsUndo: Action[] = [];

  /**
   * This static property is used for storing any actions the user has redone.
   */
  private static actionsRedo: Action[] = [];

  /**
   * This static property is used for storing any
   * subscriptions to objects done while working with the API.
   */
  private static subscriptions: Subscription[] = [];

  /**
   * This property is a container for all the shapes the user works with,
   * respectively sees in the middle column.
   *
   * @Note
   *     This container gets flushed
   *     to the database when the user click on the 'Save' icon in the
   *     top-level navbar. This is the only way to save the
   *     shapes in the database,
   */
  shapes: Shape[] = [];

  /**
   * This property is a container for all the documents the user works with,
   * respectively sees in the left column.
   */
  docs: Document[] = [];

  /**
   * This property stores the name of the currently selected document.
   * This is the document the name of
   * which gets highlighted in the left column.
   */
  currentDocName = '';

  /**
   * This is the id of the currently selected document as it is stored
   * in the database. This is the document the name of
   * which gets highlighted in the left column.
   */
  docId = '';

  /**
   * This is property is an idication of whether or not the system
   * is saving all shapes at the moment.
   */
  isSaving = false;

  /**
   * This property is a reference to the 'Label' input field
   * in the right column.
   */
  @ViewChild('labelValue', { static: true })
  labelValueRef: ElementRef;

  /**
   * This property is a reference to the 'Text Colour' input field
   * in the right column.
   */
  @ViewChild('textColor', { static: true })
  textColorRef: ElementRef;

  /**
   * This property is a reference to the 'Border' input field
   * in the right column.
   */
  @ViewChild('borderColor', { static: true })
  borderColorRef: ElementRef;

  /**
   * This property is a reference to the 'Fill' input field
   * in the right column.
   */
  @ViewChild('fillColor', { static: true })
  fillColorRef: ElementRef;

  /**
   * This property is a reference to the main column HTML element.
   */
  @ViewChild('middleColumn', { static: true })
  middleColumnRef: ElementRef;

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
    this.shapes.push(shape);
    MainComponent.currentShapeIndex = this.shapes.length - 1;
  }

  constructor(
    private docServ: DocumentService,
    private authServ: AuthService,
    private route: ActivatedRoute,
    private router: Router,
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

  /**
   * This method is a lifecycle hook in which
   * any subscriptions are cleared.
   */
  ngOnDestroy(): void {
    MainComponent.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * This method is a lifecycle hook in which
   * all the shapes and documents are loaded from the database.
   * Also, all references get binded to their corresponding
   * HTML elements.
   */
  ngOnInit(): void {
    MainComponent.subscriptions.push(this.docServ.getDocs().subscribe((docs: object) => {
      this.docs = docs as Document[];
    }));

    MainComponent.subscriptions.push(this.route.params.subscribe((params: Params) => {
      if (params.docId) {
        this.docId = params.docId;

        MainComponent.subscriptions.push(this.docServ.getShapes(params.docId).subscribe((shapes: object) => {
          this.shapes = shapes as Shape[];
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
    if (this.docId.length === 0) {
      return;
    }

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

    console.log(this.docId);
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
      || this.docId.length === 0
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

  /**
   * This method gets called when the user
   * clicks on the delete text that is part of the
   * dropdown menu in the upper-right corner.
   * It calls the web request service to delete the currently
   * selected document.
   */
  btnDeleteOnClick(): void {
    MainComponent.subscriptions.push(
      this.docServ.deleteDocument(this.docId).subscribe((res: object) => {
        console.log(res);
        this.docId = '';
        this.router.navigateByUrl('/docs');
      })
    );
  }

  /**
   * This method gets called when the user clicks on the
   * "save icon" that is part of the top-level navbar.
   * It calls a web request service to
   * save all the shapes to the database.
   */
  btnSaveOnAction(): void {
    if (this.docId.length === 0) {
      return;
    }

    const allIds: string[] = [];
    let allShapes: Shape[] = [];

    this.isSaving = true;

    this.shapes.forEach(s => {
      if (s._id) { // This has an entry in the database.
        // console.log('PATCH ME');
        allIds.push(s._id);

        this.docServ.updateShape(
          this.docId,
          s._id,
          s.id,
          s.type,
          s.translateX,
          s.translateY,
          s.borderColor,
          s.label,
          s.backgroundColor,
          s.textColor,
        ).pipe(take(1)).subscribe((updatedShape) => {
          // console.log('UPDATED successfuly');
        });
      } else {
        // console.log('POST ME');
        this.docServ.createShape(
          this.docId,
          s.id,
          s.type,
          s.translateX,
          s.translateY,
          s.borderColor,
          s.label,
          s.backgroundColor,
          s.textColor,
        ).pipe(take(1)).subscribe((createdShape) => {
          // console.log('CREATED successfuly');
          const newShape = (createdShape as Shape);

          if (newShape._id) {
            allIds.push(newShape._id);
          }
        });
      }
    });

    setTimeout(() => {
      MainComponent.subscriptions.push(
        this.docServ.getShapes(this.docId).subscribe((shapes: object) => {
          allShapes = shapes as Shape[];
        })
      );
    }, 3000);

    setTimeout(() => {
      const dbIds = allShapes.map(s => s._id);

      allIds.forEach(id => {
        if (dbIds.includes(id)) {
          dbIds.splice(dbIds.indexOf(id), 1);
        }
      });

      // console.log('NOT IN DB:' + dbIds.length);

      dbIds.forEach(id => this.docServ.deleteShape(this.docId, id!).pipe(
        take(1)).subscribe((deletedShape) => {
          // console.log(deletedShape);
        }));

      this.isSaving = false;
    }, 4000);
  }

  /**
   * This method gets called when the user clicks on the
   * 'Log out' button that is part of the upper-right menu.
   * The local storage gets cleared, removing the tokens
   * and the user gets redirected to the 'Log in' page.
   */
  btnLogoutOnClick(): void {
    this.authServ.logout();
  }

  /**
   * This method gets called when the user clicks on the
   * 'Delete Account' button that the last option in the
   * upper-right menu.
   * The account and all associated documents and shapes
   * are removed from the database and the user gets
   * redirected to the 'Sign up' page.
   */
  btnDeleteAccountOnClick(): void {
    this.authServ.delete().pipe(take(1)).subscribe((res: any) => {
      console.log(res as HttpResponse<any>);
    });
    this.router.navigateByUrl('signup');
  }

  /**
   * This method redirects the user to the component
   * which holds the logic for the sharing functionality.
   *
   * @Note
   *     The redirection occurs only if the user has clicked
   *     on a document.
   */
  btnShareOnAction(): void {
    if (this.docId.length === 0) {
      return;
    }

    this.router.navigateByUrl(`/share-document/${this.docId}`);
  }
}
