import React, { useState } from 'react';
import {
    Modal,
    Stepper,
    Title,
    Divider,
    Button,
    Group,
    Table,
    ActionIcon,
    Text,
    NumberInput,
} from '@mantine/core';
import { IconShoppingBag } from '@tabler/icons-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import { useMediaQuery } from '@mantine/hooks';

interface Product {
    code: string;
    name: string;
    price: string;
}

interface StepperMaProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
    activeStep: number;
    setActiveStep: React.Dispatch<React.SetStateAction<number>>;
    user: { _id: string; name: string; email: string, handle: string } | null;
}

const StepperMa: React.FC<StepperMaProps> = ({ opened, onClose, products, activeStep, setActiveStep, user }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
    const [capturedPins, setCapturedPins] = useState<string[]>([]);
    const isMobile = useMediaQuery('(max-width: 1000px)');
    const [captureId, setCaptureId] = useState<string | null>(null);

    const handleAuthorize = async () => {
        if (!selectedProduct) {
            console.error("Producto no seleccionado.");
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
        const verb = "POST";
        const route = "/api/pins/authorize";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const chunks = Math.ceil(quantity / 10);
        let allCapturedPins: string[] = [];

        for (let i = 0; i < chunks; i++) {
            const batchQuantity = i === chunks - 1 ? quantity % 10 : 10;
            const body = {
                product: selectedProduct.code,
                quantity: batchQuantity,
                order_id: moment().format("YYYYMMDD_HHmmss") + `_${i}`,
                client_name: "Juan Pérez",
                client_email: "juanperez@email.com"
            };

            const jsonBody = JSON.stringify(body);
            const hmacData = `${verb}${routeForHmac}${date}${jsonBody}`;
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
                    allCapturedPins = [...allCapturedPins, ...captureResponse];
                } else {
                    console.error("Error en la solicitud de autorización:");
                }
            } catch (error) {
                console.error("Error en la solicitud de autorización:", error);
            }
        }

        if (allCapturedPins.length > 0) {
            sendSaleToBackend(allCapturedPins);
            setActiveStep(2);
        }

        setIsAuthorizing(false);
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
                setCaptureId(response.data.id);
                setCapturedPins(response.data.pins.map((pin: { key: string }) => pin.key));
                return response.data.pins.map((pin: { key: string }) => pin.key);
            } else {
                console.error("Error en la solicitud de captura:");
            }
        } catch (error) {
            console.error("Error en la solicitud de captura:", error);
        } finally {
            setIsAuthorizing(false);
        }

        return [];
    };

    const sendSaleToBackend = async (pins: string[]) => {
        try {
            const totalPrice = parseFloat(selectedProduct?.price || "0") * quantity;
            const saleData = {
                quantity,
                product: selectedProduct?.code,
                productName: selectedProduct?.name,
                price: selectedProduct?.price,
                totalPrice: totalPrice.toFixed(2),
                status: "captured",
                order_id: moment().format("YYYYMMDD_HHmmss"),
                user: user ? { id: user._id, handle: user.handle, name: user.name, email: user.email } : null,
                pins: pins.map(pin => ({ serial: "", key: pin }))
            };

            console.log("Enviando venta:", saleData);

            const response = await axios.post('http://localhost:4000/sales', saleData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                console.log("Venta registrada con éxito en el backend");
                setCapturedPins(pins);
            } else {
                console.error("Error al registrar la venta en el backend");
            }
        } catch (error) {
            console.error("Error al enviar la venta al backend:", error);
        }
    };


    const handleFinishClick = () => {
        onClose();
        setActiveStep(0);
        setCapturedPins([]);
    };

    const tableTextStyle = {
        fontSize: isMobile ? '14px' : '14px',
        whiteSpace: 'normal',
    };

    return (
        <Modal opened={opened} onClose={onClose} withCloseButton={false} size="xl">
            <Stepper active={activeStep} color="#0c2a85" onStepClick={setActiveStep} allowNextStepsSelect={false} breakpoint="sm">
                <Stepper.Step label="Productos" description="Selecciona un producto">
                    <div>
                        <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                            Selecciona un Producto
                        </Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                        {products.length > 0 ? (
                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th style={tableTextStyle}>Producto</th>
                                        <th style={tableTextStyle}>Precio</th>
                                        <th style={tableTextStyle}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .slice()
                                        .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                                        .map(product => (
                                            <tr key={product.code}>
                                                <td style={tableTextStyle}>
                                                    {product.name.replace(/free fire\s*-\s*/gi, '').replace(/free fire/gi, '')}
                                                </td>
                                                <td style={{ fontSize: '12px' }}>{product.price} USD</td>
                                                <td>
                                                    <ActionIcon
                                                        onClick={() => {
                                                            setSelectedProduct(product);
                                                            setActiveStep(1);
                                                        }}
                                                        style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                                                        size="lg"
                                                        variant="filled"
                                                    >
                                                        <IconShoppingBag size={26} />
                                                    </ActionIcon>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p>No hay productos disponibles para este grupo.</p>
                        )}
                    </div>
                </Stepper.Step>

                <Stepper.Step label="Confirmar" description="Ingresa cantidad de Pines">
                    {selectedProduct && (
                        <>
                            <NumberInput
                                min={1}
                                max={100}
                                ta="center"
                                label="Cantidad"
                                placeholder="Cantidad"
                                radius="md"
                                size="md"
                                value={quantity}
                                onChange={(value) => {
                                    const numericValue = Number(value);
                                    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 100) {
                                        setQuantity(numericValue);
                                    }
                                }}
                                onInput={(e) => {
                                    const inputElement = e.target as HTMLInputElement;
                                    inputElement.value = inputElement.value.replace(/\D/g, "");

                                    if (inputElement.value !== "" && Number(inputElement.value) > 100) {
                                        inputElement.value = "100";
                                    }
                                }}
                                step={1}
                                disabled={isAuthorizing}
                            />
                            <Group position="apart">
                                <Title order={5}>Precio: {selectedProduct.price} USD</Title>
                                <Title order={5}>
                                    Total: {(parseFloat(selectedProduct.price) * quantity).toFixed(2)} USD
                                </Title>
                            </Group>
                            <Group position="center" mt="xl">
                                <Button
                                    onClick={handleAuthorize}
                                    style={{ background: '#0c2a85' }}
                                    loading={isAuthorizing}
                                >
                                    {isAuthorizing ? 'Generando...' : 'Generar'}
                                </Button>

                            </Group>
                        </>
                    )}
                </Stepper.Step>

                <Stepper.Step label="Finalización" description="Detalles de la compra">
                    <div>
                        <Title order={3} align="center">Detalles de los PINs Capturados</Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                        {captureId && (
                            <Text align="center" weight={700} size="md" style={{ marginBottom: '10px' }}>
                                Compra realizada
                            </Text>
                        )}
                        {capturedPins.length > 0 ? (
                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th>Pins</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {capturedPins.map((key, index) => (
                                        <tr key={index}>
                                            <td>{key}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <Text>No se han capturado PINs aún.</Text>
                        )}
                    </div>
                    <Group position="center" mt="xl">
                        <Button onClick={handleFinishClick} style={{ background: '#0c2a85' }}>
                            Finalizar
                        </Button>
                    </Group>
                </Stepper.Step>
            </Stepper>
        </Modal>
    );
};

export default StepperMa;