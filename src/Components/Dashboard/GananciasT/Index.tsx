import { useState, useEffect } from 'react';
import axios from 'axios';
import { Select, Table, Title } from '@mantine/core';
import { DateRangePicker, DatePicker } from '@mantine/dates';

const extractDiamantes = (productName: string) => {
    let cleanName = productName.replace(/Free Fire\s*-*\s*/i, "").trim();
    const match = cleanName.match(/^(\d{1,3}(?:\.\d{3})*|\d+)\s*Diamantes/);
    return match ? `${match[1]} Diamantes` : cleanName;
};

function GananciasT() {
    const [clients, setClients] = useState<{ value: string; label: string }[]>([]);
    const [sales, setSales] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedClientHandle, setSelectedClientHandle] = useState<string | null>(null);
    const [filterOption, setFilterOption] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/clients`)
            .then((response) => {
                const formattedClients = response.data.map((client: { _id: string; handle: string; name: string }) => ({
                    value: client.handle,
                    label: client.name
                }));
                setClients(formattedClients);
            })
            .catch((error) => console.error('Error al obtener los clientes:', error));
    }, []);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`)
            .then((response) => {
                setProducts(response.data);
            })
            .catch((error) => console.error('Error al obtener los productos:', error));
    }, []);

    useEffect(() => {
        if (selectedClientHandle) {
            let url = `${import.meta.env.VITE_API_BASE_URL}/sales/user/${selectedClientHandle}`;

            if (filterOption === 'ventas de hoy') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayString = today.toISOString().split('T')[0];
                url += `?date=${todayString}`;
            } else if (filterOption === 'ventas de un dia en especifico' && selectedDate) {
                const selectedDay = new Date(selectedDate);
                selectedDay.setHours(0, 30, 0, 0);
                const selectedDayStartString = selectedDay.toISOString();

                const selectedDayEnd = new Date(selectedDate);
                selectedDayEnd.setHours(23, 59, 59, 999);
                const selectedDayEndString = selectedDayEnd.toISOString();

                url += `?start=${selectedDayStartString}&end=${selectedDayEndString}`;
            } else if (filterOption === 'rango de dia' && dateRange[0] && dateRange[1]) {
                const start = new Date(dateRange[0]);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateRange[1]);
                end.setHours(23, 59, 59, 999);

                url += `?start=${start.toISOString()}&end=${end.toISOString()}`;
            }

            axios.get(url)
                .then((response) => {
                    const filteredSales = response.data.filter((sale: any) => {
                        const saleDate = new Date(sale.created_at);

                        if (filterOption === 'ventas de un dia en especifico' && selectedDate) {
                            const selectedDay = new Date(selectedDate);
                            selectedDay.setHours(0, 30, 0, 0);
                            const start = selectedDay.getTime();
                            const selectedDayEnd = new Date(selectedDate);
                            selectedDayEnd.setHours(23, 59, 59, 999);
                            const end = selectedDayEnd.getTime();
                            const saleTimestamp = saleDate.getTime();
                            return saleTimestamp >= start && saleTimestamp <= end;
                        }

                        if (filterOption === 'ventas de hoy') {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return saleDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
                        }

                        if (filterOption === 'rango de dia' && dateRange[0] && dateRange[1]) {
                            const start = new Date(dateRange[0]);
                            const end = new Date(dateRange[1]);
                            return saleDate >= start && saleDate <= end;
                        }

                        return true;
                    });

                    setSales(filteredSales);
                })
                .catch((error) => {
                    console.error('Error al obtener las ventas:', error);
                    setSales([]); // Asegura que el componente diga "sin ventas"
                });
        }
    }, [selectedClientHandle, filterOption, selectedDate, dateRange]);

    const groupedSales = sales.reduce((acc, sale) => {
        const { productName, quantity, totalPrice } = sale;

        const product = products.find((prod: any) => prod.name === productName);
        const productPrice = product ? product.price : 0;

        const cleanedProductName = extractDiamantes(productName);

        if (!acc[cleanedProductName]) {
            acc[cleanedProductName] = { productName: cleanedProductName, quantity: 0, totalPrice: 0, price: productPrice };
        }

        acc[cleanedProductName].quantity += quantity;
        acc[cleanedProductName].totalPrice += totalPrice;

        return acc;
    }, {});

    const rows = Object.values(groupedSales).map((sale: any) => {
        const totalToplevel = (sale.price * sale.quantity);
        const totalUsuario = sale.totalPrice;
        const ganancia = totalUsuario - totalToplevel;
    
        return (
            <tr key={sale.productName}>
                <td style={{ textAlign: 'center' }}>{sale.productName}</td>
                <td style={{ textAlign: 'center' }}>{sale.quantity}</td>
                <td style={{ textAlign: 'center' }}>{totalToplevel.toFixed(3)} USD</td>
                {!['topleveldetal'].includes(selectedClientHandle ?? '') && (
                    <>
                        <td style={{ textAlign: 'center' }}>{totalUsuario.toFixed(3)} USD</td>
                        <td style={{ textAlign: 'center' }}>{ganancia.toFixed(3)} USD</td>
                    </>
                )}
            </tr>
        );
    });
    
    

    const totalGanancia = Object.values(groupedSales).reduce((total: number, sale: any) => {
        const totalToplevel = sale.price * sale.quantity;
        const totalUsuario = sale.totalPrice;
        const ganancia = totalUsuario - totalToplevel;
    
        if (selectedClientHandle === 'topleveldetal') {
            return total + totalToplevel;
        }
    
        return total + ganancia;
    }, 0);
    

    return (
        <div>
            <Select
                label="Selecciona un cliente"
                placeholder="Elige un cliente"
                data={clients}
                searchable
                clearable
                onChange={(value) => setSelectedClientHandle(value)}
                transition="pop-top-left"
                transitionDuration={80}
                transitionTimingFunction="ease"
                styles={() => ({
                    item: {
                        '&[data-selected]': {
                            '&, &:hover': {
                                backgroundColor: '#0c2a85',
                                color: 'white',
                            },
                        },
                    },
                })}
            />

            <Select
                label="Selecciona un filtro de ventas"
                placeholder="Elige un filtro"
                data={[
                    { value: 'ventas generales', label: 'Ventas Generales' },
                    { value: 'ventas de hoy', label: 'Ventas de Hoy' },
                    { value: 'ventas de un dia en especifico', label: 'Ventas de un Día Específico' },
                    { value: 'rango de dia', label: 'Rango de Día' },
                ]}
                onChange={(value) => setFilterOption(value)}
                clearable
                transition="pop-top-left"
                transitionDuration={80}
                transitionTimingFunction="ease"
                styles={() => ({
                    item: {
                        '&[data-selected]': {
                            '&, &:hover': {
                                backgroundColor: '#0c2a85',
                                color: 'white',
                            },
                        },
                    },
                })}
            />

            {filterOption === 'ventas de un dia en especifico' && (
                <DatePicker
                    label="Selecciona una fecha"
                    placeholder="Pick a date"
                    value={selectedDate}
                    onChange={(date) => {
                        setSelectedDate(date);
                    }}
                    withAsterisk
                />
            )}

            {filterOption === 'rango de dia' && (
                <DateRangePicker
                    label="Selecciona un rango de fechas"
                    placeholder="Pick dates range"
                    value={dateRange}
                    onChange={(range) => {
                        setDateRange(range);
                    }}
                    withAsterisk
                />
            )}

            {selectedClientHandle && sales.length > 0 && (
                <div>
                    <Title order={2}>Ganancias de  {selectedClientHandle}</Title>
                    <Table mt={10} striped highlightOnHover withBorder withColumnBorders>
                    <thead style={{ background: '#0c2a85' }}>
    <tr>
        <th style={{ textAlign: 'center', color: 'white' }}>Producto</th>
        <th style={{ textAlign: 'center', color: 'white' }}>Cantidad</th>
        <th style={{ textAlign: 'center', color: 'white' }}>Total Toplevel</th>
        {!['topleveldetal'].includes(selectedClientHandle) && (
            <>
                <th style={{ textAlign: 'center', color: 'white' }}>Total usuario</th>
                <th style={{ textAlign: 'center', color: 'white' }}>Ganancia Producto</th>
            </>
        )}
    </tr>
</thead>

                        <tbody>
                            {rows}
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold' }}>Total Ganancia</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalGanancia.toFixed(3)}  USD</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}
            {selectedClientHandle && sales.length === 0 && (
                <p>Sin ventas registradas.</p>
            )}

        </div>
    );
}

export default GananciasT;
