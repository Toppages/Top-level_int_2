import { useState, useEffect, useRef } from 'react';
import { Modal, Button, Group, Select, Title, Text, Card, ScrollArea } from '@mantine/core';
import axios from 'axios';
import { BarChart as Newcha, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { DatePicker, DateRangePicker, DateRangePickerValue } from '@mantine/dates';
import { IconCalendarWeek } from '@tabler/icons-react';

function AllRetiros() {
    const [opened, setOpened] = useState(false);
    const [users, setUsers] = useState<{ value: string; label: string; group: string }[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [sales, setSales] = useState<any[]>([]);
    const [selectedRange, setSelectedRange] = useState<string>("general");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const today = new Date();
    const fiveDaysLater = new Date(today);
    const [selectedrDate, setSelectedrDate] = useState<DateRangePickerValue>([
        today,
        fiveDaysLater,
    ]);
    const [error, setError] = useState<string | null>(null);

    const [productTotals, setProductTotals] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_Url}/users/all`);
                const formattedUsers = response.data.map((user: any) => ({
                    value: user.handle,
                    label: user.name,
                    group: user.role.charAt(0).toUpperCase() + user.role.slice(1),
                }));
                setUsers(formattedUsers);
            } catch (error) {
                console.error('Error al obtener los usuarios:', error);
            }
        };

        if (opened) {
            fetchUsers();
        }
    }, [opened]);

    useEffect(() => {
        setSales([]);
        setTotalSales(0);
        setTotalPrice(0);
        setError(null);

        if (selectedUser) {
            fetchSales(selectedUser || "");
        }
    }, [selectedUser, selectedRange, selectedDate, selectedrDate]);

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);

    };

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

    const fetchSales = async (userHandle: string) => {
        const getTotalPriceByProductName = (sales: any[]) => {
            return sales.reduce((acc: Record<string, number>, sale: any) => {
                const productName = sale.productName;
                acc[productName] = (acc[productName] || 0) + sale.totalPrice;
                return acc;
            }, {});
        };



        try {
            const url = `${import.meta.env.VITE_API_Url}/sales/user/${userHandle}`;

            const response = await axios.get(url);

            let filteredSales = response.data;

            if (!Array.isArray(filteredSales)) {
                setError('La respuesta del servidor no es válida.');
                return;
            }
            if (filteredSales.length === 0) {
                setSales([]);
                setError('No se encontraron ventas para este usuario');
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

    const ProductList = ({ productTotals }: any) => {
        return (
            <div>
                {Object.entries(productTotals).map(([productName, totalPrice]) => (
                    <div key={productName}>
                        <Card mb={15} shadow="sm" p="lg" radius="md" withBorder>
                            <Group position="apart">

                                <Text mt={5} weight={700} mb="sm">

                                    {productName}
                                </Text>
                                <Text c='green' mt={5} weight={700} mb="sm">

                                    {(totalPrice as number).toFixed(2)} USD
                                </Text>
                            </Group>
                        </Card>

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
                    { value: "general", label: "General (todos los Retiro)" },
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

    const SalesBreakdown = ({ sales, selectedRange }: any) => {
        let breakdown = [];

        if (selectedRange === "semana") {
            breakdown = sales.map((dayData: any) => (
                <>

                    <div key={dayData.day}>
                        <Card mb={15} shadow="sm" p="lg" radius="md" withBorder>
                            <Group position="apart">

                                <Text mt={5} weight={700} mb="sm">
                                    <strong>{dayData.day}:</strong>
                                </Text>
                                <Text c='green' mt={5} weight={700} mb="sm">

                                    {dayData.totalPrice.toFixed(2)} USD
                                </Text>
                            </Group>
                        </Card>


                    </div>
                </>
            ));
        } else if (selectedRange === "mes") {
            return (
                <>
                    <Title mt={5} ta="center" weight={700} mb="sm" order={3}>
                        Montos por semana
                    </Title>
                    {sales.map((weekData: any) => (
                        <div key={weekData.week}>
                            <Card mb={15} shadow="sm" p="lg" radius="md" withBorder>
                                <Group position="apart">

                                    <Text mt={5} weight={700} mb="sm">
                                        Semana del <strong>{weekData.week}:</strong>
                                    </Text>
                                    <Text c='green' mt={5} weight={700} mb="sm">

                                        {weekData.totalPrice.toFixed(2)} USD
                                    </Text>
                                </Group>
                            </Card>

                        </div>
                    ))}
                </>
            );
        } else if (selectedRange === "año") {
            return (
                <>
                    <Title mt={5} ta="center" weight={700} mb="sm" order={3}>
                        Montos por mes
                    </Title>
                    {sales.map((monthData: any) => (
                        <Card key={monthData.month} mb={15} shadow="sm" p="lg" radius="md" withBorder>
                            <Group position="apart">
                                <Text mt={5} weight={700} mb="sm">
                                    <strong>{monthData.month}:</strong>
                                </Text>
                                <Text c="green" mt={5} weight={700} mb="sm">
                                    {monthData.totalPrice.toFixed(2)} USD
                                </Text>
                            </Group>
                        </Card>
                    ))}
                </>
            );
        } else if (selectedRange === "rangoDia") {
            breakdown = sales.map((sale: any) => (
                <div key={sale.id}>
                    <Card mb={15} shadow="sm" p="lg" radius="md" withBorder>

                        <Group position="apart">

                            <Text mt={5} weight={700} mb="sm">
                                <strong>{sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "Fecha no disponible"}:</strong> {sale.totalPrice.toFixed(2)} USD
                            </Text>
                            <Text c='green' mt={5} weight={700} mb="sm">

                                {sale.totalPrice.toFixed(2)} USD
                            </Text>
                        </Group>
                    </Card>

                </div>
            ));
        }

        return <div>{breakdown}</div>;
    };

    const extractDiamantes = (productName: string) => {
        const match = productName.match(/(\d+)\s*Diamantes/);
        return match ? `${match[1]} Diamantes` : productName;
    };

    const salesByProduct = sales.reduce((acc, sale) => {
        acc[sale.productName] = (acc[sale.productName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const productNames = Object.keys(salesByProduct).map(extractDiamantes);
    const salesData = Object.values(salesByProduct) as (number | null)[];

    const SalesBarChart = ({ sales, selectedRange }: any) => {
        const chartRef = useRef<HTMLDivElement | null>(null);
        const [chartWidth, setChartWidth] = useState<number>(0);

        useEffect(() => {
            if (chartRef.current) {
                const width = chartRef.current.getBoundingClientRect().width;
                setChartWidth(width);
            }
        }, [chartRef.current]);

        let formattedData = [];

        if (selectedRange === "año") {
            formattedData = sales.map((item: any) => ({
                name: item.month,
                uv: item.count
            }));
        } else if (selectedRange === "semana") {
            formattedData = sales.map((item: any) => ({
                name: item.day,
                uv: item.count
            }));
        } else if (selectedRange === "mes") {
            formattedData = sales.map((item: any) => ({
                name: item.week,
                uv: item.count
            }));
        } else {
            formattedData = salesData.map((count: any, index: number) => ({
                name: productNames[index],
                uv: count
            }));
        }

        return (
            <div ref={chartRef}>
                {chartWidth > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <Newcha data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value} USD`}
                            />
                            <Tooltip />
                            <Bar dataKey="uv" radius={[4, 4, 0, 0]} fill="#0c2a85" />
                        </Newcha>
                    </ResponsiveContainer>
                )}
            </div>
        );
    };
    return (
        <>
            <Modal opened={opened} withCloseButton={false} onClose={() => setOpened(false)} title="Selecciona un usuario">
                <Select
                    label="Usuarios"
                    placeholder="Selecciona un usuario"
                    data={users}
                    searchable
                    clearable
                    value={selectedUser}
                    transition="pop-top-left"
                    transitionDuration={80}
                    transitionTimingFunction="ease"
                    onChange={(value) => setSelectedUser(value)}
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


                {selectedUser && (
                    <div>
                        {error ? (
                            <p>{error}</p>
                        ) : (
                            <>
                                <Title mt={5} ta="center" weight={700} mb="sm" order={3}>

                                    Retiros de {selectedUser}
                                </Title>
                                <RangeSelect selectedRange={selectedRange} setSelectedRange={setSelectedRange} />

                                {selectedRange === "custom" && <DatePicker label="Selecciona un día" value={selectedDate} onChange={handleDateChange} />}
                                {selectedRange === "rangoDia" && <DateRangePicker label="Selecciona el rango del día" placeholder="Pick dates range" value={selectedrDate} onChange={(date) => setSelectedrDate(date)} />}

                                {sales.length > 0 ? (
                                    <div>

                                        <Title mt={5} ta="center" weight={700} mb="sm" order={2}>
                                            TOTAL DE RETIRO: {selectedRange === "semana" || selectedRange === "mes" || selectedRange === "año" ? totalSales : sales.length}
                                        </Title>

                                        <Title mt={5} weight={700} mb='md' order={5}>
                                            Monto total de retiros {totalPrice.toFixed(2)} USD
                                        </Title>
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
                                            <ScrollArea w='100%' type="never">

                                                <SalesBarChart sales={sales} selectedRange={selectedRange} />
                                            </ScrollArea>

                                        </Card>

                                        <Title mt={5} weight={700} mb="sm" order={4}>Productos</Title>
                                        <ProductList productTotals={productTotals} />

                                        <SalesBreakdown sales={sales} selectedRange={selectedRange} />
                                    </div>
                                ) : (
                                    <p>{error ? error : 'No hay Retiros disponibles.'}</p>
                                )}
                            </>
                        )}
                    </div>
                )}

            </Modal>

            <Group position="center">
                <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>Ver retiros</Button>
            </Group>
        </>
    );
}

export default AllRetiros;
