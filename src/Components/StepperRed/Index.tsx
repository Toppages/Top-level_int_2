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
    Card,
    TextInput,
} from '@mantine/core';
import { IconEye,IconCopy  } from '@tabler/icons-react';
import { fetchUserData } from "../../utils/utils";
import { Product } from '../../types/types';
import { toast } from 'sonner';

interface StepperMaProps {
    opened: boolean;
    onClose: () => void;
    products: Product[];
    user: {
        purchaseLimits: any; _id: string; name: string; email: string, handle: string; role: string; saldo: number; rango: string; admin: string;
    } | null;
}

const StepperRed: React.FC<StepperMaProps> = ({ opened, onClose, products, user }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [, setSelectedProduct] = useState<Product | null>(null);
    const [, setErrorMessage] = useState<string>('');
    const [accountName, setAccountName] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [saleResponse, setSaleResponse] = useState<any>(null);
    const [userData, setUserData] = useState(user);
    const [clientId, setClientId] = useState<string>('');

    const getPriceForUser = (product: Product, user: { rango: string } | null) => {
        const userRango = user ? user.rango : 'default';

        switch (userRango) {
            case 'oro': return product.price_oro;
            case 'plata': return product.price_plata;
            case 'bronce': return product.price_bronce;
            default: return product.price;
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
        setErrorMessage('');
        setAccountName('');
    };



    const handleFinishClick = () => {
        onClose();
        setActiveStep(0);
        resetState();
        window.location.reload();
    };

    const handleClose = () => {
        window.location.reload();
        onClose();
    };

    const handleNextStep = async (product: Product) => {
        setSelectedProduct(product);
        setIsProcessing(true);
        setErrorMessage("");

        // Usa el producto directamente
        try {
            const pinResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${product.code}/pin`);
            const pinData = pinResponse.data.pin;

            if (!pinData || !pinData.pin_id) {
                const msg = "Error al obtener el PIN del producto.";
                setErrorMessage(msg);
                toast.error(msg);
                setIsProcessing(false);
                return;
            }

            const purchaseLimit = user?.purchaseLimits?.[product.code];
            const limit = purchaseLimit ? purchaseLimit.limit : 0;

            let userForSale = user;
            let originalVendedor = null;

            if (user?.role === 'vendedor' && user?.rango === 'oro') {
                try {
                    const adminResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user/${user.admin}`);
                    userForSale = adminResponse.data;
                    originalVendedor = {
                        id: user._id,
                        handle: user.handle,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        saldo: userData ? userData.saldo : 0
                    };
                } catch (err) {
                    const msg = "No se pudo obtener la información del administrador.";
                    setErrorMessage(msg);
                    toast.error(msg);
                    setIsProcessing(false);
                    return;
                }
            }

            const saleData = {
                user: userForSale ? {
                    id: userForSale._id,
                    handle: userForSale.handle,
                    name: userForSale.name,
                    email: userForSale.email,
                    role: userForSale.role,
                    saldo: userForSale.saldo
                } : null,
                originalVendedorHandle: originalVendedor ? originalVendedor.handle : null,
                playerId: clientId,
                nickname: accountName,
                quantity: 1,
                price: getPriceForUser(product, user),
                product: product.code,
                productName: product.name,
                totalPrice: getPriceForUser(product, user),
                totalOriginalPrice: product.price,
                moneydisp: userForSale ? userForSale.saldo : 0,
                status: "completado",
                order_id: `ORD-${Date.now()}`,
                pins: [
                    {
                        serial: pinData.pin_id,
                        key: pinData.pin || "DEFAULT_KEY",
                        usado: false,
                        productName: product.name
                    }
                ],
                purchaseLimit: limit
            };

            const saleResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/sales`, saleData);

            if (saleResponse.status === 201) {
                setSaleResponse(saleResponse.data);
                setActiveStep(1);
            } else {
                const msg = "Error al registrar la venta.";
                setErrorMessage(msg);
                toast.error(msg);

            }
        } catch (error) {
            const errorMsg = axios.isAxiosError(error) && error.response?.data?.message
                ? error.response.data.message
                : "Ocurrió un error en el proceso. Vuelva a procesar la compra. Si el error persiste, comuníquese con un supervisor.";

            setErrorMessage(errorMsg);
            toast.error(errorMsg);

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
        <Modal opened={opened} onClose={handleClose} withCloseButton={false} size="xl">
            <Stepper active={activeStep} color="#0c2a85" allowNextStepsSelect={false} onStepClick={setActiveStep} breakpoint="sm">

                <Stepper.Step label="Detalles del Producto" description="Selecciona un producto">
                    <div>
                        <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                            Selecciona un Producto
                        </Title>
                        <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                        <TextInput
                            placeholder="ID del cliente"
                            label="ID del cliente"
                            withAsterisk
                            mb={15}
                            value={clientId}
                            onChange={(e) => setClientId(e.currentTarget.value)}
                        />

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
                                        const isClientIdEmpty = clientId.trim() === '';
                                        const isDisabledFinal = isDisabled || isProcessing || isClientIdEmpty;

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
                                                            onClick={() => handleNextStep(product)}
                                                            style={{
                                                                background: isDisabledFinal ? '#d3d3d3' : '#0c2a85',
                                                                color: isDisabledFinal ? '#a0a0a0' : 'white',
                                                                marginLeft: '10px',
                                                                pointerEvents: isDisabledFinal ? 'none' : 'auto',
                                                            }}
                                                            size="lg"
                                                            variant="filled"
                                                            disabled={isDisabledFinal}
                                                        >

                                                            {isProcessing ? (
                                                                <Text size="xs" color="white" fw={500}>...</Text> // opcional: "..." como indicativo
                                                            ) : (
                                                                <IconEye size={26} />
                                                            )}
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
                                                            onClick={() => handleNextStep(product)}
                                                            style={{
                                                                background: isDisabledFinal ? '#d3d3d3' : '#0c2a85',
                                                                color: isDisabledFinal ? '#a0a0a0' : 'white',
                                                                marginLeft: '10px',
                                                                pointerEvents: isDisabledFinal ? 'none' : 'auto',
                                                            }}
                                                            size="lg"
                                                            variant="filled"
                                                            disabled={isDisabledFinal}
                                                        >
                                                            {isProcessing ? (
                                                                <Text size="xs" color="white" fw={500}>...</Text> // opcional: "..." como indicativo
                                                            ) : (
                                                                <IconEye size={26} />
                                                            )}
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



<Stepper.Step label="Finalización" description="Detalles de la venta">
  <div style={{ textAlign: "center" }}>
    {isProcessing ? (
      <Text size="md" color="blue">Procesando venta...</Text>
    ) : saleResponse ? (
      <>
        <Card>
          <Text size="lg" fw={700} color="green">
            Venta Registrada
          </Text>

          <Group position="center" mt="sm">
            <Text size="md" fw={500}>
              ID del Cliente: {clientId}
            </Text>
            <ActionIcon
              onClick={() => navigator.clipboard.writeText(clientId)}
              variant="light"
              color="blue"
              size="sm"
              title="Copiar ID"
            >
              <IconCopy size={16} color='blue' />
            </ActionIcon>
          </Group>

          <Group position="center" mt="xs">
            <Text size="md" fw={500}>
              PIN: {saleResponse.sale.pins?.[0]?.serial || "No disponible"}
            </Text>
            <ActionIcon
              onClick={() =>
                saleResponse.sale.pins?.[0]?.serial &&
                navigator.clipboard.writeText(saleResponse.sale.pins[0].serial)
              }
              variant="light"
              color="blue"
              size="sm"
              title="Copiar PIN"
            >
 <IconCopy size={16} color='blue' />            </ActionIcon>
          </Group>

          <Text size="md" mt="xs">
            <strong>Fecha:</strong> {`${new Date(saleResponse.sale.created_at).toISOString().split('T')[0]} ${new Date(saleResponse.sale.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
          </Text>

          <Text
            component="a"
            href="https://redeempins.com/"
            target="_blank"
            rel="noopener noreferrer"
            color="blue"
            mt="md"
            style={{ display: 'inline-block' }}
          >
            Ir a Redimir
          </Text>
        </Card>
      </>
    ) : (
      <Text size="md">Cargando detalles de la venta...</Text>
    )}
  </div>

  {!isProcessing && (
    <Group position="center" mt="xl">
      <Button onClick={handleFinishClick} style={{ background: '#0c2a85' }}>
        Finalizar
      </Button>
    </Group>
  )}
</Stepper.Step>


            </Stepper>
        </Modal>
    );
};

export default StepperRed;