import { useEffect, useState } from "react";
import axios from "axios";
import AdminBR from "./AdminBR";
import ManagePro from "./ManagePro";
import Registrar from "./Registrar/Index";
import EditClient from "./EditClient/Index";
import UserCountsDisplay from "./UserCountsDisplay/Index";
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from "@mantine/hooks";
import { IconCalendarWeek } from "@tabler/icons-react";
import { Card, Group, Select } from "@mantine/core";

interface DashboardProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
}

function Dashboard({ user }: DashboardProps) {
    const [userRole, setUserRole] = useState<string | null>(null);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const [selectedRange, setSelectedRange] = useState("hoy");
    const [sales, setSales] = useState<any[]>([]); 
    const [error, setError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const onBalanceUpdate = (newBalance: number) => {
        console.log('Nuevo saldo:', newBalance);
    };

    useEffect(() => {
        if (user) {
            // Obtener el rol del usuario
            fetch("http://localhost:4000/user", {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserRole(data.role);
                    fetchSales(data.handle, data.role);  // Llamada a la función para obtener ventas
                })
                .catch((err) => console.error("Error al obtener el usuario:", err));
        }
    }, [user]);

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

            setSales(response.data);  // Establecer las ventas obtenidas
        } catch (err) {
            setError('Hubo un problema al obtener las ventas.');
            console.error(err);
        }
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);
        console.log("Fecha seleccionada:", date); 
    };

    useEffect(() => {
        if (selectedRange === "hoy") {
            const today = new Date();
            console.log(today);
        }
    }, [selectedRange]); 

    return (
        <>
            {userRole === "master" && user && (
                <UserCountsDisplay token={localStorage.getItem("token")} />
            )}

            <Group
                mt={15}
                mb={15}
                mx="sm"
                style={{
                    display: 'grid',
                    gridTemplateColumns: isSmallScreen ? '1fr' : '1fr 1fr',
                    gap: 15,
                    width: '100%',
                }}
            >
                <Card h={350} style={{ padding: "20px", boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)" }} radius="md">
                    <Select
                        label="Selecciona el rango de fecha"
                        radius="md"
                        icon={<IconCalendarWeek />}
                        size="lg"
                        transition="pop-top-left"
                        transitionDuration={80}
                        transitionTimingFunction="ease"
                        value={selectedRange}
                        onChange={(value) => setSelectedRange(value || "hoy")}
                        data={[
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
                            onChange={handleDateChange} // Usar la función para manejar la fecha
                        />
                    )}

                    {sales.length > 0 ? (
                        <div>
                            <h2>Total de Ventas: {sales.length}</h2> {/* Mostrar la cantidad de ventas */}
                            
                        </div>
                    ) : (
                        <p>{error ? error : 'No hay ventas disponibles.'}</p>
                    )}
                </Card>
            </Group>

            {(userRole === "master" || userRole === "admin") && (
                <Group>
                    <EditClient user={user} onBalanceUpdate={onBalanceUpdate} />
                    <Registrar />
                    <AdminBR />
                    <ManagePro />
                </Group>
            )}
        </>
    );
}

export default Dashboard;
