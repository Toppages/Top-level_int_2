import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado
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
import moment from 'moment';
import CryptoJS from 'crypto-js'; // Si no tienes crypto-js, instálalo

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

const StepperRed: React.FC<StepperMaProps> = ({ opened, onClose, products }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [capturedPins, setCapturedPins] = useState<string[]>([]);
    const [playerId, setPlayerId] = useState<string>('');  // Estado para el ID del jugador
    const [isValidId, setIsValidId] = useState<boolean>(false); // Estado para validar el ID
    const [errorMessage, setErrorMessage] = useState<string>(''); // Estado para el mensaje de error
    const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false); // Estado de autorización
    const [accountName, setAccountName] = useState<string>(''); // Estado para el nombre de cuenta recibido de la API

    const handleIdChange = (value: string) => {
        setPlayerId(value);
        setErrorMessage(''); // Limpiar el mensaje de error cada vez que el usuario escribe
    };

    const handleConfirmClick = async () => {
        if (!selectedProduct || !playerId) {
            setErrorMessage('Por favor, ingrese un ID válido y seleccione un producto.');
            setIsValidId(false);
            return;
        }

        // Realizamos la validación del ID con la API
        setIsAuthorizing(true);
        const apiKey = localStorage.getItem('apiKey');
        const apiSecret = localStorage.getItem('apiSecret');

        if (!apiKey || !apiSecret) {
            setIsAuthorizing(false);
            setErrorMessage('No se encontraron las credenciales de autenticación.');
            return;
        }

        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const url = 'https://pincentral.baul.pro/api/recharges/validate';
        const verb = "POST";
        const route = "/api/recharges/validate";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const body = {
            product_code: selectedProduct.code,
            service_user_id: playerId,
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
                    'Authorization': authorizationHeader,
                }
            });

            if (response.status === 200 && response.data.status === true) {
                console.log("ID de jugador validado:", response.data);
                setIsValidId(true); // Habilitamos el botón siguiente
                setErrorMessage('');
                setAccountName(response.data.account_name); // Guardamos el nombre de cuenta recibido
                setActiveStep(2); // Avanzamos al siguiente paso
            } else {
                setIsValidId(false);
                setErrorMessage('El ID del jugador no es válido o la validación falló.');
            }
        } catch (error) {
            console.error("Error en la validación:", error);
            setIsValidId(false);
            setErrorMessage('Hubo un error al validar el ID.');
        } finally {
            setIsAuthorizing(false);
        }
    };

    const handleFinishClick = () => {
        setActiveStep(3);
        setTimeout(() => {
            onClose();
            setActiveStep(0);
            setCapturedPins([]);
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
                    <TextInput
                        label="ID del jugador"
                        placeholder="Ingresa el ID"
                        value={playerId}
                        onChange={(e) => handleIdChange(e.target.value)}
                        error={errorMessage} // Mostramos el mensaje de error aquí
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
                            onClick={handleConfirmClick}
                            disabled={isAuthorizing}
                        >
                            {isAuthorizing ? "Validando..." : "Confirmar"}
                        </Button>
                        <Button
                            onClick={() => setActiveStep(2)}
                            style={{ display: isValidId ? 'inline-block' : 'none' }}
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
