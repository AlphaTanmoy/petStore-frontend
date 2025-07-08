import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export function authInterceptor(
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {
  const token = sessionStorage.getItem('jwt');

  if (token) {
    request = request.clone({
      setHeaders: {
        'Alpha': `Alpha ${token}`
      }
    });
  }

  return next(request);
}
