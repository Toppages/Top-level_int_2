import { Modal, Loader, Title, Divider, Image, Group, TextInput, NumberInput, Button } from '@mantine/core';
import { useState } from 'react';

interface ProductModalProps {
  opened: boolean;
  onClose: () => void;
  product: any | null;
  loading: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ opened, onClose, product, loading }) => {
  
  const [referenceId, setReferenceId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const isButtonDisabled = !referenceId || quantity < 1;

  const handleReferenceIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceId(event.target.value);
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="xl"
      centered
      overlayOpacity={0.5}
      overlayBlur={3}
    >
      {loading ? (
        <Group position="center">
          <Loader color="indigo" size="xl" variant="dots" />
        </Group>
      ) : (
        product && (
          <>
            <Title ta="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
              {product.name}
            </Title>
            <Divider my="sm" variant="dashed" style={{ borderColor: '#ddd' }} />
            <Group position="apart" spacing="lg" style={{ display: 'flex' }}>
              <div style={{ flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '100%', marginBottom: '20px' }}>
                  <Image
                    radius="md"
                    src={product.image}
                    alt="Imagen del producto"
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </div>
                <Title ta='center' order={5} style={{ color: '#555' }}>
                  Precio: <span style={{ color: '#0c2a85' }}>{product.salesPrice} Cop</span>
                </Title>
              </div>
              <div style={{ flex: 1 }}>
                <TextInput
                  label="Id de referencia"
                  ta='center'
                  placeholder="ID "
                  mb="sm"
                  style={{ marginBottom: '10px' }}
                  radius="md"
                  size="md"
                  value={referenceId}
                  onChange={handleReferenceIdChange}
                />
                <NumberInput
                  value={quantity}
                  min={1}
                  ta='center'
                  label="Cantidad"
                  placeholder="Cantidad"
                  radius="md"
                  size="md"
                  onChange={handleQuantityChange}
                />
                <Button
                  className='button'
                  fullWidth
                  size="md"
                  mt="lg"
                  loading={loading}
                  disabled={isButtonDisabled} 
                >
                  comprar
                </Button>
              </div>
            </Group>
          </>
        )
      )}
    </Modal>
  );
};

export default ProductModal;
