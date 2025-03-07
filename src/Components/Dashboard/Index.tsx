import { useEffect, useState } from "react";
import axios from "axios";
import AdminBR from "./AdminBR";
import ManagePro from "./ManagePro";
import Registrar from "./Registrar/Index";
import EditClient from "./EditClient/Index";
import UserCountsDisplay from "./UserCountsDisplay/Index";
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarWeek, IconMessageCircle, IconPhoto } from "@tabler/icons-react";
import { Group, ScrollArea, Select, Tabs, Title } from "@mantine/core";
import { BarChart } from '@mui/x-charts/BarChart';

interface DashboardProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
}

function Dashboard({ user }: DashboardProps) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [selectedRange, setSelectedRange] = useState<string>("general");
    const [sales, setSales] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

    const onBalanceUpdate = (newBalance: number) => {
        console.log('Nuevo saldo:', newBalance);
    };

    useEffect(() => {
        if (user) {
            fetch("http://localhost:4000/user", {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserRole(data.role);
                    fetchSales(data.handle, data.role);
                })
                .catch((err) => console.error("Error al obtener el usuario:", err));
        }
    }, [user, selectedRange, selectedDate]);

    const fetchSales = async (userHandle: string, userRole: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No se encontró el token. Inicia sesión nuevamente.');
            return;
        }

        try {
            const url = userRole === 'master'
                ? 'http://localhost:4000/sales'
                : `http://localhost:4000/sales/user/${userHandle}`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            let filteredSales = response.data;

            if (!Array.isArray(filteredSales)) {
                setError('La respuesta del servidor no es válida.');
                return;
            }

            const formatDate = (dateString: string) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return null;
                return date.toLocaleDateString('en-CA');
            };

            const today = new Date().toLocaleDateString('en-CA');

            if (selectedRange === "hoy") {
                filteredSales = filteredSales.filter((sale: any) => {
                    const saleDate = sale.created_at ? formatDate(sale.created_at) : null;
                    return saleDate === today;
                });
            } else if (selectedRange === "custom" && selectedDate) {
                const selectedDay = selectedDate.toLocaleDateString('en-CA');
                filteredSales = filteredSales.filter((sale: any) => {
                    const saleDate = sale.created_at ? formatDate(sale.created_at) : null;
                    return saleDate === selectedDay;
                });
            } else if (selectedRange === "semana") {
                const now = new Date();
                const dayOfWeek = now.getDay();
                const monday = new Date(now);
                monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                filteredSales = filteredSales.filter((sale: any) => {
                    const saleDate = sale.created_at ? new Date(sale.created_at) : null;
                    return saleDate && saleDate >= monday && saleDate <= sunday;
                });

                const weekSales: Record<"Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo", number> = {
                    "Lunes": 0,
                    "Martes": 0,
                    "Miércoles": 0,
                    "Jueves": 0,
                    "Viernes": 0,
                    "Sábado": 0,
                    "Domingo": 0,
                };

                filteredSales.forEach((sale: any) => {
                    const saleDate = new Date(sale.created_at);
                    const dayNames: Array<keyof typeof weekSales> = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                    const dayName = dayNames[saleDate.getDay()];

                    weekSales[dayName]++; 
                });

                const totalSales = Object.values(weekSales).reduce((acc, count) => acc + count, 0);

                const weekSalesData = Object.entries(weekSales).map(([day, count]) => ({
                    day,
                    count,
                }));

                setSales(weekSalesData);
                setTotalSales(totalSales);
                return;
            }

            setSales(filteredSales);
        } catch (err) {
            setError('Hubo un problema al obtener las ventas.');
        }
    };
    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
    };

    const salesByProduct = sales.reduce((acc, sale) => {
        acc[sale.productName] = (acc[sale.productName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const extractDiamantes = (productName: string) => {
        const match = productName.match(/(\d+)\s*Diamantes/);
        return match ? `${match[1]} Diamantes` : productName;
    };

    const productNames = Object.keys(salesByProduct).map(extractDiamantes);
    const salesData = Object.values(salesByProduct) as (number | null)[];

    return (
        <>
            <ScrollArea style={{ height: windowHeight - 70 }} type="never">

                {userRole === "master" && user && (
                    <UserCountsDisplay token={localStorage.getItem("token")} />
                )}

                <Tabs defaultValue="Ventas">
                    <Tabs.List>
                        <Tabs.Tab value="Ventas" icon={<IconPhoto size={14} />}>Ventas</Tabs.Tab>
                        <Tabs.Tab value="Pines" icon={<IconMessageCircle size={14} />}>Pines</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="Ventas" pt="xs">
                        <div>

                            <Select
                                label="Selecciona el rango de fecha"
                                radius="md"
                                icon={<IconCalendarWeek />}
                                size="lg"
                                transition="pop-top-left"
                                transitionDuration={80}
                                transitionTimingFunction="ease"
                                value={selectedRange}
                                onChange={(value) => setSelectedRange(value || "general")}
                                data={[
                                    { value: "general", label: "General (todas las ventas)" },
                                    { value: "hoy", label: "Día de hoy" },
                                    { value: "semana", label: "Esta semana" },
                                    { value: "mes", label: "Este mes" },
                                    { value: "año", label: "Este año" },
                                    { value: "custom", label: "Elegir día" },
                                ]}
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

                            {selectedRange === "custom" && (
                                <DatePicker
                                    label="Selecciona un día"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                />
                            )}

                            {sales.length > 0 ? (
                                <div>
                                    <Title mt={5} ta="center" weight={700} mb="sm" order={2}>
                                        Total de Ventas: {selectedRange === "semana" ? totalSales : sales.length}
                                    </Title>

                                    <Title mt={5} weight={700} mb="sm" order={4}>Ventas por Producto</Title>

                                    {selectedRange === "semana" ? (
                                        <BarChart
                                            width={500}
                                            height={300}
                                            series={[{ data: sales.map((item: any) => item.count), id: 'salesId', color: '#0c2a85' }]}
                                            xAxis={[{ data: sales.map((item: any) => item.day), scaleType: 'band' }]}
                                        />
                                    ) : (
                                        <BarChart
                                            width={500}
                                            height={300}
                                            series={[{ data: salesData, id: 'salesId', color: '#0c2a85' }]}
                                            xAxis={[{ data: productNames, scaleType: 'band' }]}
                                        />
                                    )}
                                </div>
                            ) : (
                                <p>{error ? error : 'No hay ventas disponibles.'}</p>
                            )}

                        </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="Pines" pt="xs">
                        Pines pronto
                    </Tabs.Panel>

                </Tabs>

                {(userRole === "master" || userRole === "admin") && (
                    <Group>
                        <EditClient user={user} onBalanceUpdate={onBalanceUpdate} />
                        <Registrar />
                        <AdminBR />
                        <ManagePro />
                    </Group>
                )}
            </ScrollArea>
        </>
    );
}

export default Dashboard;