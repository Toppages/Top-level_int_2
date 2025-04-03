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

const SalesPDF: React.FC<SalesPDFProps> = ({ userHandle, filteredSales, totalVentas, precioTotalVentas }) => {
    const productSummary = filteredSales.reduce((acc, sale) => {
        if (!acc[sale.productName]) {
            acc[sale.productName] = { count: 0, totalPrice: 0 };
        }
        acc[sale.productName].count += 1;
        acc[sale.productName].totalPrice += sale.totalPrice;
        return acc;
    }, {} as Record<string, { count: number; totalPrice: number }>);

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
                    <View style={styles.row}>
                        <Text style={styles.text}>Precio Total:</Text>
                        <Text style={styles.text}>${precioTotalVentas.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Resumen por Producto</Text>
                    {Object.entries(productSummary).map(([product, data]) => (
                        <View key={product} style={styles.row}>
                            <Text style={styles.text}>{product}</Text>
                            <Text style={styles.text}>{data.count} ventas - ${data.totalPrice.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default SalesPDF;
