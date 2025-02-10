import axios from 'axios';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ActionIcon, Modal, Table, Loader, Divider, Title } from '@mantine/core';
import { IconShoppingBag, IconEye } from '@tabler/icons-react';
import ProductModal from '../ProductModal/Index';

const API_URL = 'https://proxy.paginaswebstop.workers.dev/catalog';

function TableC() {
  const [opened, setOpened] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  const country = 'CO';
  const currency = 'COP';
  const language = 'es-CO';

  const authenticate = useCallback(() => {
    if (!accessToken) console.error('No token found, please login');
  }, [accessToken]);

  const fetchCollections = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/collections`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        params: { country, currency, language },
      });
      setCollections(data);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchProducts = useCallback(async (collectionId: number) => {
    if (!accessToken) return;

    setLoadingProducts(true);
    try {
      const { data } = await axios.get(`${API_URL}/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        params: { country, currency, language },
      });
      setProducts(data.products);
      setSelectedCollection(data.name);
      setOpened(true);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [accessToken]);

  const fetchProductDetails = useCallback(async (productId: number) => {
    if (!accessToken) return;

    setProductLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        params: { country, currency, language },
      });

      setSelectedProduct(data);
      setOpened(false);
    } catch (error) {
      console.error('Error fetching product details:', error);
    } finally {
      setProductLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  useEffect(() => {
    if (accessToken) fetchCollections();
  }, [accessToken, fetchCollections]);

  const rows = useMemo(
    () =>
      collections.map(({ id, name }) => (
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
    [collections, fetchProducts]
  );

  const productRows = useMemo(
    () =>
      products
        .sort((a, b) => a.salesPrice - b.salesPrice)
        .map(({ id, name, salesPrice }) => (
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
    [products, fetchProductDetails]
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
        <tbody>{loading ? <tr><td colSpan={4} style={{ textAlign: 'center' }}><Loader color="indigo" size="xl" variant="dots" /></td></tr> : rows}</tbody>
      </Table>
    </>
  );
}

export default TableC;
