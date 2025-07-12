import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
    PaginationResponse,
    NavbarItemResponse,
    NavbarListRequest,
    AddNavbarRequest,
    EditNavbarRequest,
    ApiResponse,
    IsParentMenuResponse
} from '../../interfaces/navbar.interface';
import { NAVBAR_LIST, NAVBAR_LIST_ADD, NAVBAR_LIST_EDIT, NAVBAR_LIST_DELETE, IS_PARENT_MENU, GET_ALL_PARENT_MENU, GET_NAVBAR_BY_ID } from '../../constants/api-endpoints';

interface TwoParameterDTO {
    firstParameter: string;
    secondParameter: string;
}

@Injectable({
    providedIn: 'root'
})
export class NavbarControlService {
    constructor(private http: HttpClient) { }

    getParentMenu(): Observable<ApiResponse<TwoParameterDTO[]>> {
        return this.http.get<ApiResponse<TwoParameterDTO[]>>(GET_ALL_PARENT_MENU);
    }

    getNavbarItems(params: Partial<NavbarListRequest> = {}): Observable<PaginationResponse<NavbarItemResponse>> {
        const defaultParams: NavbarListRequest = {
            queryString: '%',
            giveCount: false,
            giveData: true,
            considerMaxDateRange: false,
            applyParentSubMenuFilter: false,
            showSubMenusOnly: false,
            ...params
        };

        let httpParams = new HttpParams()
            .set('queryString', defaultParams.queryString || '%')
            .set('giveCount', String(defaultParams.giveCount))
            .set('giveData', String(defaultParams.giveData))
            .set('considerMaxDateRange', String(defaultParams.considerMaxDateRange))
            .set('applyParentSubMenuFilter', String(defaultParams.applyParentSubMenuFilter))
            .set('showSubMenusOnly', String(defaultParams.showSubMenusOnly));

        if (defaultParams.fromDate) {
            httpParams = httpParams.set('fromDate', defaultParams.fromDate);
        }
        if (defaultParams.toDate) {
            httpParams = httpParams.set('toDate', defaultParams.toDate);
        }
        if (defaultParams.dateRangeType) {
            httpParams = httpParams.set('dateRangeType', defaultParams.dateRangeType);
        }
        if (defaultParams.limit) {
            httpParams = httpParams.set('limit', defaultParams.limit.toString());
        }
        if (defaultParams.offsetToken) {
            httpParams = httpParams.set('offsetToken', defaultParams.offsetToken);
        }
        if (defaultParams.showInActive !== undefined) {
            httpParams = httpParams.set('showInActive', String(defaultParams.showInActive));
        }
        if (defaultParams.listOfRolesCanAccess && defaultParams.listOfRolesCanAccess.length > 0) {
            defaultParams.listOfRolesCanAccess.forEach(role => {
                httpParams = httpParams.append('listOfRolesCanAccess', role);
            });
        }

        return this.http.get<PaginationResponse<NavbarItemResponse>>(
            NAVBAR_LIST,
            { params: httpParams }
        );
    }

    getNavbarItemsByRole(role: string): Observable<PaginationResponse<NavbarItemResponse>> {
        return this.getNavbarItems({
            listOfRolesCanAccess: [role],
            giveCount: false,
            giveData: true
        });
    }

    getGuestNavbarItems(): Observable<PaginationResponse<NavbarItemResponse>> {
        return this.getNavbarItems({
            isVisibleToGuest: true,
            giveCount: false,
            giveData: true
        });
    }

    /**
     * Add a new navbar item
     * @param navbarData The navbar item data to add
     * @param authToken The authentication token
     * @returns Observable with the API response
     */
    addNavbarItem(navbarData: AddNavbarRequest): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(
            NAVBAR_LIST_ADD,
            navbarData
        );
    }

    /**
     * Edit an existing navbar item
     * @param navbarData The updated navbar item data
     * @param authToken The authentication token
     * @returns Observable with the API response
     */
    editNavbarItem(navbarData: EditNavbarRequest): Observable<ApiResponse<string>> {
        return this.http.put<ApiResponse<string>>(
            NAVBAR_LIST_EDIT,
            navbarData
        );
    }

    /**
     * Delete a navbar item by ID
     * @param id The ID of the navbar item to delete
     * @param authToken The authentication token
     * @returns Observable with the API response
     */
    deleteNavbar(id: string): Observable<ApiResponse<string>> {
        console.log('=== deleteNavbar called with ID:', id);
        
        // Log the full URL with query params
        const params = new HttpParams().set('id', id);
        const urlWithParams = `${NAVBAR_LIST_DELETE}?${params.toString()}`;
        console.log('=== Full URL:', urlWithParams);
        
        // Prepare request options
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            params: new HttpParams().set('id', id)
        };
        
        console.log('=== Request options:', {
            url: NAVBAR_LIST_DELETE,
            method: 'POST',
            body: { id },
            headers: options.headers.keys().reduce((acc, key) => ({
                ...acc,
                [key]: options.headers.getAll(key)
            }), {}),
            params: options.params.keys().reduce((acc, key) => ({
                ...acc,
                [key]: options.params.getAll(key)
            }), {})
        });
        
        // Create the observable but don't subscribe yet
        const request$ = this.http.post<ApiResponse<string>>(
            NAVBAR_LIST_DELETE,
            { id },
            options
        );
        
        // Log when the request is actually made
        console.log('=== Creating HTTP request observable');
        
        return request$.pipe(
            tap({
                subscribe: () => console.log('=== Request subscribed'),
                next: (response: ApiResponse<string>) => {
                    console.log('=== Delete API SUCCESS:', response);
                },
                error: (error: any) => {
                    console.error('=== Delete API ERROR:', {
                        status: error.status,
                        statusText: error.statusText,
                        error: error.error,
                        message: error.message,
                        url: error.url
                    });
                },
                complete: () => console.log('=== Delete API completed')
            })
        );
    }

    /**
     * Check if a menu item is a parent menu
     * @param id The ID of the menu item to check
     * @param authToken The authentication token
     * @returns Observable with the API response containing parent menu information
     */
    isParentMenu(id: string): Observable<ApiResponse<IsParentMenuResponse>> {
        return this.http.post<ApiResponse<IsParentMenuResponse>>(
            IS_PARENT_MENU,
            { id }, // Send as JSON object in request body
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }

    /**
     * Get a navbar item by its ID
     * @param id The ID of the navbar item to retrieve
     * @returns Observable with the API response containing the navbar item
     */
    getNavbarItemById(id: string): Observable<ApiResponse<NavbarItemResponse>> {
        return this.http.get<ApiResponse<NavbarItemResponse>>(
            `${GET_NAVBAR_BY_ID}/${id}`,
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}
