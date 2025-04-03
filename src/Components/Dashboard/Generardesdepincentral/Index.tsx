import { useState, useEffect } from 'react';
import { Modal, Button, Stepper, Group, Table, ActionIcon, Text, NumberInput } from '@mantine/core';
import axios from 'axios';
import { toast } from 'sonner';
import { IconShoppingCart } from '@tabler/icons-react';

function Generardesdepincentral() {
    const [opened, setOpened] = useState(false);
    const [active, setActive] = useState(0);
    const [products, setProducts] = useState<{ name: string; price: number }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<{ name: string; price: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    useEffect(() => {
        if (opened) {
            fetchProductsFromAPI();
        }
    }, [opened]);

    const fetchProductsFromAPI = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
            if (response.status === 200) {
                const sortedProducts = response.data.sort((a: any, b: any) => a.price - b.price);
                setProducts(sortedProducts);
            }
        } catch (error) {
            toast.error('Hubo un problema al obtener los productos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal size="lg" opened={opened} onClose={() => setOpened(false)} withCloseButton={false}>
                <Stepper color="#0c2a85" active={active} onStepClick={setActive} allowNextStepsSelect={false} breakpoint="sm">
                    <Stepper.Step label="Juegos">
                        <Table>
                            <thead style={{ background: '#0c2a85', color: 'white' }}>
                                <tr>
                                    <th style={{ textAlign: 'center', color: 'white' }}>Juegos Disponibles</th>
                                    <th style={{ textAlign: 'center', color: 'white' }}>Precio</th>
                                    <th style={{ textAlign: 'center', color: 'white' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: 'center' }}>Cargando...</td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.name}>
                                            <td style={{ textAlign: 'center' }}>{product.name}</td>
                                            <td style={{ textAlign: 'center' }}>{product.price.toFixed(3)} USD</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <ActionIcon
                                                    style={{ background: '#0c2a85', color: 'white' }}
                                                    size="lg"
                                                    variant="filled"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setQuantity(1);
                                                        nextStep();
                                                    }}
                                                >
                                                    <IconShoppingCart size={26} />
                                                </ActionIcon>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </Stepper.Step>

                    <Stepper.Step label="Cantidad de pines">
                        {selectedProduct && (
                            <>
                                <Group position="apart" mb="md">
                                    <Text size="lg" weight={500}>Producto seleccionado:</Text>
                                    <Text size="md">{selectedProduct.name}</Text>
                                </Group>
                                <NumberInput
                                    max={10}
                                    min={1}
                                    value={quantity}
                                    onChange={(value) => setQuantity(value || 1)}
                                    placeholder="Cantidad de pines"
                                    label="Cantidad de pines"
                                    radius="md"
                                    size="md"
                                />
                                <Group mt={15} position="apart" mb="md">
                                <Text size="md">Precio total: {(selectedProduct.price).toFixed(3)} USD</Text>
                                <Text size="md">Precio total: {(selectedProduct.price * quantity).toFixed(3)} USD</Text>
                                </Group>
                            </>
                        )}
                        <Group position="center" mt="xl">
                            <Button
                                style={{ background: 'grey', color: 'white' }} variant="default" onClick={prevStep}>Back</Button>
                            <Button
                                style={{ background: '#0c2a85', color: 'white' }} onClick={nextStep}>Next step</Button>
                        </Group>
                    </Stepper.Step>

                    <Stepper.Step label="Finalizar">Step 3 content: Get full access</Stepper.Step>
                    <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
                </Stepper>
            </Modal>

            <Group position="center">
                <Button onClick={() => setOpened(true)}>Pin central</Button>
            </Group>
        </>
    );
}

export default Generardesdepincentral;
