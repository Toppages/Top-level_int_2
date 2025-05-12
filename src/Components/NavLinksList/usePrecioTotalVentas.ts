import { useEffect, useState } from 'react';
import axios from 'axios';
import { Report } from '../../types/types';

export function usePrecioTotalVentas(userHandle: string) {
    const [precioTotalVentas, setPrecioTotalVentas] = useState<number>(0);

    useEffect(() => {
        const fetchSales = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const { data } = await axios.get<Report[]>(`${import.meta.env.VITE_API_BASE_URL}/sales/user/${userHandle}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const total = data.reduce((sum, sale) => sum + sale.totalPrice, 0);
                setPrecioTotalVentas(total);
            } catch (error) {
                console.error('Error al obtener ventas:', error);
            }
        };

        fetchSales(); // Fetch immediately

        // Set an interval to fetch every 5 seconds
        const intervalId = setInterval(fetchSales, 5000);

        return () => clearInterval(intervalId); // Cleanup on component unmount
    }, [userHandle]); // Only re-run when userHandle changes

    return precioTotalVentas;
}
