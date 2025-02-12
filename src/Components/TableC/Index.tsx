import React, { useState, useEffect, useMemo } from 'react';
import {
  ActionIcon,
  Modal,
  Table,
  Loader,
  Divider,
  Title,
  Stepper,
  TextInput,
  Button,
  Group,
  Card,
} from '@mantine/core';
import { IconEye, IconShoppingBag, IconUserFilled } from '@tabler/icons-react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import moment from 'moment';

interface Product {
  code: number;
  name: string;
  price: number;
  // Otros campos que devuelva la API
}

const TableC: React.FC = () => {
  // Estados para la lista de productos, el producto seleccionado y el estado del modal
  const [opened, setOpened] = useState<boolean>(false);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Estados para el flujo del modal (Stepper)
  const [activeStep, setActiveStep] = useState<number>(0);
  const [playerId, setPlayerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Función para obtener productos desde la API usando las credenciales guardadas
  const fetchProductsFromAPI = async () => {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedApiSecret = localStorage.getItem('apiSecret');

    if (!storedApiKey || !storedApiSecret) {
      console.error('Credenciales no encontradas');
      return;
    }
    setLoading(true);
    const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
    const verb = "GET";
    const route = "api/products";
    const hmacData = verb + route + date;
    const hmacSignature = CryptoJS.HmacSHA256(hmacData, storedApiSecret).toString(CryptoJS.enc.Hex);
    const authorizationHeader = `${storedApiKey}:${hmacSignature}`;

    try {
      const response = await axios.get('https://pincentral.baul.pro/api/products', {
        headers: {
          'X-Date': date,
          'Authorization': authorizationHeader,
        },
      });
      if (response.status === 200) {
        setFetchedProducts(response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta una vez al montar el componente
  useEffect(() => {
    fetchProductsFromAPI();
  }, []);

  // Abre el modal con el producto seleccionado
  const openModalForProduct = (product: Product) => {
    setSelectedProduct(product);
    setPlayerId('');
    setActiveStep(0);
    setOpened(true);
  };

  // Simula un procesamiento en el paso de confirmación
  const handleConfirmClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setActiveStep(2);
    }, 3000);
  };

  // Finaliza el proceso y cierra el modal
  const handleFinishClick = () => {
    setActiveStep(3);
    setTimeout(() => {
      setOpened(false);
      setActiveStep(0);
      setPlayerId('');
    }, 2000);
  };

  // Se construyen las filas de la tabla con los productos obtenidos
  const productRows = useMemo(
    () =>
      fetchedProducts.map((product) => (
        <tr key={product.code}>
          <td style={{ textAlign: 'center' }}>{product.code}</td>
          <td style={{ textAlign: 'center' }}>{product.name}</td>
          <td style={{ textAlign: 'center' }}>{product.price} $</td>
          <td style={{ textAlign: 'center' }}>
            <ActionIcon
              onClick={() => openModalForProduct(product)}
              style={{ background: '#0c2a85', color: 'white' }}
              size="lg"
              variant="filled"
            >
              <IconEye size={26} />
            </ActionIcon>
          </td>
        </tr>
      )),
    [fetchedProducts]
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setActiveStep(0);
          setPlayerId('');
        }}
        withCloseButton={false}
        size="xl"
      >
        <Stepper
          active={activeStep}
          color="#0c2a85"
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
          breakpoint="sm"
        >
          <Stepper.Step label="Detalles del Producto" description="Revisa la información">
            {selectedProduct ? (
              <>
                <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
                  {selectedProduct.name}
                </Title>
                <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                <p style={{ textAlign: 'center' }}>
                  Precio: {selectedProduct.price} $
                </p>
                <Group position="center" mt="xl">
                  <Button onClick={() => setActiveStep(1)} style={{ background: '#0c2a85' }}>
                    Siguiente
                  </Button>
                </Group>
              </>
            ) : (
              <Loader color="indigo" size="xl" variant="dots" />
            )}
          </Stepper.Step>

          {/* Paso 2: Se solicita el ID del jugador */}
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

          {/* Paso 3: Se muestra la confirmación final con los datos del producto y jugador */}
          <Stepper.Step label="Confirmación" description="Detalles del producto y jugador">
            {selectedProduct ? (
              <Group position="center">
                <Card radius="md" withBorder>
                  <Group position="center">
                    <IconUserFilled size={64} />
                  </Group>
                  <Title align="center" order={2}>
                    Jugador
                  </Title>
                  <Title align="center" order={4}>
                    {playerId}
                  </Title>
                </Card>
                <div>
                  <Title order={3} style={{ fontWeight: 700, color: '#333' }}>
                    {selectedProduct.name}
                  </Title>
                  <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                  <p>Precio: {selectedProduct.price} $</p>
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

      {loading ? (
        <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} />
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>ID</th>
              <th style={{ textAlign: 'center' }}>Producto</th>
              <th style={{ textAlign: 'center' }}>Precio</th>
              <th style={{ textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>{productRows}</tbody>
        </Table>
      )}
    </>
  );
};

export default TableC;
