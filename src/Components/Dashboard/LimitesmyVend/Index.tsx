import axios from "axios";
import { Product } from "../../../types/types";
import { useState, useEffect } from "react";
import { fetchProductsFromAPI } from "../../../utils/utils";
import { Modal, Button, Group, Card, Stack, Select, Text, Loader, NumberInput } from "@mantine/core";
import { toast } from 'sonner';

interface tProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; } | null;
}

interface vendedor {
    _id: string;
    name: string;
    email: string;
    role: string;
    handle: string;
}

const LimitesmyVend = ({ user }: tProps) => {
    const [opened, setOpened] = useState(false);
    const [vendedores, setVendedores] = useState<{ value: string, label: string }[]>([]);
    const [selectedVendedor, setSelectedVendedor] = useState<string | null>(null);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [purchaseLimits, setPurchaseLimits] = useState<Record<string, number>>({});

    useEffect(() => {
        if (!opened || !user?.handle) return;
    
        axios.get<vendedor[]>(`${import.meta.env.VITE_API_BASE_URL}/users/under-admin/${user.handle}`)
            .then(({ data }) => {
                setVendedores(data
                    .filter(client => client.role === 'vendedor')
                    .map(client => ({
                        value: client.handle,
                        label: `${client.name} (${client.email})`,
                    }))
                );
            })
            .catch(error => {
                toast.error('Error al obtener la lista de vendedores.');
                console.error('Error fetching users under admin:', error);
            });
    
        fetchProductsFromAPI(setFetchedProducts, setLoading);
    }, [opened, user?.handle]);
    

    useEffect(() => {
        if (selectedVendedor) {
            axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/vendedores/${selectedVendedor}`)
                .then(({ data }) => {
                    if (data.purchaseLimits) {
                        const limits: Record<string, number> = {};
                        Object.keys(data.purchaseLimits).forEach((productCode) => {
                            limits[productCode] = data.purchaseLimits[productCode].limit;
                        });
                        setPurchaseLimits(limits);
                    }
                })
                .catch(error => console.error('Error fetching purchase limits:', error));
        }
    }, [selectedVendedor]);

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

        const updates = Object.entries(purchaseLimits);

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
                    `${import.meta.env.VITE_API_BASE_URL}/users/${selectedVendedor}/purchase-limits/${productCode}`,
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

    const handleUpdateAllLimits = async () => {
        setLoading(true);
        try {
            const { data: allVendedores } = await axios.get<vendedor[]>(`${import.meta.env.VITE_API_BASE_URL}/users/under-admin/${user?.handle}`);
            const vendedoresFiltrados = allVendedores.filter(client => client.role === 'vendedor');

            for (const vendedor of vendedoresFiltrados) {
                const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/vendedores/${vendedor.handle}`);

                if (data.purchaseLimits) {
                    for (const productCode in data.purchaseLimits) {
                        const product = fetchedProducts.find((p) => p.code === productCode);
                        if (!product) continue;

                        await axios.put(
                            `${import.meta.env.VITE_API_BASE_URL}/users/${vendedor.handle}/purchase-limits/${productCode}`,
                            {
                                productCode,
                                limit: data.purchaseLimits[productCode].originLimit,
                                name: product.name,
                                price: product.price,
                            }
                        );
                    }
                }
            }

            toast.success("Límites de todos los vendedores actualizados correctamente.");
        } catch (error) {
            toast.error("Hubo un error al actualizar los límites de todos los vendedores.");
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

                <Button mb={15} fullWidth style={{ background: '#0c2a85' }} onClick={handleUpdateAllLimits}>
                        Restablecer Todos los Límites
                    </Button>
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
            <Group>



            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                Límite de los vendedores
            </Button>
            </Group>
        </>
    );
};

export default LimitesmyVend;
