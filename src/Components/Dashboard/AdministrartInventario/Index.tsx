import TableM from '../../TableM/Index';
import axios from 'axios';
import ManagePro from '../ManagePro';
import { toast } from 'sonner';
import { Product } from '../../../types/types';
import { useState, useEffect } from 'react';
import { IconBox, IconMessageCircle, IconPhoto } from '@tabler/icons-react';
import { Modal, Button, Group, Tabs, Select, Textarea, Text } from '@mantine/core';

interface HomeProps {
  navOpen: boolean;
  setActiveLink: (index: number) => void;
  user: {
    _id: string;
    name: string;
    email: string;
    handle: string;
    role: string;
    saldo: number;
    rango: string;
  } | null;
}

interface SelectItem {
  value: string;
  label: string;
}

function AdministrarInventario({ user }: HomeProps) {
  const [opened, setOpened] = useState(false);
  const [products, setProducts] = useState<SelectItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [pins, setPins] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [, setModalStepOpened] = useState(false);
  const [selectedProductInfo, setSelectedProductInfo] = useState<Product | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const [productsData, setProductsData] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`);
        if (response.status === 200) {
          const sortedProducts = response.data.sort((a: Product, b: Product) => a.price - b.price);

          const formattedProducts: SelectItem[] = sortedProducts.map((product: Product) => ({
            value: product.code.toString(),
            label: `${product.name} `,
          }));

          setProducts(formattedProducts);
          setProductsData(sortedProducts); 
        }
      } catch (error) {
        toast.error('Hubo un problema al obtener los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddPins = async () => {
    if (!selectedProduct || pins.every(pin => pin === '')) {
      toast.error('Selecciona un producto y escribe al menos un pin válido');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/products/add-pins-without-deduction`, {
        code: selectedProduct,
        pins: pins.filter(pin => pin !== ''),
      });

      if (response.status === 200) {
        toast.success('Pins agregados correctamente al inventario');
        setPins([]);
      }
    } catch (error) {
      toast.error('Error al agregar los pins');
    } finally {
      setSending(false);
    }
  };

  const handleCloseModals = () => {
    setOpened(false);
    setModalStepOpened(false);
  };

  return (
    <>
      <Modal opened={opened} onClose={handleCloseModals} title="Administrar Inventario" size="lg">
        <Tabs defaultValue="Productos">
          <Tabs.List>
            <Tabs.Tab value="Productos" icon={<IconMessageCircle size={14} />}>
              Productos en el sistema
            </Tabs.Tab>
            <Tabs.Tab value="Central" icon={<IconPhoto size={14} />}>
              Inventario
            </Tabs.Tab>
            <Tabs.Tab value="Manualmente" icon={<IconMessageCircle size={14} />}>
              Manualmente
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Central" pt="xs">
            <TableM user={user} setModalStepOpened={setModalStepOpened} />
          </Tabs.Panel>

          <Tabs.Panel value="Manualmente" pt="xs">
            <Select
              label="Selecciona un producto"
              placeholder={loading ? 'Cargando...' : 'Elige un producto'}
              data={products}
              disabled={loading}
              value={selectedProduct}
              onChange={(value) => {
                setSelectedProduct(value);
                const product = productsData.find((p: Product) => p.code.toString() === value);
                setSelectedProductInfo(product || null);
              }}
              transition="pop-top-left"
              transitionDuration={80}
              transitionTimingFunction="ease"
              styles={() => ({
                item: {
                  '&[data-selected]': {
                    '&, &:hover': {
                      backgroundColor: '#0c2a85',
                      color: 'white',
                    },
                  },
                },
              })}
            />

         
<Textarea
  mt={10}
  label="Pega los PINs (uno por línea)"
  placeholder={`Ejemplo:\nXXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\n\nReglas:\n• 1 PIN por línea\n• Sin espacios\n• Formato UUID (8-4-4-4-12)\n• Solo letras y números en mayúsculas`}
  autosize
  minRows={5}
  value={pins.join('\n')}
  onChange={(e) => {
    const rawPins = e.currentTarget.value
      .split('\n')
      .map(pin => pin.trim().toUpperCase())
      .filter(pin => pin !== '');

    const validPins = rawPins.filter(pin =>
      /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/.test(pin)
    );

    const uniquePins = Array.from(new Set(validPins));
    setPins(uniquePins);
  }}
/>

            <Text mt={8} fz="sm" fw={700} c={pins.length === 0 ? 'red' : 'green'}>
              {pins.length > 0 && selectedProductInfo
                ? `Se agregarán ${pins.length} pin${pins.length === 1 ? '' : 'es'} a ${selectedProductInfo.name.replace(/Free Fire\s*-?\s*([\d,.]+)\s*Diamantes\s*\+\s*([\d,.]+)\s*Bono/, "$1 + $2 Diamantes")}`
                : `${pins.length} PIN${pins.length === 1 ? '' : 'es'} válid${pins.length === 1 ? 'o' : 'os'} detectad${pins.length === 1 ? 'o' : 'os'}`}
            </Text>

            <Button
              mt={15}
              fullWidth
              style={{
                background: !selectedProduct || pins.every(pin => pin === '') || sending ? '#d3d3d3' : '#0c2a85',
                cursor: !selectedProduct || pins.every(pin => pin === '') || sending ? 'not-allowed' : 'pointer',
              }}
              onClick={() => setConfirmModalOpen(true)}
              disabled={!selectedProduct || pins.every(pin => pin === '') || sending}
            >
              Agregar
            </Button>
            <Modal
              opened={confirmModalOpen}
              onClose={() => setConfirmModalOpen(false)}
              title="Confirmar acción"
              centered
            >
              <Text mb="md">
                ¿Estás seguro de que deseas agregar{' '}
                <Text span color="#0c2a85" weight={700}>
                  {pins.length}
                </Text>{' '}
                PIN{pins.length !== 1 ? 'es' : ''} al producto{' '}
                <Text span color="#0c2a85" weight={700}>
                  {selectedProductInfo?.name || 'seleccionado'}
                </Text>
                ?
              </Text>


              <Group position="right">
                <Button variant="default" onClick={() => setConfirmModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  color="#0c2a85"
                  loading={sending}
                  onClick={async () => {
                    await handleAddPins();
                    setConfirmModalOpen(false);
                  }}
                >
                  Confirmar
                </Button>
              </Group>
            </Modal>

          </Tabs.Panel>

          <Tabs.Panel value="Productos" pt="xs">
            <ManagePro />
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <Group position="center">
        <Button size="md" leftIcon={<IconBox />} style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
          Administrar Inventario
        </Button>
      </Group>
    </>
  );
}

export default AdministrarInventario;