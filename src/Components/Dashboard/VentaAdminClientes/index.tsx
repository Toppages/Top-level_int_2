import axios from 'axios';
import SalesPDF from './SalesPDF';
import { Report } from '../../../types/types';
import { useMediaQuery } from "@mantine/hooks";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useEffect, useState } from 'react';
import { IconCalendarSearch, IconFileTypePdf } from '@tabler/icons-react';
import { DatePicker, DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import { Select, ScrollArea, Card, Group, Title, Text, MultiSelect, Divider, Badge, Button } from '@mantine/core';
interface VentaAdminClientesProps {
    userHandle: string;
}
function VentaAdminClientes({ userHandle }: VentaAdminClientesProps) {

    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [sales, setSales] = useState<Report[]>([]);
    const [totalVentas, setTotalVentas] = useState(0);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [filteredSales, setFilteredSales] = useState<Report[]>([]);
    const [productSummary, setProductSummary] = useState<Map<string, { count: number; totalPrice: number }>>(new Map());
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangePickerValue>([null, null]);
    const [precioTotalVentas, setPrecioTotalVentas] = useState(0);
    const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
    const maxHeight = isSmallScreen ? windowHeight * 0.9 : windowHeight - 70;

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);



    }, []);
    const productOrder = [
        "Free Fire 100 Diamantes + 10 Bono",
        "Free Fire - 310 Diamantes + 31 Bono",
        "Free Fire 520 Diamantes + 52 Bono",
        "Free Fire - 1060 Diamantes + 106 Bono",
        "Free Fire - 2.180 Diamantes + 218 Bono",
        "Free Fire - 5.600 Diamantes + 560 Bono"
    ];

    const sortedProductSummary = Array.from(productSummary.entries()).sort((a, b) => {
        return productOrder.indexOf(a[0]) - productOrder.indexOf(b[0]);
    });
    useEffect(() => {
        setTotalVentas(filteredSales.length);
        setPrecioTotalVentas(filteredSales.reduce((sum, sale) => sum + sale.totalPrice, 0));
    }, [filteredSales]);



    useEffect(() => {
        const fetchSales = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No se encontró el token. Inicia sesión nuevamente.');
                return;
            }

            try {
                const response = await axios.get<Report[]>(`${import.meta.env.VITE_API_BASE_URL}/sales/admin/${userHandle}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setSales(response.data);

                const uniqueUsers = response.data.reduce((acc: Record<string, Report['user']>, report) => {
                    if (report.user && !acc[report.user.handle]) {
                        acc[report.user.handle] = report.user;
                    }
                    return acc;
                }, {});

                const userOptions = Object.values(uniqueUsers).map(user => ({
                    value: user.handle,
                    label: user.handle,
                }));

                setUsers([{ value: 'all', label: 'Todas las ventas' }, ...userOptions]);
                setFilteredSales(response.data);
            } catch (err) {
                setError('Error al obtener los usuarios de las ventas.');
            }
        };

        fetchSales();
    }, []);

    useEffect(() => {
        let filtered = sales;
        if (selectedUsers.length > 0 && !selectedUsers.includes('all')) {
            filtered = filtered.filter(sale => selectedUsers.includes(sale.user?.handle ?? ''));
        }

        if (selectedDateFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            filtered = filtered.filter(sale => {
                const saleDate = new Date(sale.created_at);
                saleDate.setHours(0, 0, 0, 0);

                return saleDate.getTime() === today.getTime();
            });
        }

        if (selectedDateFilter === 'specific' && selectedDate) {
            const selectedDay = new Date(selectedDate);
            selectedDay.setHours(0, 0, 0, 0);

            filtered = filtered.filter(sale => {
                const saleDate = new Date(sale.created_at);
                saleDate.setHours(0, 0, 0, 0);

                return saleDate.getTime() === selectedDay.getTime();
            });
        }

        if (selectedDateFilter === 'range' && selectedDateRange[0] && selectedDateRange[1]) {
            const startDate = new Date(selectedDateRange[0]);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(selectedDateRange[1]);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(sale => {
                const saleDate = new Date(sale.created_at);
                return saleDate >= startDate && saleDate <= endDate;
            });
        }

        setFilteredSales(filtered);
    }, [selectedUsers, selectedDateFilter, selectedDate, selectedDateRange, sales]);

    useEffect(() => {
        updateProductSummary(filteredSales);
    }, [filteredSales]);

    const updateProductSummary = (sales: Report[]) => {
        const summary = new Map<string, { count: number; totalPrice: number }>();

        sales.forEach(sale => {
            const productName = sale.productName;
            const existing = summary.get(productName) || { count: 0, totalPrice: 0 };
            existing.count += 1;
            existing.totalPrice += sale.totalPrice;
            summary.set(productName, existing);
        });

        setProductSummary(summary);
    };

    return (
        <>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <ScrollArea style={{ height: maxHeight - 50 }}>
                <Title mt={5} order={3}> Resumen de Ventas</Title>
                <Group position='apart'>

                    <Text fz="lg" c="gray" fw={500}>Visualiza y filtra las ventas de productos</Text>
                    {filteredSales.length > 0 && (
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <PDFDownloadLink
                                document={<SalesPDF filteredSales={filteredSales} totalVentas={totalVentas} precioTotalVentas={precioTotalVentas} />}
                                fileName="ventas top level.pdf"
                                style={{ textDecoration: 'none' }}
                            >
                                {({ loading }) => (
                                    <Button leftIcon={<IconFileTypePdf />} style={{ background: '#0c2a85', color: 'white' }} size="md">
                                        {loading ? 'Generando PDF...' : 'Descargar PDF'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    )}
                </Group>
                <MultiSelect
                    label={<Text fz="lg" c="black" fw={500}>Selecciona usuarios</Text>}
                    placeholder="Elige usuarios"
                    data={users}
                    searchable
                    value={selectedUsers}
                    onChange={setSelectedUsers}
                    radius="md"
                    size="md"
                />

                <Select
                    label={<Text fz="lg" c="black" fw={500}>Selecciona un filtro de fecha</Text>}
                    placeholder="Elige una opción"
                    radius="md"
                    mb={10}
                    size="md"
                    icon={<IconCalendarSearch color='#0c2a85' stroke={2} />}
                    data={[
                        { value: 'all', label: 'Todas las ventas' },
                        { value: 'today', label: 'Hoy' },
                        { value: 'specific', label: 'Día en específico' },
                        { value: 'range', label: 'Rango de días' },
                    ]}
                    value={selectedDateFilter}
                    onChange={(value) => setSelectedDateFilter(value ?? 'all')}
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

                {selectedDateFilter === 'specific' && (
                    <DatePicker
                        placeholder="Selecciona una fecha"
                        label="Fecha específica"
                        value={selectedDate}
                        radius="md"
                        size="md"
                        mb={10}
                        dropdownType="modal"
                        onChange={setSelectedDate}
                    />
                )}

                {selectedDateFilter === 'range' && (
                    <DateRangePicker
                        label="Rango de fechas"
                        placeholder="Selecciona el rango"
                        value={selectedDateRange}
                        onChange={setSelectedDateRange}
                        radius="md"
                        mb={10}
                        dropdownType="modal"
                        size="md"
                    />
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {filteredSales.length === 0 ? (
                        <p>No hay ventas para mostrar.</p>
                    ) : (
                        <>
                            <Card
                                style={{
                                    background: "linear-gradient(9deg, rgba(2,0,36,1) 0%, rgba(12,42,133,1) 100%)",
                                }}
                                shadow="sm"
                                p="lg"
                                radius="md"
                                withBorder
                            >

                                <Group position="apart">
                                    <Title c='white' order={4}>Total de Ventas</Title>
                                    <Group>

                                        <Text fz="xl" c='white' fw={700}>{totalVentas} ventas</Text>
                                        <Text fz="xl" c="green" fw={700}>${precioTotalVentas.toFixed(2)}</Text>
                                    </Group>
                                </Group>
                            </Card>

                            <Title mt={15} order={4}>Resumen de productos:</Title>
                            {sortedProductSummary.map(([productName, { count, totalPrice }]) => (
                                <Card shadow="sm" p="lg" radius="md" withBorder key={productName}>
                                    <Group position="apart">
                                        <Title order={5}>{productName}</Title>
                                        <Text fz="xl" c="#0c2a85" fw={700}>{count} Ventas</Text>
                                        <Text fz="xl" c="green" fw={700}>${totalPrice.toFixed(2)}</Text>
                                    </Group>
                                </Card>
                            ))}

                        </>
                    )}
                </div>
                {(selectedUsers.length === 0 || (selectedUsers.length > 1 && !selectedUsers.includes('all'))) && (
                    <>
                        <Title mt={15} order={4}>Ventas por usuario:</Title>
                        {users.slice(1).map(user => {
                            const ventasUsuario = filteredSales.filter(sale => sale.user?.handle === user.value);

                            if (ventasUsuario.length === 0) return null;

                            const resumenPorProducto = ventasUsuario.reduce((acc: Record<string, { count: number; totalPrice: number }>, sale) => {
                                if (!acc[sale.productName]) {
                                    acc[sale.productName] = { count: 0, totalPrice: 0 };
                                }
                                acc[sale.productName].count += 1;
                                acc[sale.productName].totalPrice += sale.totalPrice;
                                return acc;
                            }, {} as Record<string, { count: number; totalPrice: number }>);

                            const totalUsuario = ventasUsuario.reduce((sum, sale) => sum + sale.totalPrice, 0);

                            return (
                                <Card mt={10} shadow="sm" p="lg" radius="md" withBorder key={user.value}>
                                    <Group position="apart">
                                        <Title order={5}>{user.label}</Title>
                                        <Group>
                                            <Badge fz="md" color="gray">Total de ventas: {ventasUsuario.length}</Badge>
                                            <Text fz="xl" c="green" fw={700}>${totalUsuario.toFixed(2)}</Text>
                                        </Group>
                                    </Group>
                                    <Divider my={10} />
                                    <Title order={6} mt={10}>Resumen por producto:</Title>
                                    {Object.entries(resumenPorProducto)
                                        .sort(([productA], [productB]) => productOrder.indexOf(productA) - productOrder.indexOf(productB))
                                        .map(([product, data]) => (
                                            <Card key={product} shadow="xs" p="md" radius="md" withBorder mt={10}>
                                                <Group position="apart">
                                                    <Text fz="md">{product}</Text>
                                                    <Group>
                                                        <Text fz="xl" c="#0c2a85" fw={700}>{data.count} <strong>Ventas</strong></Text>
                                                        <Text fz="xl" c="green" fw={700}> ${data.totalPrice.toFixed(2)}</Text>
                                                    </Group>
                                                </Group>
                                            </Card>
                                        ))}
                                </Card>
                            );
                        })}
                    </>
                )}

            </ScrollArea>
        </>
    );
}

export default VentaAdminClientes;