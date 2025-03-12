import axios from "axios";
import { Product } from "../../../types/types";
import { useState, useEffect } from "react";
import { fetchProductsFromAPI } from "../../../utils/utils";
import { Modal, Button, Group, Card, Stack, Select, Text, Loader, NumberInput } from "@mantine/core";
import { toast } from 'sonner';

const LimitVendedores = () => {
    const [opened, setOpened] = useState(false);
    const [vendedores, setVendedores] = useState<{ value: string, label: string }[]>([]);
    const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [purchaseLimits, setPurchaseLimits] = useState<Record<string, number>>({});

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/users/vendedores`)
            .then(({ data }) => {
                setVendedores(data.map((vendedor: { handle: string, name: string }) => ({
                    value: vendedor.handle,
                    label: `${vendedor.name}`
                })));
            })
            .catch(error => console.error('Error fetching vendedores:', error));
    }, []);

    useEffect(() => {
        fetchProductsFromAPI(setFetchedProducts, setLoading);
    }, []);

    const handleClose = () => {
        setOpened(false);
        setSelectedVendedor(null); 
        setPurchaseLimits({}); 
    };
    

    const handleSelectChange = (value: string | null) => {
        setSelectedVendedor(value);
    };

    const handleLimitChange = (productCode: string, value: number | '') => {
        setPurchaseLimits((prev) => ({
            ...prev,
            [productCode]: value === '' ? 0 : value,
        }));
    };

    const handleUpdateLimits = async () => {
        if (!selectedVendedor) {
            toast.error("Selecciona un vendedor antes de actualizar.");
            return;
        }
    
        const updates = Object.entries(purchaseLimits).filter(([_, limit]) => limit > 0);
    
        if (updates.length === 0) {
            toast.error("Debes ingresar al menos un límite para actualizar.");
            return;
        }
    
        setLoading(true); 
    
        try {
            for (const [productCode, limit] of updates) {
                const product = fetchedProducts.find((p) => p.code === productCode);
                if (!product) continue;
    
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/users/${selectedVendedor}/purchase-limits/${productCode}`,
                    { productCode, limit, name: product.name, price: product.price }
                );
            }
    
            toast.success("Límites actualizados correctamente.");
            handleClose();
        } catch (error) {
            toast.error("Hubo un error al actualizar los límites.");
        } finally {
            setLoading(false); 
        }
    };
    

    const extractDiamantes = (productName: string) => {
        let cleanName = productName.replace(/Free Fire\s*-*\s*/i, "").trim();
        const match = cleanName.match(/^(\d{1,3}(?:\.\d{3})*|\d+)\s*Diamantes/);
        return match ? `${match[1]} Diamantes` : cleanName;
    };

    const sortedProducts = [...fetchedProducts].sort((a, b) => Number(a.price) - Number(b.price));

    return (
        <>
            <Modal radius="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
                <Text fw={500} fz="xl">Límite de compra por vendedor</Text>
                <Select
                    label="Selecciona un vendedor"
                    placeholder="Elige un vendedor"
                    data={vendedores}
                    value={selectedVendedor}
                    onChange={handleSelectChange}
                    transition="pop-top-left"
                    transitionDuration={80}
                    transitionTimingFunction="ease"
                    styles={() => ({
                        item: {
                            '&[data-selected]': {
                                '&, &:hover': {
                                    backgroundColor: '#0c2a85',
                                    color: 'white',
                                },
                            },
                        },
                    })}
                />
                <Text mt={15} fw={500} fz="xl">Productos</Text>

                {loading ? (
                    <Group position="center" mt="md">
                        <Loader size="sm" />
                    </Group>
                ) : (
                    <>
                        {sortedProducts.length === 0 ? (
                            <Text align="center" mt="md">
                                No hay productos disponibles.
                            </Text>
                        ) : (
                            <Stack mt="md">
                                {sortedProducts.map((product) => (
                                    <Card withBorder key={product.code}>
                                        <Group position="apart">
                                            <Text>{extractDiamantes(product.name)}</Text>
                                            <NumberInput
                                                w={70}
                                                min={0}
                                                value={purchaseLimits[product.code] ?? ""}
                                                onChange={(value) => handleLimitChange(product.code, value ?? "")}
                                            />
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </>
                )}
                <Group position="center" mt="md">
                    <Button style={{ background: '#0c2a85' }} onClick={handleUpdateLimits}>
                        Actualizar Límite
                    </Button>
                </Group>
            </Modal>

            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                Límite de los vendedores
            </Button>
        </>
    );
};

export default LimitVendedores;