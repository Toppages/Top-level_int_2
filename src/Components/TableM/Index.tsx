import React, { useState, useEffect } from 'react';
import { ActionIcon, Table, Loader } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import StepperMa from '../StepperMa/Index';

interface Product {
    code: number;
    name: string;
    price: number;
}

const TableM: React.FC = () => {
    const [opened, setOpened] = useState<boolean>(false);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchProductsFromAPI = async () => {
        const headers = getAuthHeaders("GET", "api/products");
        if (!headers) return;
    
        setLoading(true);
        try {
            const response = await axios.get('https://pincentral.baul.pro/api/products', { headers });
            if (response.status === 200) {
                // Filtrar productos que contengan "Free Fire" en su nombre
                const freeFireProducts = response.data.filter((product: Product) => 
                    product.name.toLowerCase().includes("free fire")
                );
                setFetchedProducts(freeFireProducts);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchProductsFromAPI();
    }, []);

    const openModalForProduct = (product: Product) => {
        setSelectedProduct(product);
        setOpened(true);
    };

    return (
        <>
            <StepperMa opened={opened} onClose={() => setOpened(false)} product={selectedProduct} />

            {loading ? <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} /> :
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>ID</th>
                            <th style={{ textAlign: 'center' }}>Producto</th>
                            <th style={{ textAlign: 'center' }}>Precio</th>
                            <th style={{ textAlign: 'center' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {fetchedProducts.map((product) => (
                            <tr key={product.code}>
                                <td style={{ textAlign: 'center' }}>{product.code}</td>
                                <td style={{ textAlign: 'center' }}>{product.name}</td>
                                <td style={{ textAlign: 'center' }}>{product.price} $</td>
                                <td style={{ textAlign: 'center' }}>
                                    <ActionIcon
                                        onClick={() => openModalForProduct(product)}
                                        style={{ background: '#0c2a85', color: 'white' }}
                                        size="lg"
                                        variant="filled"
                                    >
                                        <IconEye size={26} />
                                    </ActionIcon>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            }
        </>
    );
};

export default TableM;
