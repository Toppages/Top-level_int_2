import { useState, useEffect } from 'react';
import { IconMessageCircle, IconPhoto } from '@tabler/icons-react';
import { Modal, Button, Group, Tabs, Select, TextInput } from '@mantine/core';
import TableM from '../../TableM/Index';
import axios from 'axios';
import ManagePro from '../ManagePro';
import { Product } from '../../../types/types';
import { toast } from 'sonner';

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
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [, setModalStepOpened] = useState(false);

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
        }
      } catch (error) {
        toast.error('Hubo un problema al obtener los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddPin = async () => {
    if (!selectedProduct || !pin) {
      toast.error('Selecciona un producto y escribe un pin válido');
      return;
    }

    setSending(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/products/add-pins-without-deduction`, {
        code: selectedProduct,
        pins: [pin],
      });

      if (response.status === 200) {
        toast.success('Pin agregado correctamente al inventario');
        setPin('');
      }
    } catch (error) {
      toast.error('Error al agregar el pin');
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
              Pin Central
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
              onChange={setSelectedProduct}
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

            <TextInput
              mt={10}
              placeholder="Pin"
              label="Pin a agregar"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />

            <Button
              mt={15}
              fullWidth
              style={{
                background: !selectedProduct || !pin || sending ? '#d3d3d3' : '#0c2a85',
                cursor: !selectedProduct || !pin || sending ? 'not-allowed' : 'pointer',
              }}
              onClick={handleAddPin}
              disabled={!selectedProduct || !pin || sending}
              loading={sending}
            >
              Agregar
            </Button>

          </Tabs.Panel>

          <Tabs.Panel value="Productos" pt="xs">
         <ManagePro/>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      <Group position="center">
        <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
          Administrar Inventario
        </Button>
      </Group>
    </>
  );
}

export default AdministrarInventario;