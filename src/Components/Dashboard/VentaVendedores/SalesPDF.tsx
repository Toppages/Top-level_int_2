import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Report } from '../../../types/types';

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textDecoration: 'underline',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
        borderBottom: '1px solid #ccc',
    },
    text: {
        fontSize: 12,
    },
    boldText: {
        marginTop: 10,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

type SalesPDFProps = {
    userHandle: string;
    filteredSales: Report[];
    totalVentas: number;
    precioTotalVentas: number;
};

const SalesPDF: React.FC<SalesPDFProps> = ({ userHandle, filteredSales, totalVentas }) => {
    const productOrder = [
        "Free Fire 100 Diamantes + 10 Bono",
        "Free Fire - 310 Diamantes + 31 Bono",
        "Free Fire 520 Diamantes + 52 Bono",
        "Free Fire - 1060 Diamantes + 106 Bono",
        "Free Fire - 2.180 Diamantes + 218 Bono",
        "Free Fire - 5.600 Diamantes + 560 Bono"
    ];

    const productSummary = filteredSales.reduce((acc, sale) => {
        if (!acc[sale.productName]) {
            acc[sale.productName] = { count: 0, totalPrice: 0 };
        }
        acc[sale.productName].count += 1;
        acc[sale.productName].totalPrice += sale.totalPrice;
        return acc;
    }, {} as Record<string, { count: number; totalPrice: number }>);

    const sortedProducts = productOrder
        .filter(product => productSummary[product]) 
        .map(product => [product, productSummary[product]] as const);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>Resumen de Ventas - {userHandle}</Text>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Totales Generales</Text>
                    <View style={styles.row}>
                        <Text style={styles.text}>Total de Ventas:</Text>
                        <Text style={styles.text}>{totalVentas}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen por Producto</Text>
                    {sortedProducts.map(([product, data]) => (
                        <View key={product} style={styles.row}>
                            <Text style={styles.text}>{product}</Text>
                            <Text style={styles.text}>{data.count} ventas </Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default SalesPDF;
