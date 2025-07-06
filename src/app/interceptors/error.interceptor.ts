import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

export function errorInterceptor(
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we have a response with an error object, return it as-is
      if (error.error && typeof error.error === 'object') {
        // Ensure we have a consistent error structure
        const apiError = {
          status: error.status < 200 || error.status >= 300 ? false : true,
          errorMessage: error.error.errorMessage || error.error.message || 'An error occurred',
          details: error.error.details || error.url,
          errorCode: error.error.errorCode || error.status.toString(),
          errorType: error.error.errorType || 'API Error',
          timeStamp: error.error.timeStamp || new Date().toISOString(),
          // Include original error for debugging
          originalError: (process as any)['env']?.['NODE_ENV'] === 'development' ? error : undefined
        };
        return throwError(() => apiError);
      }

      // For client-side errors
      if (error.error instanceof ErrorEvent) {
        console.error('Client-side error:', error.error.message);
        return throwError(() => ({
          status: false,
          errorMessage: 'A client-side error occurred',
          details: error.error.message,
          errorCode: 'CLIENT_ERROR',
          errorType: 'Client Error',
          timeStamp: new Date().toISOString()
        }));
      }

      // For server-side errors
      let errorMessage = 'An unknown error occurred';
      
      // Handle different HTTP status codes
      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case HttpStatusCode.Forbidden:
          errorMessage = 'You do not have permission to access this resource';
          break;
        case HttpStatusCode.NotFound:
          errorMessage = 'The requested resource was not found';
          break;
        case HttpStatusCode.InternalServerError:
          errorMessage = 'Internal server error. Please try again later.';
          break;
        case 0:
          // Typically indicates a network error
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          break;
      }

      // Create a consistent error object for server errors
      const serverError = {
        status: false,
        errorMessage: errorMessage,
        details: error.message || error.url,
        errorCode: error.status?.toString() || 'SERVER_ERROR',
        errorType: 'Server Error',
        timeStamp: new Date().toISOString()
      };

      console.error('Server error:', serverError);
      return throwError(() => serverError);
    }),
    finalize(() => {
      // Any finalization logic here
    })
  );
}
