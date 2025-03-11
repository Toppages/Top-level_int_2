import React, { useEffect, useState } from 'react';
import { Card, Grid, Title } from '@mantine/core';

interface UserCounts {
    adminCount: number;
    sellerCount: number;
    clientCount: number;
}

interface UserCountsDisplayProps {
    token: string | null;
}

const UserCountsDisplay: React.FC<UserCountsDisplayProps> = ({ token }) => {
    const [userCounts, setUserCounts] = useState<UserCounts | null>(null);

    useEffect(() => {
        if (token) {
            fetch(`${import.meta.env.VITE_API_URL}/users/count`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((counts: UserCounts) => {
                    setUserCounts(counts);
                })
                .catch((err) => console.error("Error al obtener los conteos:", err));
        }
    }, [token]);

    if (!userCounts) return null;

    return (
        <Grid mb={10} gutter="md">
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
                >
                    <Title order={4}>Clientes: {userCounts.clientCount}</Title>
                </Card>
            </Grid.Col>
        </Grid>
    );
};

export default UserCountsDisplay;
