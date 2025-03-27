import { Product } from '../../../types/types';
import { useMediaQuery } from '@mantine/hooks';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { IconAdjustments, IconSearch } from '@tabler/icons-react';
import { fetchProductsFromAPI, updateProductAPI } from '../../../utils/utils';
import { Table, Button, Modal, ScrollArea, ActionIcon, Title, Group, Loader, Text, TextInput, Switch, NumberInput } from '@mantine/core';
import * as XLSX from 'xlsx';

const exportToExcel = (products: Product[]) => {
    const data = products.map((product) => {
        return product.inventario.map((item: { pin_id: any; }) => ({
            name: product.name,
            pin_id: item.pin_id
        }));
    }).flat(); 

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventarios");

    XLSX.writeFile(wb, "Inventarios_Productos.xlsx");
};
function ManagePro() {
    const [opened, setOpened] = useState(false);
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const isMobile = useMediaQuery('(max-width: 1000px)');
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            price_oro: selectedProduct?.price_oro || 0,
            price_plata: selectedProduct?.price_plata || 0,
            price_bronce: selectedProduct?.price_bronce || 0,
            price: selectedProduct?.price || 0, 
            pricebs: selectedProduct?.pricebs || 0,
        }
    });

    useEffect(() => {
        if (opened) {
            fetchProductsFromAPI(setProducts, setLoading);
        }
    }, [opened]);

    useEffect(() => {
        const sortedProducts = [...products].sort((a, b) => Number(a.price) - Number(b.price));
        setFilteredProducts(sortedProducts);
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
        setOpened(false);
        setProductModalOpen(true);
        setValue('price_oro', product.price_oro || 0);
        setValue('price_plata', product.price_plata || 0);
        setValue('price_bronce', product.price_bronce || 0);
        setValue('price', product.price || 0); 
        setValue('pricebs', product.pricebs || 0);
    };

    const handleUpdateProduct = async (data: any) => {
        if (selectedProduct) {
            const updatedProduct = { ...selectedProduct, ...data };
            await updateProductAPI(updatedProduct);
            setProductModalOpen(false);
            setOpened(true);
        }
    };

    const closeModal = () => {
        setSearchQuery('');
        setOpened(false);
    };

    const rows = filteredProducts.map((product) => (
        <tr key={product._id}>
            <td>{product.name}</td>
            <td>{product.price} USD</td>
            {!isMobile && (
                <>
                    <td>{product.price_oro} USD</td>
                    <td>{product.price_plata} USD</td>
                    <td>{product.price_bronce} USD</td>
                    <td>{product.available ? 'Sí' : 'No'}</td>
                </>
            )}
            <td>
                <ActionIcon style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }} variant="filled" onClick={() => openProductModal(product)}>
                    <IconAdjustments size={18} />
                </ActionIcon>
            </td>
        </tr>
    ));

    return (
        <>
            <Modal radius='lg' size={isMobile ? '100%' : '80%'} opened={opened} onClose={closeModal} withCloseButton={false}>
                <Group mb={15} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr', gap: '10px', width: '100%' }}>
                    <Title order={3}>Lista de productos</Title>
                    <TextInput
                        radius="lg"
                        placeholder="Buscar producto"
                        icon={<IconSearch />}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.currentTarget.value)}
                    />
                      <Button
                variant="outline"
                color="blue"
                onClick={() => exportToExcel(filteredProducts)} 
            >
                Descargar Inventarios
            </Button>
                </Group>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader color="indigo" size="xl" variant="bars" />
                    </div>
                ) : (
                    <ScrollArea type="never" style={{ height: 300, maxWidth: '100%' }}>
                        <Table>
                            <thead style={{ background: '#0c2a85' }}>
                                <tr>
                                    <th>
                                        <Text c='white' ta={'center'}>
                                            Nombre
                                        </Text>
                                    </th>
                                    <th>
                                        <Text c='white' ta={'center'}>
                                            Precio
                                        </Text>
                                    </th>
                                    {!isMobile && (
                                        <>
                                            <th> <Text c='white' ta={'center'}>Precio Oro</Text></th>
                                            <th> <Text c='white' ta={'center'}>Precio Plata</Text></th>
                                            <th> <Text c='white' ta={'center'}>Precio Bronce</Text></th>
                                            <th> <Text c='white' ta={'center'}>Disponible</Text></th>
                                        </>
                                    )}
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Modal>
            <Modal radius='lg' size={isMobile ? '100%' : '80%'} opened={productModalOpen} onClose={() => { setProductModalOpen(false); setOpened(true); }} withCloseButton={false}>

                {selectedProduct && (
                    <form onSubmit={handleSubmit(handleUpdateProduct)}>
                        <Title mt={5} order={1}>{selectedProduct.name}</Title>
                        <Title mt={15} order={5}></Title>
                        <Text fw={500} fz="xl">Productos en el inventario: {selectedProduct.price}</Text>
                        <Group mt={15} mb={15} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', width: '100%' }}>
                            <Controller
                                control={control}
                                name="price"
                                render={({ field }) => (
                                    <NumberInput
                                        {...field}
                                        label="Precio Base"
                                        min={0}
                                        step={0.01}
                                        precision={3}
                                        error={errors.price ? "Este campo es obligatorio." : null}
                                    />
                                )}
                                rules={{
                                    required: "Este campo es obligatorio.",
                                    validate: (value) => value > 0 || "El precio base debe ser mayor a 0.",
                                }}
                            />

                            <Controller
                                control={control}
                                name="pricebs"
                                render={({ field }) => (
                                    <NumberInput
                                        {...field}
                                        label="Precio Base (bs)"
                                        min={0}
                                        step={0.01}
                                        precision={3}
                                        error={errors.pricebs ? "Este campo es obligatorio." : null}
                                    />
                                )}
                                rules={{
                                    required: "Este campo es obligatorio.",
                                    validate: (value) => value > 0 || "El precio base en bolivianos debe ser mayor a 0.",
                                }}
                            />

                            <Controller
                                control={control}
                                name="price_oro"
                                render={({ field }) => (
                                    <NumberInput
                                        {...field}
                                        label={<span style={{ color: '#FFD700' }}>Precio Oro</span>}
                                        min={Number(selectedProduct?.price) || 0}
                                        step={0.01}
                                        precision={3}
                                        error={errors.price_oro ? "El precio oro no puede ser menor que el precio base." : null}
                                        style={{ color: '#FFD700' }} 
                                    />
                                )}
                                rules={{
                                    required: "Este campo es obligatorio.",
                                    validate: (value) => {
                                        const minPrice = Number(selectedProduct?.price) || 0;
                                        return value >= minPrice || "El precio oro no puede ser menor que el precio base.";
                                    }
                                }}
                            />


                            <Controller
                                control={control}
                                name="price_plata"
                                render={({ field }) => (
                                    <NumberInput
                                        {...field}
                                        label={<span style={{ color: '#C0C0C0' }}>Precio Plata</span>}
                                        min={Number(selectedProduct?.price_oro) || 0}
                                        step={0.01}
                                        precision={3}
                                        error={errors.price_plata ? "El precio plata no puede ser menor que el precio oro." : null}
                                    />
                                )}
                                rules={{
                                    required: "Este campo es obligatorio.",
                                    validate: (value) => {
                                        const minPriceOro = Number(selectedProduct?.price_oro) || 0;
                                        return value >= minPriceOro || "El precio plata no puede ser menor que el precio oro.";
                                    }
                                }}
                            />

                            <Controller
                                control={control}
                                name="price_bronce"
                                render={({ field }) => (
                                    <NumberInput
                                        {...field}
                                        label={<span style={{ color: '#cd7f32' }}>Precio Bronce</span>}
                                        min={Number(selectedProduct?.price_plata) || 0}
                                        step={0.01}
                                        precision={3}
                                        error={errors.price_bronce ? "El precio bronce no puede ser menor que el precio plata." : null}
                                    />
                                )}
                                rules={{
                                    required: "Este campo es obligatorio.",
                                    validate: (value) => {
                                        const minPricePlata = Number(selectedProduct?.price_plata) || 0;
                                        return value >= minPricePlata || "El precio bronce no puede ser menor que el precio plata.";
                                    }
                                }}
                            />
                        </Group>

                        <Switch
                            mb={15}
                            label="Disponible"
                            color="lime"
                            checked={selectedProduct?.available}
                            onChange={(e) => setSelectedProduct({ ...selectedProduct, available: e.currentTarget.checked })}
                        />

                        <Button mt={15} fullWidth style={{ background: '#0c2a85' }} type="submit">Guardar cambios</Button>
                    </form>
                )}
            </Modal>
            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>Ver Productos</Button>
        </>
    );
}

export default ManagePro;