import { useEffect, useState } from "react";
import { Card, Grid, Title } from "@mantine/core";
import Registrar from "./Registrar/Index";
import AdminBR from "./AdminBR";
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { format, subDays } from 'date-fns';
import { useMediaQuery } from "@mantine/hooks";

interface UserCounts {
    adminCount: number;
    sellerCount: number;
    clientCount: number;
}

function Dashboard() {
    const [userCounts, setUserCounts] = useState<UserCounts | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    useEffect(() => {
        fetch("http://localhost:4000/user", {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setUserRole(data.role);

                if (data.role === "admin") {
                    fetch("http://localhost:4000/users/count", {
                        method: "GET",
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    })
                        .then((res) => res.json())
                        .then((counts: UserCounts) => {
                            setUserCounts(counts);
                        })
                        .catch((err) => console.error("Error al obtener los conteos:", err));
                }
            })
            .catch((err) => console.error("Error al obtener el usuario:", err));
    }, []);

    const clientem = [50, 100, 200, 280, 250, 150, 300];
    const venM = [150, 150, 250, 200, 300, 350, 300];
    const clientep = [50, 100, 200, 280, 250, 150, 300];
    const venp = [150, 150, 250, 200, 300, 350, 300];

    const xLabels = Array.from({ length: 7 }, (_, index) =>
        format(subDays(new Date(), 6 - index), 'dd/MM')
    );

    return (
        <>


            <Grid mb={10} gutter="md">
                {userRole === "admin" && userCounts && (
                    <>
                        <Grid.Col xs={12} sm={6} md={4}>
                            <Card
                                style={{
                                    padding: "20px",
                                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.3s ease",
                                    transform: "scale(1)",
                                    width: '100%',
                                    color: 'white',
                                    backgroundColor: '#0c2a85' 
                                }}
                                radius="md"
                                onMouseEnter={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1.05)";
                                    card.style.boxShadow = "0px 6px 15px rgba(0, 0, 0, 0.2)";
                                }}
                                onMouseLeave={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1)";
                                    card.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <Title order={4}>Administradores: {userCounts.adminCount}</Title>
                            </Card>

                        </Grid.Col>

                        <Grid.Col xs={12} sm={6} md={4}>
                            <Card
                                style={{
                                    padding: "20px",
                                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.3s ease",
                                    transform: "scale(1)",
                                    maxWidth: '100%', 
                                    color: 'white',
                                    backgroundColor: '#1446df' 
                                }}
                                radius="md"
                                onMouseEnter={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1.05)";
                                    card.style.boxShadow = "0px 6px 15px rgba(0, 0, 0, 0.2)";
                                }}
                                onMouseLeave={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1)";
                                    card.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <Title order={4}>Vendedores: {userCounts.sellerCount}</Title>
                            </Card>
                        </Grid.Col>
                        <Grid.Col xs={12} sm={6} md={4}>
                            <Card
                                style={{
                                    padding: "20px",
                                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.3s ease",
                                    transform: "scale(1)",
                                    maxWidth: '100%',
                                }}
                                radius="md"
                                onMouseEnter={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1.05)";
                                    card.style.boxShadow = "0px 6px 15px rgba(0, 0, 0, 0.2)";
                                }}
                                onMouseLeave={(e: { currentTarget: any; }) => {
                                    const card = e.currentTarget;
                                    card.style.transform = "scale(1)";
                                    card.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                <Title order={4}>Clientes: {userCounts.clientCount}</Title>
                            </Card>
                        </Grid.Col>
                    </>
                )}
            </Grid>

            <Grid mb={10} gutter="md">
                <Grid.Col xs={12} sm={6} md={6}>
                    <Card
                        style={{
                            boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                            transition: "all 0.3s ease",
                            transform: "scale(1)",
                        }}
                        radius="md"
                        onMouseEnter={(e: { currentTarget: any; }) => {
                            const card = e.currentTarget;
                            card.style.transform = "scale(1.05)";
                            card.style.boxShadow = "0px 6px 15px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e: { currentTarget: any; }) => {
                            const card = e.currentTarget;
                            card.style.transform = "scale(1)";
                            card.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
                        }}
                    >
                        <LineChart
                            width={isSmallScreen ? 380 : 500}
                            height={isSmallScreen ? 300 : 300}
                            series={[
                                { data: clientem, label: 'Clientes', color: '#1446df' },
                                { data: venM, label: 'Vendedores', color: '#0c2a85' },
                            ]}
                            xAxis={[{ scaleType: 'point', data: xLabels }]}
                        />
                    </Card>
                </Grid.Col>
                <Grid.Col xs={12} sm={6} md={6}>
                    <Card
                        style={{
                            boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                            transition: "all 0.3s ease",
                            transform: "scale(1)",
                        }}
                        radius="md"
                        onMouseEnter={(e: { currentTarget: any; }) => {
                            const card = e.currentTarget;
                            card.style.transform = "scale(1.05)";
                            card.style.boxShadow = "0px 6px 15px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e: { currentTarget: any; }) => {
                            const card = e.currentTarget;
                            card.style.transform = "scale(1)";
                            card.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.1)";
                        }}
                    >


                        <BarChart
                            width={isSmallScreen ? 380 : 450}
                            height={isSmallScreen ? 300 : 300}
                            borderRadius={12}
                            series={[
                                { data: clientep, label: 'Clientes', id: 'pvId', stack: 'total', color: '#1446df' },
                                { data: venp, label: 'Vendedores', id: 'uvId', stack: 'total', color: '#0c2a85' },
                            ]}
                            xAxis={[{ data: xLabels, scaleType: 'band' }]}
                        />
                    </Card>
                </Grid.Col>
            </Grid>
            <Registrar />
            <AdminBR />
        </>
    );
}

export default Dashboard;
