import { Product } from '../../../types/types';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { fetchProductsFromAPI } from '../../../utils/utils';
import { IconAdjustments, IconSearch } from '@tabler/icons-react';
import { Table, Button, Modal, ScrollArea, ActionIcon, Title, Group, TextInput, Loader } from '@mantine/core';

function ManagePro() {
    const [opened, setOpened] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const isMobile = useMediaQuery('(max-width: 1000px)');

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (opened) {
            fetchProductsFromAPI(setProducts, setLoading);
        }
    }, [opened]);

    useEffect(() => {
        setFilteredProducts(products);
    }, [products]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.code.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const openProductModal = (product: Product) => {
        setSelectedProduct(product);
        setProductModalOpen(true);
    };

    const rows = filteredProducts.map((product) => (
        <tr key={product.id}>
            <td>{product.name}</td>
            <td>${product.price}</td>
            {!isMobile && (
                <>
                    <td>${product.price_oro}</td>
                    <td>${product.price_plata}</td>
                    <td>${product.price_bronce}</td>
                    <td>{product.available ? 'Sí' : 'No'}</td>
                </>
            )}
            <td>
                <ActionIcon color="yellow" variant="filled" onClick={() => openProductModal(product)}>
                    <IconAdjustments size={18} />
                </ActionIcon>
            </td>
        </tr>
    ));

    return (
        <>
            <Modal size={isMobile ? '100%' : '80%'} opened={opened} onClose={() => setOpened(false)} withCloseButton={false}>
                <Group mb={15} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '10px', width: '100%' }}>
                    <Title order={1}>Lista de productos</Title>
                    <TextInput 
                        placeholder="Buscar producto" 
                        icon={<IconSearch />} 
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    />
                </Group>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader color="indigo" size="xl" variant="bars" />
                    </div>
                ) : (
                    <ScrollArea type="never" style={{ height: 300, maxWidth: '100%' }}>
                        <Table striped highlightOnHover withBorder withColumnBorders>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    {!isMobile && (
                                        <>
                                            <th>Precio Oro</th>
                                            <th>Precio Plata</th>
                                            <th>Precio Bronce</th>
                                            <th>Disponible</th>
                                        </>
                                    )}
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Modal>

            <Modal size={isMobile ? '100%' : '80%'} opened={productModalOpen} onClose={() => setProductModalOpen(false)} withCloseButton={false}>
                {selectedProduct && (
                    <div>
                        <h2>{selectedProduct.name}</h2>
                        <p><strong>Grupo:</strong> {selectedProduct.product_group}</p>
                        <p><strong>Código:</strong> {selectedProduct.code}</p>
                        <p><strong>Tipo:</strong> {selectedProduct.type}</p>
                        <p><strong>Precio:</strong> ${selectedProduct.price}</p>
                        <p><strong>Precio Oro:</strong> ${selectedProduct.price_oro}</p>
                        <p><strong>Precio Plata:</strong> ${selectedProduct.price_plata}</p>
                        <p><strong>Precio Bronce:</strong> ${selectedProduct.price_bronce}</p>
                        <p><strong>Disponible:</strong> {selectedProduct.available ? 'Sí' : 'No'}</p>
                        <p><strong>Creado el:</strong> {new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                    </div>
                )}
            </Modal>
            <Button onClick={() => setOpened(true)}>Ver Productos</Button>
        </>
    );
}

export default ManagePro;