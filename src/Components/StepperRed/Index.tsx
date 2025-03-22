import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    TextInput,
    Card,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { fetchUserData } from "../../utils/utils";
import { Product } from '../../types/types';

interface StepperMaProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
    user: {
        purchaseLimits: any; _id: string; name: string; email: string, handle: string; role: string; saldo: number; rango: string;
    } | null;

}

const StepperRed: React.FC<StepperMaProps> = ({ opened, onClose, products, user }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [playerId, setPlayerId] = useState<string>('');
    const [isValidId, setIsValidId] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
    const [accountName, setAccountName] = useState<string>('');
    const [recargaInfo, setRecargaInfo] = useState<{ alerta: string; mensaje: string; Nickname?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [saleResponse, setSaleResponse] = useState<any>(null);
    const [userData, setUserData] = useState(user);

    const getPriceForUser = (product: Product, user: { rango: string } | null) => {
        const userRango = user ? user.rango : 'default';

        switch (userRango) {
            case 'oro':
                return product.price_oro;
            case 'plata':
                return product.price_plata;
            case 'bronce':
                return product.price_bronce;
            default:
                return product.price;
        }
    };

    useEffect(() => {
        if (opened) {
            fetchUserData(setUserData);
            setActiveStep(0);
        } else {
            resetState();
        }
    }, [opened]);

    const resetState = () => {
        setSelectedProduct(null);
        setPlayerId('');
        setIsValidId(false);
        setErrorMessage('');
        setAccountName('');
    };

    const handleIdChange = (value: string) => {
        setPlayerId(value);
        setErrorMessage('');
    };

    const validatePlayerId = async () => {
        if (!playerId) {
            setErrorMessage("El ID del jugador no puede estar vacío.");
            return;
        }

        setIsAuthorizing(true);
        setErrorMessage('');

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/validar/${playerId}`);
            const data = response.data;

            if (data.alerta === 'green') {
                setAccountName(data.Nickname);
                setIsValidId(true);
            } else {
                setErrorMessage(data.mensaje);
                setIsValidId(false);
            }
        } catch (error) {
            setErrorMessage("Error al validar el ID del jugador.");
            setIsValidId(false);
        }

        setIsAuthorizing(false);
    };

    const handleFinishClick = () => {

        onClose();
        setActiveStep(0);
        resetState();
    };

    const handleNextStep = async () => {
        if (!selectedProduct || !playerId) {
            setErrorMessage("Debe seleccionar un producto y un ID de jugador válido.");
            return;
        }

        setIsProcessing(true);

        try {
            const pinResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${selectedProduct.code}/pin`);
            const pinData = pinResponse.data.pin;

            if (!pinData || !pinData.pin_id) {
                setErrorMessage("Error al obtener el PIN del producto.");
                setIsProcessing(false);
                return;
            }

            const recargaResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/recarga/${playerId}/${pinData.pin_id}`);

            if (recargaResponse.status !== 200) {
                setErrorMessage("Error al procesar la recarga.");
                setIsProcessing(false);
                return;
            }

            setRecargaInfo(recargaResponse.data);

            const purchaseLimit = user?.purchaseLimits?.[selectedProduct.code];
            const limit = purchaseLimit ? purchaseLimit.limit : 0;

            const saleData = {
                user: user ? {
                    id: user._id,
                    handle: user.handle,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    saldo: userData ? userData.saldo : 0
                } : null,
                playerId,
                nickname: accountName,
                quantity: 1,
                price: getPriceForUser(selectedProduct, user),
                product: selectedProduct.code,
                productName: selectedProduct.name,
                totalPrice: getPriceForUser(selectedProduct, user),
                totalOriginalPrice: selectedProduct.price,
                moneydisp: user ? user.saldo : 0,
                status: "completado",
                order_id: `ORD-${Date.now()}`,
                pins: [
                    {
                        serial: pinData.pin_id,
                        key: pinData.pin || "DEFAULT_KEY",
                        usado: false,
                        productName: selectedProduct.name
                    }
                ],
                purchaseLimit: limit  // Enviar el límite de compra
            };

            const saleResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/sales`, saleData);

            if (saleResponse.status === 201) {
                setSaleResponse(saleResponse.data);
                setActiveStep(2);
            } else {
                setErrorMessage("Error al registrar la venta.");
            }
        } catch (error) {
            setErrorMessage("Ocurrió un error en el proceso.");
        }

        setIsProcessing(false);
    };


    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchUserData(setUserData);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Modal opened={opened} onClose={onClose} withCloseButton={false} size="xl">
            <Stepper active={activeStep} color="#0c2a85" allowNextStepsSelect={false} onStepClick={setActiveStep} breakpoint="sm">

                <Stepper.Step label="Detalles del Producto" description="Selecciona un producto">
                    <div>
                        <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                            Selecciona un Producto
                        </Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                        {products.length > 0 ? (

                            <Table striped highlightOnHover>
                                <thead style={{ background: '#0c2a85' }}>
                                    <tr>
                                        <th>
                                            <Text c='white' ta={'center'}>
                                                Producto
                                            </Text>
                                        </th>
                                        <th>
                                            <Text c='white' ta={'center'}>
                                                {user?.role === 'vendedor' ? 'Límite de hoy' : 'Precio'}
                                            </Text>
                                        </th>
                                        <th>
                                            <Text c='white' ta={'center'}>
                                            </Text>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => {
                                        const productPrice = getPriceForUser(product, user);
                                        const isLimitZero = user?.purchaseLimits?.[product.code]?.limit === 0;
                                        const isPriceGreaterThanBalance = productPrice > (user?.saldo || 0);

                                        const isDisabled = isLimitZero || isPriceGreaterThanBalance;

                                        if (user?.role === 'vendedor') {
                                            const purchaseLimit = user?.purchaseLimits?.[product.code];
                                            const limit = purchaseLimit ? purchaseLimit.limit : 'No disponible';

                                            return (
                                                <tr key={product.code}>
                                                    <td>{product.name}</td>
                                                    <td style={{ fontSize: '12px', textAlign: 'center' }}>
                                                        {limit}
                                                    </td>
                                                    <td>
                                                        <ActionIcon
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setActiveStep(1);
                                                            }}
                                                            style={{
                                                                background: isDisabled ? '#d3d3d3' : '#0c2a85',
                                                                color: isDisabled ? '#a0a0a0' : 'white',
                                                                marginLeft: '10px'
                                                            }}
                                                            size="lg"
                                                            variant="filled"
                                                            disabled={isDisabled}
                                                        >
                                                            <IconEye size={26} />
                                                        </ActionIcon>
                                                    </td>
                                                </tr>
                                            );
                                        } else {
                                            return (
                                                <tr key={product.code}>
                                                    <td>{product.name}</td>
                                                    <td style={{ fontSize: '12px', textAlign: 'center' }}>
                                                        {productPrice} USD
                                                    </td>
                                                    <td>
                                                        <ActionIcon
                                                            onClick={() => {
                                                                setSelectedProduct(product);
                                                                setActiveStep(1);
                                                            }}
                                                            style={{
                                                                background: isDisabled ? '#d3d3d3' : '#0c2a85',
                                                                color: isDisabled ? '#a0a0a0' : 'white',
                                                                marginLeft: '10px'
                                                            }}
                                                            size="lg"
                                                            variant="filled"
                                                            disabled={isDisabled}
                                                        >
                                                            <IconEye size={26} />
                                                        </ActionIcon>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    })}
                                </tbody>
                            </Table>



                        ) : (
                            <p>No hay productos disponibles para este grupo.</p>
                        )}
                    </div>
                </Stepper.Step>

                <Stepper.Step label="Confirmar" description="Ingresa el ID del jugador">
                    <TextInput
                        label="ID del jugador"
                        placeholder="Ingresa el ID"
                        value={playerId}
                        onChange={(e) => handleIdChange(e.target.value)}
                        error={errorMessage}
                    />

                    {selectedProduct && (
                        <div style={{ marginTop: '10px', display: 'none', padding: '10px', border: '1px solid #ddd' }}>
                            <Text><strong>Producto Seleccionado:</strong> {selectedProduct.name}</Text>
                            <Text><strong>Precio:</strong> {selectedProduct.price} USD</Text>
                        </div>
                    )}

                    {accountName && isValidId && (
                        <Text align="center" mt="sm" style={{ fontWeight: 'bold', color: '#28a745' }}>
                            Nombre de cuenta validado: {accountName}
                        </Text>
                    )}

                    <Group position="center" mt="xl">
                        <Button variant="default" onClick={() => setActiveStep(0)}>
                            Atrás
                        </Button>
                        <Button
                            disabled={isAuthorizing}
                            onClick={validatePlayerId}
                            style={{ background: '#0c2a85' }}
                        >
                            {isAuthorizing ? "Validando..." : "Confirmar ID"}
                        </Button>
                        <Button
                            onClick={handleNextStep}
                            disabled={isProcessing}
                            style={{ display: isValidId ? 'inline-block' : 'none', background: '#0c2a85' }}
                        >
                            {isProcessing ? "Procesando..." : "Siguiente"}
                        </Button>


                    </Group>
                </Stepper.Step>

                <Stepper.Step label="Finalización" description="Detalles de la venta">
                    <div style={{ textAlign: "center" }}>
                        {saleResponse ? (
                            <>
                                <Card>
                                    <Text size="lg" weight={700} color="green">
                                        🎉🎉   Recarga exitosa   🎉🎉
                                    </Text>
                                    <Text size="md">
                                        <strong>Id:</strong> {saleResponse.sale.saleId}
                                    </Text>
                                    <Text size="md">
                                        <strong>Producto:</strong> {saleResponse.sale.productName}
                                    </Text>
                                    <Text size="md">
                                        <strong>Jugador:</strong> {saleResponse.sale.nickname} ({saleResponse.sale.playerId})
                                    </Text>
                                    <Text size="md">
                                        <strong>Fecha:</strong> {`${new Date(saleResponse.sale.created_at).toISOString().split('T')[0]} ${new Date(saleResponse.sale.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                                    </Text>

                                    {recargaInfo && (
                                        <div style={{ display: 'none', marginTop: '10px' }}>
                                            <Text size="sm" color="blue">
                                                <strong>Detalles de la Recarga:</strong>
                                            </Text>
                                            <Text size="sm">Alerta: {recargaInfo.alerta}</Text>
                                            <Text size="sm">Mensaje: {recargaInfo.mensaje}</Text>
                                            {recargaInfo.Nickname && (
                                                <Text size="sm">Nickname: {recargaInfo.Nickname}</Text>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            </>
                        ) : (
                            <Text size="md">Cargando detalles de la venta...</Text>
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

export default StepperRed;