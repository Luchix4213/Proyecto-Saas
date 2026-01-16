export interface DashboardStats {
    sales: {
        total: number;
        growth: number;
        history: number[];
    };
    orders: {
        total: number;
        pending: number;
    };
    customers: {
        total: number;
        new: number;
    };
    products: {
        total: number;
        topSelling: string;
    };
    recentOrders: {
        id: string; // e.g. #ORD-001
        customer: string;
        items: number;
        total: number;
        status: string;
        date: string; // friendly string
    }[];
}
