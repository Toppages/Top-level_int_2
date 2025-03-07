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
import { Group, ScrollArea, Select, Tabs, Title, Card } from "@mantine/core";
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
    const [productTotals, setProductTotals] = useState<Record<string, number>>({});

    const [totalPrice, setTotalPrice] = useState<number>(0);
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

    const getSalesByDayOfWeek = (sales: any[]) => {
        const weekSales: Record<"Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo", { count: number, totalPrice: number }> = {
            "Lunes": { count: 0, totalPrice: 0 },
            "Martes": { count: 0, totalPrice: 0 },
            "Miércoles": { count: 0, totalPrice: 0 },
            "Jueves": { count: 0, totalPrice: 0 },
            "Viernes": { count: 0, totalPrice: 0 },
            "Sábado": { count: 0, totalPrice: 0 },
            "Domingo": { count: 0, totalPrice: 0 },
        };

        sales.forEach((sale: any) => {
            const saleDate = new Date(sale.created_at);
            const dayNames: Array<keyof typeof weekSales> = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
            const dayName = dayNames[saleDate.getDay()];

            weekSales[dayName].count++;
            weekSales[dayName].totalPrice += sale.totalPrice;
        });

        return weekSales;
    };

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
                    const saleDate = new Date(sale.created_at);
                    return saleDate && saleDate >= monday && saleDate <= sunday;
                });

                const weekSales = getSalesByDayOfWeek(filteredSales);

                const totalSales = Object.values(weekSales).reduce((acc, { count }) => acc + count, 0);
                const totalWeekPrice = Object.values(weekSales).reduce((acc, { totalPrice }) => acc + totalPrice, 0);

                setSales(Object.entries(weekSales).map(([day, { count, totalPrice }]) => ({ day, count, totalPrice })));
                setTotalSales(totalSales);
                setTotalPrice(totalWeekPrice); 

                return;
            } else if (selectedRange === "mes") {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();
            
                const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                const firstDayWeekday = firstDayOfMonth.getDay();  
            
                const weeksInMonth: Record<number, { count: number, totalPrice: number }> = {};
            
                let totalMonthPrice = 0;
            
                filteredSales.forEach((sale: any) => {
                    const saleDate = new Date(sale.created_at);
                    if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                        const dayOfMonth = saleDate.getDate();
                        const weekNumber = Math.floor((dayOfMonth + firstDayWeekday - 1) / 7) + 1;
            
                        if (!weeksInMonth[weekNumber]) {
                            weeksInMonth[weekNumber] = { count: 0, totalPrice: 0 };
                        }
            
                        weeksInMonth[weekNumber].count++;
                        weeksInMonth[weekNumber].totalPrice += sale.totalPrice;
                        totalMonthPrice += sale.totalPrice;
                    }
                });
            
                const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();  
                const totalWeeks = Math.ceil((totalDaysInMonth + firstDayWeekday) / 7);
            
                for (let i = 1; i <= totalWeeks; i++) {
                    if (!weeksInMonth[i]) {
                        weeksInMonth[i] = { count: 0, totalPrice: 0 }; 
                    }
                }
            
                const weekSalesData = Object.entries(weeksInMonth).map(([week, { count, totalPrice }]) => ({
                    week: `Semana ${week}`,
                    count,
                    totalPrice,
                }));
            
                setSales(weekSalesData);
                setTotalSales(Object.values(weeksInMonth).reduce((acc, { count }) => acc + count, 0));
                setTotalPrice(totalMonthPrice);
            
                return;
            }
             else if (selectedRange === "año") {
                const now = new Date();
                const currentYear = now.getFullYear();

                const monthsInYear: Record<number, number> = {
                    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0
                };

                let totalYearPrice = 0;

                filteredSales.forEach((sale: any) => {
                    const saleDate = new Date(sale.created_at);
                    if (saleDate.getFullYear() === currentYear) {
                        const monthNumber = saleDate.getMonth() + 1;
                        monthsInYear[monthNumber] = (monthsInYear[monthNumber] || 0) + 1;
                        totalYearPrice += sale.totalPrice; 
                    }
                });

                const monthNames = [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];

                const monthSalesData = Object.entries(monthsInYear).map(([month, count]) => ({
                    month: monthNames[parseInt(month) - 1],
                    count,
                }));

                setSales(monthSalesData);
                setTotalSales(Object.values(monthsInYear).reduce((acc, count) => acc + count, 0));
                setTotalPrice(totalYearPrice);
                return;
            }

            const getTotalPriceByProductName = (sales: any[]) => {
                return sales.reduce((acc: Record<string, number>, sale: any) => {
                    const productName = sale.productName;
                    if (acc[productName]) {
                        acc[productName] += sale.totalPrice;
                    } else {
                        acc[productName] = sale.totalPrice;
                    }
                    return acc;
                }, {});
            };
            const productTotals = getTotalPriceByProductName(filteredSales);
            setProductTotals(productTotals);

            const totalPrice = filteredSales.reduce((acc: number, sale: any) => acc + sale.totalPrice, 0);
            setTotalPrice(totalPrice);
            setSales(filteredSales);
        } catch (err) {
            setError('Hubo un problema al obtener los Retiro.');
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

                <Tabs defaultValue="Retiro">
                    <Tabs.List>
                        <Tabs.Tab value="Retiro" icon={<IconPhoto size={14} />}>Retiro</Tabs.Tab>
                        <Tabs.Tab value="Pines" icon={<IconMessageCircle size={14} />}>Pines</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="Retiro" pt="xs">
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
                                    { value: "general", label: "General (todas los Retiro)" },
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
                                        Total de Retiro: {selectedRange === "semana" || selectedRange === "mes" || selectedRange === "año" ? totalSales : sales.length}
                                    </Title>

                                    <Title mt={5} weight={700} mb="sm" order={4}>Monto total de retiros {totalPrice} USD</Title>
                                    {Object.entries(productTotals).map(([productName, totalPrice]) => (
                                        <div key={productName}>
                                            <strong>{productName}</strong>: {totalPrice.toFixed(2)} USD
                                        </div>
                                    ))}
                                    {selectedRange === "semana" && (
                                        <div>
                                            {sales.map((dayData: any) => (
                                                <div key={dayData.day}>
                                                    <strong>{dayData.day}:</strong> {dayData.totalPrice.toFixed(2)} USD
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedRange === "mes" && (
            <div>
                {sales.map((weekData: any) => (
                    <div key={weekData.week}>
                        <strong>{weekData.week}:</strong>  {weekData.totalPrice.toFixed(2)} USD
                    </div>
                ))}
            </div>
        )}

                                    <Card
                                        mt={15}
                                        mb={45}
                                        mr={15}
                                        ml={15}
                                        style={{
                                            boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                            transition: "all 0.3s ease",
                                            transform: "scale(1)",

                                        }}
                                        radius="md"
                                    >

                                        {selectedRange === "año" ? (
                                            <BarChart
                                                width={900}
                                                height={300}
                                                series={[{ data: sales.map((item: any) => item.count), id: 'salesId', color: '#0c2a85' }]}
                                                xAxis={[{ data: sales.map((item: any) => item.month), scaleType: 'band' }]}
                                            />
                                        ) : selectedRange === "semana" ? (
                                            <BarChart
                                                width={500}
                                                height={300}
                                                series={[{ data: sales.map((item: any) => item.count), id: 'salesId', color: '#0c2a85' }]}
                                                xAxis={[{ data: sales.map((item: any) => item.day), scaleType: 'band' }]}
                                            />
                                        ) : selectedRange === "mes" ? (
                                            <BarChart
                                                width={500}
                                                height={300}
                                                series={[{ data: sales.map((item: any) => item.count), id: 'salesId', color: '#0c2a85' }]}
                                                xAxis={[{ data: sales.map((item: any) => item.week), scaleType: 'band' }]}
                                            />
                                        ) : (
                                            <BarChart
                                                width={500}
                                                height={300}
                                                series={[{ data: salesData, id: 'salesId', color: '#0c2a85' }]}
                                                xAxis={[{ data: productNames, scaleType: 'band' }]}
                                            />
                                        )}
                                    </Card>

                                </div>
                            ) : (
                                <p>{error ? error : 'No hay Retiros disponibles.'}</p>
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