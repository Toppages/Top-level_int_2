export interface PurchaseLimit {
    name: string;
    limit: number;
    price: number;
    originLimit: number;
}

export interface VendedoresgenerarpinsProps {
    user: {
        _id: string;
        name: string;
        email: string;
        rango: string;
        role: string;
        saldo: number;
        handle: string;
        purchaseLimits?: Record<string, PurchaseLimit>;
    } | null;
}

export interface Pin {
    serial: string;
    key: string;
    usado: boolean;
    productName: string;
    _id: {
        $oid: string;
    };
}

export interface Report {
    _id: {
        $oid: string;
    };
    user: {
        handle: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    product: string;
    productName: string;
    totalPrice: number;
    moneydisp: number;
    status: string;
    order_id: string;
    pins: Pin[];
    created_at: Date;
    saleId: number;
    __v: number;
}

export interface ReportSummary {
    totalKeys: number;
    usedKeys: number;
    unusedKeys: number;
    productSummary: { [key: string]: { total: number; unused: number } };
}

export interface Product {
    inventario: any;
    limit: any;
    _id: string;
    product_group: string;
    name: string;
    code: string;
    type: string;
    price: number;
    pricebs: number;
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
    role: "admin" | "vendedor" | "cliente" | "master";
    saldo: number;
    rango: string;
}

export interface NavLinksProps {
    active: number;
    setActiveLink: (index: number) => void;
    handleLogout: () => void;
}
