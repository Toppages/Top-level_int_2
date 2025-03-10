import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart as Piec, Pie, Cell, Tooltip } from 'recharts';
import { Group, Title, Text, Badge, Card, Progress, ScrollArea } from '@mantine/core';

interface Pin {
    serial: string;
    key: string;
    usado: boolean;
    productName: string;
    _id: {
        $oid: string;
    };
}

interface Report {
    _id: {
        $oid: string;
    };
    user: {
        handle: string;
        name: string;
        email: string;
        role: string;
    };
    quantity: number;
    product: string;
    productName: string;
    totalPrice: number;
    moneydisp: number;
    status: string;
    order_id: string;
    pins: Pin[];
    created_at: {
        $date: string;
    };
    saleId: number;
    __v: number;
}

interface ReportSummary {
    totalKeys: number;
    usedKeys: number;
    unusedKeys: number;
    productSummary: { [key: string]: { total: number; unused: number } };
}

interface PinesProps {
    user: { handle: string; role: string } | null;
}

const COLORS = ['#ff0000', '#0c2a85'];

export const fetchReports = async (
    userHandle: string,
    userRole: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setReportSummary: React.Dispatch<React.SetStateAction<ReportSummary | null>>
) => {
    if (!userHandle) return;

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

        const reports: Report[] = response.data;

        let totalKeys = 0;
        let usedKeys = 0;
        const productSummary: { [key: string]: { total: number; unused: number } } = {};

        reports.forEach(report => {
            report.pins.forEach(pin => {
                totalKeys++;
                if (pin.usado) {
                    usedKeys++;
                }
                if (!productSummary[pin.productName]) {
                    productSummary[pin.productName] = { total: 0, unused: 0 };
                }
                productSummary[pin.productName].total++;
                if (!pin.usado) {
                    productSummary[pin.productName].unused++;
                }
            });
        });

        const summary: ReportSummary = {
            totalKeys,
            usedKeys,
            unusedKeys: totalKeys - usedKeys,
            productSummary,
        };

        setReportSummary(summary);
    } catch (err) {
        setError('Error al cargar los reportes.');
    }
};


const Pines: React.FC<PinesProps> = ({ user }) => {
    const [error, setError] = useState<string | null>(null);
    const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);

    useEffect(() => {
        if (user) {
            const { handle, role } = user;
            fetchReports(handle, role, setError, setReportSummary);
        }
    }, [user]);

    const datax = reportSummary
        ? [
            { name: 'Pines usados', value: reportSummary.usedKeys },
            { name: 'Pines sin usar', value: reportSummary.unusedKeys }
        ]
        : [];
    const getDiamondsText = (productName: string): string => {
        const match = productName.match(/\d+\sDiamantes/);
        return match ? match[0] : '';
    };
    return (
        <div>
            {error && <p>{error}</p>}
            {reportSummary && (
                <div>
                    <Title mt={5} ta="center" weight={700} mb="sm" order={2}>
                        TOTAL DE PINES: {reportSummary.totalKeys}
                    </Title>
                    <Group position="apart">
                        <div>
                            <Piec width={400} height={200}>
                                <Pie
                                    data={datax}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {datax.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}

                                </Pie>
                                <Tooltip />
                            </Piec>

                            <Badge mr={5} variant="gradient" gradient={{ from: '#0c2a85', to: '#0c2a85' }} >Pines no usados</Badge>
                            <Badge variant="gradient" gradient={{ from: '#ff0000', to: '#ff0000' }}>Pines usados</Badge>
                        </div>

                        <div>
                            <Card
                                mt={15}
                                mb={45}
                                mr={10}
                                ml={10}
                                style={{
                                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.3s ease",
                                    transform: "scale(1)",
                                }}
                                radius="md"
                            >
                                <Title mt={5} ta='center' weight={700} mb="sm" order={2}>
                                    PINES POR PRODUCTO
                                </Title>
                                <ScrollArea style={{ height: 230 }} type="never">
                                    {Object.entries(reportSummary.productSummary).map(([productName, data]) => (
                                        <>

                                            <Card
                                                mt={10}
                                                mb={10}
                                                mr={10}
                                                ml={10}
                                                style={{
                                                    boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.2)",
                                                    transition: "all 0.3s ease",
                                                    transform: "scale(1)",
                                                }}
                                                radius="md"
                                            >
                                                <Group position='apart'>

                                                    <Text mt={5} weight={700} mb="sm">
                                                        {getDiamondsText(productName)}:
                                                    </Text>
                                                    <Text mt={5} weight={700} mb="sm">
                                                        {data.unused}/{data.total}
                                                    </Text>
                                                </Group>
                                                <Progress color='#0c2a85' value={(data.unused / data.total) * 100} label={`${((data.unused / data.total) * 100).toFixed(0)}%`} size="xl" radius="xl" />
                                            </Card>
                                        </>

                                    ))}
                                </ScrollArea>
                            </Card>
                        </div>
                    </Group>
                </div>
            )}
        </div>
    );
};

export default Pines;