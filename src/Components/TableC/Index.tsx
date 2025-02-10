import { useState, useMemo } from 'react';
import { ActionIcon, Modal, Table, Loader, Divider, Title } from '@mantine/core';
import { IconShoppingBag, IconEye } from '@tabler/icons-react';
import ProductModal from '../ProductModal/Index';

const localCollections = [
  { id: 1, name: 'Colección A', products: [
      { id: 101, name: 'Producto 1', salesPrice: 10000 },
      { id: 102, name: 'Producto 2', salesPrice: 15000 }
    ]
  },
  { id: 2, name: 'Colección B', products: [
      { id: 201, name: 'Producto 3', salesPrice: 20000 },
      { id: 202, name: 'Producto 4', salesPrice: 25000 }
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

  const fetchProducts = (collectionId: number) => {
    setLoadingProducts(true);
    const collection = collections.find(c => c.id === collectionId);
    setProducts(collection?.products || []);
    setSelectedCollection(collection?.name || '');
    setOpened(true);
    setLoadingProducts(false);
  };

  const fetchProductDetails = (productId: number) => {
    setProductLoading(true);
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setOpened(false);
    setProductLoading(false);
  };

  const rows = useMemo(
    () => collections.map(({ id, name }) => (
      <tr key={id}>
        <td style={{ textAlign: 'center' }}>{id}</td>
        <td style={{ textAlign: 'center' }}>{name}</td>
        <td>
          <ActionIcon onClick={() => fetchProducts(id)} style={{ background: '#0c2a85' }} size="lg" variant="filled">
            <IconEye size={26} />
          </ActionIcon>
        </td>
      </tr>
    )),
    [collections]
  );

  const productRows = useMemo(
    () => products.map(({ id, name, salesPrice }) => (
      <tr key={id}>
        <td style={{ textAlign: 'center' }}>{name}</td>
        <td style={{ textAlign: 'center' }}>{salesPrice} COP</td>
        <td>
          <ActionIcon onClick={() => fetchProductDetails(id)} style={{ background: '#0c2a85' }} size="lg" variant="filled">
            <IconShoppingBag size={26} />
          </ActionIcon>
        </td>
      </tr>
    )),
    [products]
  );

  return (
    <>
      <ProductModal opened={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} loading={productLoading} />

      <Modal opened={opened} onClose={() => setOpened(false)} withCloseButton={false} size="xl">
        <Title ta="center" order={3} style={{ fontWeight: 700, color: '#333' }}>
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
          <tbody>{loadingProducts ? <tr><td colSpan={3} style={{ textAlign: 'center' }}><Loader color="indigo" size="xl" variant="dots" /></td></tr> : productRows}</tbody>
        </Table>
      </Modal>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>ID</th>
            <th style={{ textAlign: 'center' }}>Colección</th>
            <th style={{ textAlign: 'center' }}></th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </>
  );
}

export default TableC;
