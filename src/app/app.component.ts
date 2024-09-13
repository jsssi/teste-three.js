import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModelViewerComponent } from "./app-3-d-component/app-3-d-component.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ModelViewerComponent],
  template: `
   <router-outlet>
   <app-model-viewer></app-model-viewer>
   <router-outlet />`

})
export class AppComponent {
  title = '3dProject';
}
