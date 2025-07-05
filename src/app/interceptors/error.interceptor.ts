import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export function errorInterceptor(
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = error.error.message || 'Server Error';

        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            localStorage.removeItem('token');
            window.location.href = '/login';
            break;
          case HttpStatusCode.Forbidden:
            console.error('Access Forbidden');
            break;
          case HttpStatusCode.NotFound:
            console.error('Resource Not Found');
            break;
        }
      }

      console.error(errorMessage);

      return throwError(() => new Error(errorMessage));
    }),
    finalize(() => {
    })
  );
}
