import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    PaginationResponse,
    NavbarItemResponse,
    NavbarListRequest,
    AddNavbarRequest,
    EditNavbarRequest,
    ApiResponse,
    IsParentMenuResponse
} from '../interfaces/navbar.interface';
import { NAVBAR_LIST, NAVBAR_LIST_ADD, NAVBAR_LIST_EDIT, NAVBAR_LIST_DELETE, IS_PARENT_MENU } from '../constants/api-endpoints';

@Injectable({
    providedIn: 'root'
})
export class NavbarControlService {
    constructor(private http: HttpClient) { }

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
        return this.http.post<ApiResponse<string>>(
            NAVBAR_LIST_DELETE,
            `"${id}"`, // Send as JSON string
            {
                params: { id } // Also send as query parameter if needed by the API
            }
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
            `"${id}"`, // Send as JSON string
            {
                params: { id } // Also send as query parameter if needed by the API
            }
        );
    }
}
