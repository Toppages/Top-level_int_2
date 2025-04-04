import axios from 'axios';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { toast } from 'sonner';
import { IconBuildingFactory2, IconCheck, IconCopy, IconShoppingCart } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { Modal, Button, Stepper, Group, Table, ActionIcon, Text, NumberInput, CopyButton, Tooltip } from '@mantine/core';

function Generardesdepincentral() {
    const [opened, setOpened] = useState(false);
    const [active, setActive] = useState(0);
    const [products, setProducts] = useState<{ code: any; name: string; price: number }[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<{
        code: any; name: string; price: number
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [, setIsAuthorizing] = useState<boolean>(false);
    const [generating, setGenerating] = useState<boolean>(false);
    const [capturedPins, setCapturedPins] = useState<string[]>([]);

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
                    code: product.code || "defaultCode",
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

        setGenerating(true); 
        setIsAuthorizing(true);

        const apiKey = import.meta.env.VITE_API_KEY;
        const apiSecret = import.meta.env.VITE_API_SECRET;

        if (!apiKey || !apiSecret) {
            setGenerating(false);
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
                }
                nextStep();
            } else {
                console.error("Error en la solicitud de autorización.");
            }
        } catch (error) {
            console.error("Error en la solicitud de autorización:", error);
        } finally {
            setIsAuthorizing(false);
            setGenerating(false); 
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
                const pins = response.data.pins.map((pin: { key: any }) => pin.key);
                setCapturedPins(pins);


                const inventoryLogData = {
                    code: selectedProduct.code,
                    pins: pins,
                };

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
    const handleClose = () => {
        setOpened(false);
        setActive(0);
        setCapturedPins([]);
        setSelectedProduct(null);
        setQuantity(1);
    };

    return (
        <>
            <Modal size="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
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
                                style={{
                                    background: generating ? 'grey' : '#0c2a85',
                                    color: 'white'
                                }}
                                onClick={() => handleAuthorize()}
                                disabled={generating}
                            >
                                {generating ? 'Generando...' : 'Generar'}
                            </Button>

                        </Group>
                    </Stepper.Step>
                    <Stepper.Step label="Finalizar">
                        <Text size="lg" weight={500} mb="sm">Pines generados:</Text>
                        {capturedPins.length > 0 ? (
                            <Table striped highlightOnHover>
                                <thead style={{ background: '#0c2a85', color: 'white' }}>
                                    <tr>
                                        <th style={{ textAlign: 'center', color: 'white' }}>Pin</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {capturedPins.map((pin, index) => (
                                        <tr key={index}>
                                            <td style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span>{pin}</span>
                                                <CopyButton value={pin} timeout={1500}>
                                                    {({ copied, copy }) => (
                                                        <Tooltip label={copied ? "Copiado" : "Copiar"} withArrow position="right">
                                                            <Button
                                                                size="xs"
                                                                style={{
                                                                    background: '#0c2a85',
                                                                    color: 'white'
                                                                }}
                                                                color={copied ? 'teal' : 'blue'}
                                                                onClick={copy}
                                                            >
                                                                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                                            </Button>
                                                        </Tooltip>
                                                    )}
                                                </CopyButton>
                                            </td>
                                        </tr>
                                    ))}

                                </tbody>
                            </Table>
                        ) : (
                            <Text>No se recibieron pines.</Text>
                        )}

                        <Group position='center' mt="xl" mb="md">

                            <CopyButton value={capturedPins.join('\n')} timeout={1500}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? "Todos copiados" : "Copiar todos"} withArrow position="right">
                                        <Button
                                            mb="md"
                                            color={copied ? 'teal' : '#0c2a85'}
                                            onClick={copy}
                                            size="sm"
                                            style={{
                                                background: '#0c2a85',
                                                color: 'white'
                                            }}

                                        >
                                            {copied ? '✓ Todos copiados' : 'Copiar todos'}
                                        </Button>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        </Group>

                        <Button
                            fullWidth
                            color="red"
                            style={{ background: 'red', color: 'white' }}
                            onClick={handleClose}
                        >
                            Finalizar
                        </Button>
                    </Stepper.Step>

                    <Stepper.Completed>Completado</Stepper.Completed>
                </Stepper>
            </Modal>

            <Group position="center">
                <Button size="md" leftIcon={<IconBuildingFactory2 />}  style={{ background: '#0c2a85', color: 'white' }} onClick={() => setOpened(true)}>Pin central</Button>
            </Group>
        </>
    );
}

export default Generardesdepincentral;