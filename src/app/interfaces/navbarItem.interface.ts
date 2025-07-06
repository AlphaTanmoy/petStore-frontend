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
}