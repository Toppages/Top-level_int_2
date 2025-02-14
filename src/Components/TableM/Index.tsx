import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StepperMa from '../StepperMa/Index';
import { ActionIcon, Table, Loader, Input, ScrollArea } from '@mantine/core';
import { IconSearch, IconEye } from '@tabler/icons-react';
import { getAuthHeaders } from '../../utils/auth';

interface Product {
    product_group: string;
    code: string;
    name: string;
    price: string;
}

const TableM: React.FC = () => {
    const [opened, setOpened] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [selectedProductGroup, setSelectedProductGroup] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);

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
        setActiveStep(0);
    };

    const productsInSelectedGroup = selectedProductGroup
        ? fetchedProducts.filter(product => product.product_group === selectedProductGroup)
        : [];

    const allowedGroups = [
        "Free Fire Latam",
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
        "Xbox US USD"
    ];
    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    const filteredGroups = Array.from(new Set(fetchedProducts.map(product => product.product_group)))
        .filter(group => allowedGroups.includes(group))
        .sort((a, b) => (a === "Free Fire Latam" ? -1 : b === "Free Fire Latam" ? 1 : 0))
        .filter(group => group.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <>
            <StepperMa
                opened={opened}
                onClose={() => setOpened(false)}
                products={productsInSelectedGroup}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
            />

            {loading ? <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} /> :
                <ScrollArea style={{ height: windowHeight - 100 }} type="never">


                    <Table striped highlightOnHover>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Juegos Disponibles</th>
                                <th >
                                    <Input
                                        radius="md"
                                        size="md"
                                        icon={<IconSearch />}
                                        placeholder="Buscar Juego"
                                        value={searchQuery}
                                        onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}  // Actualizamos el estado
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map((group, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}>
                                            {group}
                                        </td>
                                        <td style={{ display: 'flex', justifyContent: 'center' }}>
                                            <ActionIcon
                                                onClick={() => openModalForGroup(group)}
                                                style={{ background: '#0c2a85', color: 'white' }}
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
                                    <td colSpan={2} style={{ textAlign: 'center' }}>No se encontro juegos disponibles.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </ScrollArea>
            }
        </>
    );
};

export default TableM;
