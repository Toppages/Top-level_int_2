import axios from 'axios';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { toast } from 'sonner';
import { IconShoppingCart } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { Modal, Button, Stepper, Group, Table, ActionIcon, Text, NumberInput } from '@mantine/core';

function Generardesdepincentral() {
    const [opened, setOpened] = useState(false);
    const [active, setActive] = useState(0);
    const [products, setProducts] = useState<{ code: any; name: string; price: number }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<{
        code: any; name: string; price: number
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
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
                const sortedProducts = response.data.map((product: any) => ({
                    code: product.code || "defaultCode", // Ensure code exists
                    name: product.name,
                    price: product.price
                })).sort((a: any, b: any) => a.price - b.price);

                setProducts(sortedProducts);
            }
        } catch (error) {
            toast.error('Hubo un problema al obtener los productos');
        } finally {
            setLoading(false);
        }
    };


    const handleAuthorize = async () => {
        if (!selectedProduct) {
            return;
        }

        if (quantity < 1 || quantity > 10) {
            return;
        }

        setIsAuthorizing(true);

        const apiKey = import.meta.env.VITE_API_KEY;
        const apiSecret = import.meta.env.VITE_API_SECRET;

        if (!apiKey || !apiSecret) {
            setIsAuthorizing(false);
            return;
        }

        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const url = 'https://pincentral.baul.pro/api/pins/authorize';
        const route = "/api/pins/authorize";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const body = {
            product: selectedProduct.code,
            quantity: quantity,
            order_id: moment().format("YYYYMMDD_HHmmss"),
            client_name: "Juan Pérez",
            client_email: "juanperez@email.com"
        };

        const jsonBody = JSON.stringify(body);
        const hmacData = `POST${routeForHmac}${date}${jsonBody}`;
        const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
        const authorizationHeader = `${apiKey}:${hmacSignature}`;

        try {
            const response = await axios.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Date': date,
                    'Authorization': authorizationHeader
                }
            });

            if (response.status === 200 && response.data.status === "authorized") {
                const captureResponse = await handleCapture(response.data.id);
                if (captureResponse.length > 0) {
                    (captureResponse);
                }
            } else {
                console.error("Error en la solicitud de autorización.");
            }
        } catch (error) {
            console.error("Error en la solicitud de autorización:", error);
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleCapture = async (playerId: string) => {
        if (!playerId || !selectedProduct) {
            setIsAuthorizing(false);
            return [];
        }
    
        const apiKey = import.meta.env.VITE_API_KEY;
        const apiSecret = import.meta.env.VITE_API_SECRET;
    
        if (!apiKey || !apiSecret) {
            console.error("Error en la solicitud de captura");
            setIsAuthorizing(false);
            return [];
        }
    
        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const captureUrl = 'https://pincentral.baul.pro/api/pins/capture';
        const captureBody = {
            id: playerId
        };
    
        const jsonBody = JSON.stringify(captureBody);
    
        const verb = "POST";
        const route = "/api/pins/capture";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;
    
        const hmacData = `${verb}${routeForHmac}${date}${jsonBody}`;
        const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
        const authorizationHeader = `${apiKey}:${hmacSignature}`;
    
        try {
            const response = await axios.post(captureUrl, captureBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Date': date,
                    'Authorization': authorizationHeader
                }
            });
    
            if (response.status === 200 && response.data.status === "captured") {
                const pins = response.data.pins.map((pin: { key: any; }) => pin.key);
    
                // Aquí almacenamos los pines en la base de datos
                const inventoryLogData = {
                    code: selectedProduct.code,
                    pins: pins, // Pines obtenidos
                };
    
                // Llamada al backend para agregar los pines al inventario y registrar el movimiento
                await axios.post(`${import.meta.env.VITE_API_BASE_URL}/inventory/register-log`, inventoryLogData);
                toast.success('Movimiento registrado exitosamente en el inventario');
            }
    
        } catch (error) {
            console.error("Error en la solicitud de captura:", error);
        } finally {
            setIsAuthorizing(false);
        }
    
        return [];
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
                            <Button style={{ background: 'grey', color: 'white' }} variant="default" onClick={prevStep}>Atras</Button>
                            <Button
                                style={{ background: '#0c2a85', color: 'white' }}
                                onClick={() => handleAuthorize()}
                            >
                                Generar
                            </Button>
                        </Group>
                    </Stepper.Step>

                    <Stepper.Step label="Finalizar">Step 3 content: Get full access</Stepper.Step>
                    <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
                </Stepper>
            </Modal>

            <Group position="center">
                <Button style={{ background: '#0c2a85', color: 'white' }} onClick={() => setOpened(true)}>Pin central</Button>
            </Group>
        </>
    );
}

export default Generardesdepincentral;