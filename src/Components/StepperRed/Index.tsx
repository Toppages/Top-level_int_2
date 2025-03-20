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
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';

interface Product {
    code: string;
    name: string;
    price: number;
}

interface StepperMaProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
}

const StepperRed: React.FC<StepperMaProps> = ({ opened, onClose, products }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [capturedPins, setCapturedPins] = useState<string[]>([]);
    const [playerId, setPlayerId] = useState<string>('');
    const [isValidId, setIsValidId] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
    const [accountName, setAccountName] = useState<string>('');

    useEffect(() => {
        if (opened) {
            setActiveStep(0);
        } else {
            resetState();
        }
    }, [opened]);

    const resetState = () => {
        setSelectedProduct(null);
        setCapturedPins([]);
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
        setActiveStep(3);
        setTimeout(() => {
            onClose();
            setActiveStep(0);
            resetState();
        }, 2000);
    };

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
                                            <td>{product.price}USD</td>
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
                    <TextInput
                        label="ID del jugador"
                        placeholder="Ingresa el ID"
                        value={playerId}
                        onChange={(e) => handleIdChange(e.target.value)}
                        error={errorMessage}
                    />
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
                            onClick={() => setActiveStep(2)}
                            style={{ display: isValidId ? 'inline-block' : 'none', background: '#0c2a85' }}
                        >
                            Siguiente
                        </Button>
                    </Group>
                </Stepper.Step>

                <Stepper.Step label="Finalización" description="Detalles del producto y jugador">
                    <div>
                        <Title order={3} align="center">Detalles de los PINs Capturados</Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                        {capturedPins.length > 0 ? (
                            <Table striped highlightOnHover>
                                <thead>
                                    <tr>
                                        <th>Claves</th>
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

export default StepperRed;
