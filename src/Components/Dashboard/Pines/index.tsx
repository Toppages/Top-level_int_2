import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart } from '@mui/x-charts/PieChart';
import { Group, List, Title, Text } from '@mantine/core';

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
    productNames: string[];
    productCount: { [key: string]: number };
}

interface PinesProps {
    user: { handle: string; role: string } | null;
}

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

        // Cálculos de estadísticas
        const totalKeys = reports.reduce((acc, report) => acc + report.pins.length, 0);
        const usedKeys = reports.reduce((acc, report) => acc + report.pins.filter(pin => pin.usado).length, 0);
        const unusedKeys = totalKeys - usedKeys;

        // Contar cuántos productos de cada tipo hay
        const productCount: { [key: string]: number } = {};
        reports.forEach(report => {
            report.pins.forEach(pin => {
                productCount[pin.productName] = (productCount[pin.productName] || 0) + 1;
            });
        });

        const productNames = Object.keys(productCount);

        const summary: ReportSummary = {
            totalKeys,
            usedKeys,
            unusedKeys,
            productNames,
            productCount,
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

    return (
        <div>
            {error && <p>{error}</p>}
            {reportSummary && (
                <div>
                    <Title mt={5} ta="center" weight={700} mb="sm" order={2}>
                        TOTAL DE PINES: {reportSummary.totalKeys}
                    </Title>

                    <Group position="center">
                        <PieChart
                            series={[{
                                data: [
                                    { id: 0, value: reportSummary.usedKeys, label: 'Pines usados', color: '#ff0000' },
                                    { id: 1, value: reportSummary.unusedKeys, label: 'Pines sin usar', color: '#0c2a85' },
                                ],
                            }]}
                            width={400}
                            height={200}
                        />
                    </Group>

                    <Title mt={5} weight={700} mb="sm" order={2}>
                        PINES POR PRODUCTO
                    </Title>

                    {reportSummary.productNames.map((productName) => (
                        <List size="lg" withPadding key={productName}>
                            <List.Item>
                                <Text mt={5} weight={700} mb="sm">
                                    {productName}: {reportSummary.productCount[productName]}
                                </Text>
                            </List.Item>
                        </List>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Pines;
