export interface Product {
    _id: string;
    product_group: string;
    name: string;
    code: string;
    type: string;
    price: string;
    price_oro: number;
    price_plata: number;
    price_bronce: number;
    available: boolean;
    created_at: string;
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

