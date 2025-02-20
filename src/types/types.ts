export interface Product {
    product_group: string;
    code: string;
    name: string;
    price: string;
}

export interface UserData {
    _id: string;
    handle: string;
    name: string;
    email: string;
    role: "admin" | "vendedor" | "cliente";
    saldo: number;
}

export interface NavLinksProps {
    active: number;
    setActiveLink: (index: number) => void;
    handleLogout: () => void;
}

