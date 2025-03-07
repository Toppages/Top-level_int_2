import Pines from "./Pines";
import axios from "axios";
import AdminBR from "./AdminBR";
import ManagePro from "./ManagePro";
import Registrar from "./Registrar/Index";
import EditClient from "./EditClient/Index";
import UserCountsDisplay from "./UserCountsDisplay/Index";
import { BarChart } from '@mui/x-charts/BarChart';
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { IconCalendarWeek, IconTicket, IconCoins } from "@tabler/icons-react";
import { DatePicker, DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import { Group, ScrollArea, Select, Tabs, Text, Title, List, Card } from "@mantine/core";
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
    const today = new Date();
    const fiveDaysLater = new Date(today);
    const [selectedrDate, setSelecterdDate] = useState<DateRangePickerValue>([
        today,
        fiveDaysLater,
    ]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const onBalanceUpdate = (newBalance: number) => {
        console.log('Nuevo saldo:', newBalance);
    };
    const maxHeight = isSmallScreen ? windowHeight * 0.9 : windowHeight - 70;

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
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

    useEffect(() => {
        fetchSales(user?.handle || "", userRole || "");
    }, [selectedRange, selectedrDate]);


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
        const getTotalPriceByProductName = (sales: any[]) => {
            return sales.reduce((acc: Record<string, number>, sale: any) => {
                const productName = sale.productName;
                acc[productName] = (acc[productName] || 0) + sale.totalPrice;
                return acc;
            }, {});
        };

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

                const productTotals = getTotalPriceByProductName(filteredSales);
                setProductTotals(productTotals);

                setSales(Object.entries(weekSales).map(([day, { count, totalPrice }]) => ({ day, count, totalPrice })));
                setTotalSales(totalSales);
                setTotalPrice(totalWeekPrice);
                return;
            }
            else if (selectedRange === "mes") {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
                const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

                let weeksInMonth: Record<string, { count: number, totalPrice: number }> = {};
                let totalMonthPrice = 0;

                let startOfWeek = new Date(firstDayOfMonth);

                if (startOfWeek.getDay() === 6) {
                    let endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 1);

                    const weekLabel = `${String(startOfWeek.getDate()).padStart(2, "0")}-${String(endOfWeek.getDate()).padStart(2, "0")}`;
                    weeksInMonth[weekLabel] = { count: 0, totalPrice: 0 };

                    filteredSales.forEach((sale: any) => {
                        const saleDate = new Date(sale.created_at);
                        if (saleDate >= startOfWeek && saleDate <= endOfWeek) {
                            weeksInMonth[weekLabel].count++;
                            weeksInMonth[weekLabel].totalPrice += sale.totalPrice;
                            totalMonthPrice += sale.totalPrice;
                        }
                    });

                    startOfWeek.setDate(endOfWeek.getDate() + 1);
                }

                if (startOfWeek.getDay() === 0) {
                    let endOfWeek = new Date(startOfWeek);

                    const weekLabel = `${String(startOfWeek.getDate()).padStart(2, "0")}-${String(endOfWeek.getDate()).padStart(2, "0")}`;
                    weeksInMonth[weekLabel] = { count: 0, totalPrice: 0 };

                    filteredSales.forEach((sale: any) => {
                        const saleDate = new Date(sale.created_at);
                        if (saleDate.getTime() === startOfWeek.getTime()) {
                            weeksInMonth[weekLabel].count++;
                            weeksInMonth[weekLabel].totalPrice += sale.totalPrice;
                            totalMonthPrice += sale.totalPrice;
                        }
                    });

                    startOfWeek.setDate(startOfWeek.getDate() + 1);
                }

                while (startOfWeek <= lastDayOfMonth) {
                    let endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    if (endOfWeek > lastDayOfMonth) endOfWeek = new Date(lastDayOfMonth);

                    const weekLabel = `${String(startOfWeek.getDate()).padStart(2, "0")}-${String(endOfWeek.getDate()).padStart(2, "0")}`;
                    weeksInMonth[weekLabel] = { count: 0, totalPrice: 0 };

                    filteredSales.forEach((sale: any) => {
                        const saleDate = new Date(sale.created_at);
                        if (saleDate >= startOfWeek && saleDate <= endOfWeek) {
                            weeksInMonth[weekLabel].count++;
                            weeksInMonth[weekLabel].totalPrice += sale.totalPrice;
                            totalMonthPrice += sale.totalPrice;
                        }
                    });

                    startOfWeek.setDate(endOfWeek.getDate() + 1);
                }

                const productTotals = getTotalPriceByProductName(filteredSales);
                setProductTotals(productTotals);

                setSales(Object.entries(weeksInMonth).map(([week, { count, totalPrice }]) => ({
                    week,
                    count,
                    totalPrice,
                })));

                setTotalSales(Object.values(weeksInMonth).reduce((acc, { count }) => acc + count, 0));
                setTotalPrice(totalMonthPrice);
                return;
            }

            else if (selectedRange === "año") {
                const now = new Date();
                const currentYear = now.getFullYear();

                const monthsInYear = Array.from({ length: 12 }, () => ({ count: 0, totalPrice: 0 }));
                let totalYearPrice = 0;

                filteredSales.forEach((sale: any) => {
                    const saleDate = new Date(sale.created_at);
                    if (saleDate.getFullYear() === currentYear) {
                        const monthIndex = saleDate.getMonth();
                        monthsInYear[monthIndex].count++;
                        monthsInYear[monthIndex].totalPrice += sale.totalPrice;
                        totalYearPrice += sale.totalPrice;
                    }
                });

                const productTotals = getTotalPriceByProductName(filteredSales);
                setProductTotals(productTotals);

                setSales(monthsInYear.map((data, index) => ({
                    month: new Date(0, index).toLocaleString('es-ES', { month: 'long' }),
                    ...data
                })));
                setTotalSales(monthsInYear.reduce((acc, { count }) => acc + count, 0));
                setTotalPrice(totalYearPrice);
                return;
            } else if (selectedRange === "rangoDia" && selectedrDate && selectedrDate[0] && selectedrDate[1]) {
                const startDate = new Date(selectedrDate[0]);
                const endDate = new Date(selectedrDate[1]);
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);

                filteredSales = filteredSales.filter((sale: any) => {
                    const saleDate = new Date(sale.created_at);
                    return saleDate >= startDate && saleDate <= endDate;
                });
            }


            const productTotals = getTotalPriceByProductName(filteredSales);
            setProductTotals(productTotals);

            setTotalPrice(filteredSales.reduce((acc: any, sale: { totalPrice: any; }) => acc + sale.totalPrice, 0));
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
    const SalesBarChart = ({ sales, selectedRange }: any) => {
        let data = [];
        let xAxis = [];

        if (selectedRange === "año") {
            data = sales.map((item: any) => item.count);
            xAxis = sales.map((item: any) => item.month);
        } else if (selectedRange === "semana") {
            data = sales.map((item: any) => item.count);
            xAxis = sales.map((item: any) => item.day);
        } else if (selectedRange === "mes") {
            data = sales.map((item: any) => item.count);
            xAxis = sales.map((item: any) => item.week);
        } else {
            data = salesData;
            xAxis = productNames;
        }

        return (
            <BarChart
                width={500}
                height={300}
                series={[{ data, id: 'salesId', color: '#0c2a85' }]}
                xAxis={[{ data: xAxis, scaleType: 'band' }]}
            />
        );
    };

    const SalesBreakdown = ({ sales, selectedRange }: any) => {
        let breakdown = [];

        if (selectedRange === "semana") {
            breakdown = sales.map((dayData: any) => (
                <div key={dayData.day}>
                    <List size="lg" withPadding>
                        <List.Item>
                            <Text mt={5} weight={700} mb="sm">
                                <strong>{dayData.day}:</strong> {dayData.totalPrice.toFixed(2)} USD
                            </Text>
                        </List.Item>
                    </List>
                </div>
            ));
        } else if (selectedRange === "mes") {
            breakdown = sales.map((weekData: any) => (
                <div key={weekData.week}>
                    <strong>{weekData.week}:</strong> {weekData.totalPrice.toFixed(2)} USD
                </div>
            ));
        } else if (selectedRange === "año") {
            breakdown = sales.map((monthData: any) => (
                <div key={monthData.month}>
                    <strong>{monthData.month}:</strong> {monthData.totalPrice.toFixed(2)} USD
                </div>
            ));
        } else if (selectedRange === "rangoDia") {
            breakdown = sales.map((sale: any) => (
                <div key={sale.id}>
                    <List size="lg" withPadding>
                        <List.Item>
                            <Text mt={5} weight={700} mb="sm">
                                <strong>{sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "Fecha no disponible"}:</strong> {sale.totalPrice.toFixed(2)} USD
                            </Text>
                        </List.Item>
                    </List>
                </div>
            ));
        }

        return <div>{breakdown}</div>;
    };

    const ProductList = ({ productTotals }: any) => {
        return (
            <div>
                {Object.entries(productTotals).map(([productName, totalPrice]) => (
                    <div key={productName}>
                        <List size="lg" withPadding>
                            <List.Item>
                                <Text mt={5} weight={700} mb="sm">
                                    {productName} {(totalPrice as number).toFixed(2)} USD
                                </Text>
                            </List.Item>
                        </List>
                    </div>
                ))}
            </div>
        );
    };

    const RangeSelect = ({ selectedRange, setSelectedRange }: any) => {
        return (
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
                    { value: "rangoDia", label: "Rango del día" },
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
        );
    };

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <div style={{ width: '100%', overflowX: 'hidden' }}>
                {userRole === "master" && user && <UserCountsDisplay token={localStorage.getItem("token")} />}


                <Tabs defaultValue="Retiro">
                    <Tabs.List>
                        <Tabs.Tab value="Retiro" icon={<IconCoins size={18} />}>Retiro</Tabs.Tab>
                        <Tabs.Tab value="Pines" icon={<IconTicket size={18} />}>Pines</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="Retiro" pt="xs">
                        <div>
                            <RangeSelect selectedRange={selectedRange} setSelectedRange={setSelectedRange} />

                            {selectedRange === "custom" && <DatePicker label="Selecciona un día" value={selectedDate} onChange={handleDateChange} />}
                            <ScrollArea style={{ height: maxHeight - 130 }} type="never">
                                {selectedRange === "rangoDia" && <DateRangePicker label="Selecciona el rango del día" placeholder="Pick dates range" value={selectedrDate} onChange={(date) => setSelecterdDate(date)} />}

                                {sales.length > 0 ? (
                                    <div>

                                        <Title mt={5} ta="center" weight={700} mb="sm" order={2}>
                                            TOTAL DE RETIRO: {selectedRange === "semana" || selectedRange === "mes" || selectedRange === "año" ? totalSales : sales.length}
                                        </Title>

                                        <Title mt={5} weight={700} mb="sm" order={4}>Monto total de retiros {totalPrice} USD</Title>
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
                                            <SalesBarChart sales={sales} selectedRange={selectedRange} />
                                        </Card>

                                        <Title mt={5} weight={700} mb="sm" order={4}>Productos</Title>
                                        <ProductList productTotals={productTotals} />

                                        <SalesBreakdown sales={sales} selectedRange={selectedRange} />
                                    </div>
                                ) : (
                                    <p>{error ? error : 'No hay Retiros disponibles.'}</p>
                                )}
                            </ScrollArea>
                        </div>
                    </Tabs.Panel>

                    <Tabs.Panel value="Pines" pt="xs">
                        <Pines user={user} />
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
            </div>
        </>
    );
}

export default Dashboard;