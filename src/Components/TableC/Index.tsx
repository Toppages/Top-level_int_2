import React, { useState, useEffect } from 'react';
import { ActionIcon, Table, Loader } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import StepperRed from '../StepperRed/Index';
import { Product } from "../../types/types";


const TableC: React.FC = () => {
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

    const allowedGroups = [
        "Arena Breakout",
        "Honor of kings",
        "Netflix Usa",
        "Fortnite V-Bucks",
        "Nintendo US USD",
        "Parchis Club",
        "PUBG UC",
        "Razer Gold Brasil",
        "Razer Gold Chile",
        "Razer Gold Colombia",
        "Recarga Mobile Legends",
        "Roblox US USD",
        "Steam US USD",
        "Xbox US USD",
        "Free Fire Latam"
    ];

    const filteredGroups = Array.from(new Set(fetchedProducts.map(product => product.product_group)))
        .filter(group => allowedGroups.includes(group));

    return (
        <>
            <StepperRed opened={opened} onClose={() => setOpened(false)} products={productsInSelectedGroup} />

            {loading ? <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} /> :
                <Table striped highlightOnHover>
                    <thead>
                        <tr>
                            <th >Juegos Disponibles </th>
                            <th ></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map((group, index) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} style={{ textAlign: 'center' }}>No se encontraron grupos permitidos.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            }
        </>
    );
};

export default TableC;
