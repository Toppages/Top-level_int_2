import React, { useState, useEffect } from 'react';
import { ActionIcon, Table, Loader } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import StepperMa from '../StepperMa/Index';

interface Product {
    product_group: string;
    code: string;
    name: string;
    price: string;
}

const TableM: React.FC = () => {
    const [opened, setOpened] = useState<boolean>(false);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [selectedProductGroup, setSelectedProductGroup] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchProductsFromAPI = async () => {
        const headers = getAuthHeaders("GET", "api/products");
        if (!headers) return;

        setLoading(true);
        try {
            const response = await axios.get('https://pincentral.baul.pro/api/products', { headers });
            if (response.status === 200) {
                const products: Product[] = response.data;
                setFetchedProducts(products);
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

    const openModalForGroup = (group: string) => {
        setSelectedProductGroup(group);
        setOpened(true);
    };

    const productsInSelectedGroup = selectedProductGroup
        ? fetchedProducts.filter(product => product.product_group === selectedProductGroup)
        : [];

    return (
        <>
            <StepperMa opened={opened} onClose={() => setOpened(false)} products={productsInSelectedGroup} />

            {loading ? <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} /> :
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th >Grupos de Producto</th>
                            <th ></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(new Set(fetchedProducts.map(product => product.product_group)))
                            .map((group, index) => (
                                <tr key={index}>
                                    <td >
                                        {group}
                                    </td>
                                    <td >
                                        <ActionIcon
                                            onClick={() => openModalForGroup(group)}
                                            style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
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
