import React, { useState } from 'react';
import {
    Modal,
    Stepper,
    Title,
    Divider,
    Button,
    Group,
    Card,
    NumberInput,
    Table,
    ActionIcon,
} from '@mantine/core';
import { IconEye, IconUserFilled } from '@tabler/icons-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';

interface Product {
    code: string;
    name: string;
    price: string;
}

interface StepperMaProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
}

const StepperMa: React.FC<StepperMaProps> = ({ opened, onClose, products }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [playerId, setPlayerId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

    const handleAuthorize = async () => {
        if (!selectedProduct) return;
        setIsAuthorizing(true);

        const apiKey = localStorage.getItem('apiKey');
        const apiSecret = localStorage.getItem('apiSecret');

        if (!apiKey || !apiSecret) {
            setIsAuthorizing(false);
            return;
        }

        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");

        const url = 'https://pincentral.baul.pro/api/pins/authorize';
        const verb = "POST";
        const route = "/api/pins/authorize";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const body = {
            product: selectedProduct.code,
            quantity,
            order_id: moment().format("YYYYMMDD_HHmmss"),
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
                console.log("Autorización exitosa", response.data);

                const generatedPlayerId = response.data.id;
                setPlayerId(generatedPlayerId);


                handleCapture(generatedPlayerId);
                setActiveStep(1);
            } else {
            }
        } catch (error) {
            console.error("Error en la solicitud de autorización:", error);
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleCapture = async (playerId: string) => {
        if (!playerId) {
            return;
        }

        const apiKey = localStorage.getItem('apiKey');
        const apiSecret = localStorage.getItem('apiSecret');

        if (!apiKey || !apiSecret) {
            alert("Error: No se encontraron credenciales de API. Inicia sesión nuevamente.");
            return;
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
                console.log("PINs capturados:", response.data.pins);
                alert("PINs capturados con éxito.");
                setActiveStep(2);
            } else {
                alert("No se pudo capturar los PINs.");
            }
        } catch (error) {
            console.error("Error en la solicitud de captura:", error);
            alert("Ocurrió un error al capturar los PINs.");
        }
    };

    const handleConfirmClick = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setActiveStep(2);
        }, 3000);
    };

    const handleFinishClick = () => {
        setActiveStep(3);
        setTimeout(() => {
            onClose();
            setActiveStep(0);
            setPlayerId('');
        }, 2000);
    };

    return (
        <Modal opened={opened} onClose={onClose} withCloseButton={false} size="xl">
            <Stepper active={activeStep} color="#0c2a85" onStepClick={setActiveStep} breakpoint="sm">
                <Stepper.Step label="Detalles del Producto" description="Selecciona un producto">
                    <div>
                        <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                            Selecciona un Producto
                        </Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />

                        {products.length > 0 ? (
                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Precio</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.code}>
                                            <td>{product.name}</td>
                                            <td>{product.price}$</td>
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
                                                    <IconEye size={26} />
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

                <Stepper.Step label="Confirmar" description="Ingresa el ID del jugador">
                    {selectedProduct && (
                        <>
                            <NumberInput
                                min={1}
                                max={10}
                                ta="center"
                                label="Cantidad"
                                placeholder="Cantidad"
                                radius="md"
                                size="md"
                                value={quantity}
                                onChange={(value) => setQuantity(value ?? 1)}
                                disabled={isAuthorizing}
                            />

                            <Group position="apart">
                                <Title order={5}>Precio: {selectedProduct.price} $</Title>
                                <Title order={5}>Total: {parseFloat(selectedProduct.price) * quantity} $</Title>
                            </Group>

                            <Group position="center" mt="xl">
                                <Button
                                    onClick={handleAuthorize}
                                    style={{ background: '#0c2a85' }}
                                    loading={isAuthorizing}
                                >
                                    Siguiente
                                </Button>
                            </Group>
                        </>
                    )}
                </Stepper.Step>

                <Stepper.Step label="Confirmación" description="Detalles del producto y jugador">
                    {selectedProduct && (
                        <Group position="center">
                            <Card radius="md" withBorder>
                                <Group position="center">
                                    <IconUserFilled size={64} />
                                </Group>
                                <Title align="center" order={2}>Jugador</Title>
                                <Title align="center" order={4}>{playerId}</Title>
                            </Card>
                            <div>
                                <Title order={3} style={{ fontWeight: 700, color: '#333' }}>
                                    {selectedProduct.name}
                                </Title>
                                <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                                <p>Precio: {parseFloat(selectedProduct.price) * quantity} $</p>
                            </div>
                        </Group>
                    )}
                    <Group position="center" mt="xl">
                        <Button variant="default" onClick={() => setActiveStep(1)}>
                            Atrás
                        </Button>
                        <Button style={{ background: '#0c2a85' }} onClick={handleFinishClick}>
                            Finalizar
                        </Button>
                    </Group>
                </Stepper.Step>

                <Stepper.Completed>
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Title order={3}>Proceso completado</Title>
                    </div>
                </Stepper.Completed>
            </Stepper>
        </Modal>
    );
};

export default StepperMa;
