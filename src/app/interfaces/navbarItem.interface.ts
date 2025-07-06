export interface NavbarItem {
    id: string;
    createdDate: string;
    menuName: string;
    path: string;
    doHaveRedirectionLink: boolean;
    menuLink: string | null;
    svgFileDataLink: string;
    icon?: string;
    listOfSubMenu?: NavbarItem[]; 
    isExpanded?: boolean;
    isActive?: boolean;
    alwaysShow?: boolean; 
    clickHandler?: (event: Event) => void;
}