export interface NavbarItem {
    id: string;
    createdDate: string;
    menuName: string;
    doHaveRedirectionLink: boolean;
    menuLink: string | null;
    svgFileDataLink: string;
    listOfSubMenu?: NavbarItem[]; // Made optional with ?
    isExpanded?: boolean;
    isActive?: boolean;
    alwaysShow?: boolean; // If true, this item will always be shown regardless of auth state
    clickHandler?: (event: Event) => void;
}