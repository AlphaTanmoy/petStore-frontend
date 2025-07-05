import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = '#ff6b6b';
  @Input() message: string = 'Loading...';
  @Input() showMessage: boolean = true;

  get loaderClasses() {
    return {
      'loader': true,
      'small': this.size === 'small',
      'medium': this.size === 'medium',
      'large': this.size === 'large'
    };
  }
}
