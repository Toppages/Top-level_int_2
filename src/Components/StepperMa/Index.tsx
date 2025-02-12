import React, { useState } from 'react';
import {
    Modal,
    Stepper,
    Title,
    Divider,
    TextInput,
    Button,
    Group,
    Card,
    Loader,
    NumberInput,
} from '@mantine/core';
import { IconUserFilled } from '@tabler/icons-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';

interface Product {
    code: number;
    name: string;
    price: number;
}

interface ProductModalProps {
    opened: boolean;
    onClose: () => void;
    product: Product | null;
}

const StepperMa: React.FC<ProductModalProps> = ({ opened, onClose, product }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [playerId, setPlayerId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

    const handleAuthorize = async () => {
        if (!product) return;
        setIsAuthorizing(true);
    
        const apiKey = localStorage.getItem('apiKey');
        const apiSecret = localStorage.getItem('apiSecret');
    
        if (!apiKey || !apiSecret) {
            alert("Error: No se encontraron credenciales de API. Inicia sesión nuevamente.");
            setIsAuthorizing(false);
            return;
        }
    
        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    
        const url = 'https://pincentral.baul.pro/api/pins/authorize';
        const verb = "POST";
        const route = "/api/pins/authorize";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;
    
        const body = {
            product: product.code.toString(),
            quantity,
            order_id: "test_1",
            client_name: "Juan Pérez",
            client_email: "juanperez@email.com" 
        };
    
        const jsonBody = JSON.stringify(body);
    
        const hmacData = `${verb}${routeForHmac}${date}${jsonBody}`;
        const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
        const authorizationHeader = `${apiKey}:${hmacSignature}`;
    

        console.log("Fecha (X-Date):", date);
        console.log("Datos para HMAC:", hmacData);
        console.log("Firma HMAC:", hmacSignature);
        console.log("Encabezado de Autorización:", authorizationHeader);
        console.log("Cuerpo de la petición:", jsonBody);
    
        try {
            const response = await axios.post(url, body, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Date': date,
                    'Authorization': authorizationHeader
                }
            });
    
            console.log('Respuesta de la API:', response.data);
    
            if (response.status === 200 && response.data.status === "authorized") {
                setActiveStep(1);
            } else {
                alert("No se pudo autorizar la solicitud.");
            }
        } catch (error: any) {
            console.error("Error en la solicitud:", error);
            alert("Ocurrió un error al autorizar el pedido.");
        } finally {
            setIsAuthorizing(false);
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
               
                <Stepper.Step label="Detalles del Producto" description="Revisa la información">
                    {product ? (
                        <>
                            <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                                {product.name}
                            </Title>
                            <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />

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
                                <Title order={5}>Precio: {product.price} $</Title>
                                <Title order={5}>Total: {product.price * quantity} $</Title>
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
                    ) : (
                        <Loader color="indigo" size="xl" variant="dots" />
                    )}
                </Stepper.Step>

             
                <Stepper.Step label="Confirmar" description="Ingresa el ID del jugador">
                    <TextInput
                        label="ID del jugador"
                        placeholder="Ingresa el ID"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.currentTarget.value)}
                    />
                    <Group position="center" mt="xl">
                        <Button variant="default" onClick={() => setActiveStep(0)}>
                            Atrás
                        </Button>
                        <Button
                            style={{ background: !playerId.trim() ? 'grey' : '#0c2a85' }}
                            onClick={handleConfirmClick}
                            disabled={!playerId.trim()}
                            loading={isLoading}
                        >
                            Confirmar
                        </Button>
                    </Group>
                </Stepper.Step>

                <Stepper.Step label="Confirmación" description="Detalles del producto y jugador">
                    {product ? (
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
                                    {product.name}
                                </Title>
                                <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                                <p>Precio: {product.price * quantity} $</p>
                            </div>
                        </Group>
                    ) : (
                        <p style={{ textAlign: 'center' }}>No se ha seleccionado ningún producto.</p>
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
