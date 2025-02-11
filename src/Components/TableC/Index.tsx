import { useState, useMemo } from 'react';
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
  Card
} from '@mantine/core';
import { IconShoppingBag, IconEye, IconUserFilled } from '@tabler/icons-react';

const localCollections = [
  {
    id: 1,
    name: "FREE FIRE",
    products: [
      { id: 101, name: "100+10 diamantes", salesPrice: 1 },
      { id: 102, name: "310+31 diamantes", salesPrice: 2 },
      { id: 103, name: "520+52 diamantes", salesPrice: 3 },
      { id: 104, name: "1060+106 diamantes", salesPrice: 4 }
    ]
  },
  {
    id: 2,
    name: "COD MOBILE",
    products: [
      { id: 201, name: "420 CP", salesPrice: 2 },
      { id: 202, name: "880 CP", salesPrice: 4 },
      { id: 203, name: "1980 CP", salesPrice: 6 }
    ]
  }
];

function TableC() {
  const [opened, setOpened] = useState(false);
  const [collections] = useState(localCollections);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = (collectionId: number) => {
    setLoadingProducts(true);
    const collection = collections.find(c => c.id === collectionId);
    setProducts(collection?.products || []);
    setSelectedCollection(collection?.name || '');
    setInputValue("");
    setOpened(true);
    setLoadingProducts(false);
  };

  const fetchProductDetails = (productId: number) => {
    setProductLoading(true);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setProductLoading(false);
    setActiveStep(1);
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
      setOpened(false);
      setActiveStep(0);
      setInputValue("");
    }, 5000);
  };

  const rows = useMemo(
    () =>
      collections.map(({ id, name }) => (
        <tr key={id}>
          <td style={{ textAlign: 'center' }}>{id}</td>
          <td style={{ textAlign: 'center' }}>{name}</td>
          <td>
            <ActionIcon
              onClick={() => fetchProducts(id)}
              style={{ background: '#0c2a85' }}
              size="lg"
              variant="filled"
            >
              <IconEye size={26} />
            </ActionIcon>
          </td>
        </tr>
      )),
    [collections]
  );

  const productRows = useMemo(
    () =>
      products.map(({ id, name, salesPrice }) => (
        <tr key={id}>
          <td style={{ textAlign: 'center' }}>{name}</td>
          <td style={{ textAlign: 'center' }}>{salesPrice} $</td>
          <td>
            <ActionIcon
              onClick={() => fetchProductDetails(id)}
              style={{ background: '#0c2a85' }}
              size="lg"
              variant="filled"
            >
              <IconShoppingBag size={26} />
            </ActionIcon>
          </td>
        </tr>
      )),
    [products]
  );

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setActiveStep(0);
          setInputValue("");
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
          <Stepper.Step label="Productos" description="Selecciona un producto">
            <Title align="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
              {selectedCollection || 'Productos'}
            </Title>
            <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>Nombre del Producto</th>
                  <th style={{ textAlign: 'center' }}>Precio de venta</th>
                  <th style={{ textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      <Loader color="indigo" size="xl" variant="dots" />
                    </td>
                  </tr>
                ) : (
                  productRows
                )}
              </tbody>
            </Table>
          </Stepper.Step>

          <Stepper.Step label="Confirmar" description="Ingresa el ID del jugador">
            <TextInput
              label="ID del jugador"
              placeholder="Ingresa el ID"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Group position="center" mt="xl">
              <Button variant="default" onClick={() => setActiveStep(0)}>
                Atrás
              </Button>
              <Button
                style={{ background: !inputValue.trim() ? 'grey' : '#0c2a85' }}
                onClick={handleConfirmClick}
                disabled={!inputValue.trim()}
                loading={isLoading}
              >

                Confirmar
              </Button>
            </Group>
          </Stepper.Step>

          <Stepper.Step label="Confirmación" description="Detalles del producto y jugador">
            {productLoading ? (
              <Loader color="indigo" size="xl" variant="dots" />
            ) : selectedProduct ? (
              <>
                <Group position="center">
                  <Card radius="md" withBorder>
                    <Group position="center">
                      <IconUserFilled size={64} />
                    </Group>
                    <Title align="center" order={2}>
                      Fulano de tal
                    </Title>
                    <Title align="center" order={4}>
                      {inputValue}
                    </Title>
                  </Card>

                  <div>
                    <Title order={3} style={{ fontWeight: 700, color: '#333' }}>
                      {selectedProduct.name}
                    </Title>
                    <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
                    <p>Precio de venta: {selectedProduct.salesPrice} $</p>
                  </div>
                </Group>
              </>
            ) : (
              <p style={{ textAlign: 'center' }}>No se ha seleccionado ningún producto.</p>
            )}
            <Group position="center" mt="xl">
              <Button variant="default" onClick={() => setActiveStep(0)}>
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

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>ID</th>
            <th style={{ textAlign: 'center' }}>Juego</th>
            <th style={{ textAlign: 'center' }}></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </>
  );
}

export default TableC;
