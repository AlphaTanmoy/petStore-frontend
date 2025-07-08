import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, timer } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() color: string = '#ff6b6b';
  @Input() message: string = 'Loading...';
  @Input() showMessage: boolean = true;
  @Input() minDuration: number = 4500;
  
  private destroy$ = new Subject<void>();
  isVisible = false;
  private startTime: number = 0;

  ngOnInit(): void {
    this.startTime = Date.now();
    this.isVisible = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Input() set showLoader(show: boolean) {
    if (show) {
      this.startTime = Date.now();
      this.isVisible = true;
    } else {
      const elapsed = Date.now() - this.startTime;
      const remainingTime = Math.max(0, this.minDuration - elapsed);
      
      timer(remainingTime).pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.isVisible = false;
      });
    }
  }

  get loaderClasses() {
    return {
      'loader': true,
      'small': this.size === 'small',
      'medium': this.size === 'medium',
      'large': this.size === 'large'
    };
  }
}
