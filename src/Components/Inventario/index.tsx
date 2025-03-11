import { useState, useEffect } from 'react';
import { Table, Text, Title, Pagination, ActionIcon, Checkbox, Group } from '@mantine/core';
import axios from 'axios';
import { IconCheckbox, IconCopy, IconDownload } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface Pin {
    serial: string;
    key: string;
    usado: boolean;
    productName: string;
    _id: string;
}

const Inventario: React.FC<{ user: any }> = ({ user }) => {
    const [error, setError] = useState<string | null>(null);
    const [pins, setPins] = useState<Pin[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [selectedProducts, setSelectedProducts] = useState<string[]>([
        'Free Fire 100 Diamantes + 10 Bono',
    ]);
    const defaultProducts = [
        'Free Fire 100 Diamantes + 10 Bono',
        'Free Fire - 310 Diamantes + 31 Bono',
        'Free Fire 520 Diamantes + 52 Bono',
        'Free Fire - 1060 Diamantes + 106 Bono',
        'Free Fire - 2.180 Diamantes + 218 Bono',
        'Free Fire - 5.600 Diamantes + 560 Bono',
    ];

    useEffect(() => {
        if (user?.handle) {
            fetchUnusedPins();
        }
    }, [user]);

    const fetchUnusedPins = async () => {
        try {
            const response = await axios.get<{ unusedPins: Pin[] }>(
                `${import.meta.env.VITE_API_Url}/sales/user/${user.handle}/unused-pins`
            );
            setPins(response.data.unusedPins || []);
        } catch (error) {
            setError('Hubo un error al obtener los pines.');
            console.error(error);
        }
    };

    const handleCheckboxClick = async (pinId: string) => {
        try {
            setPins(prevPins =>
                prevPins.map(pin => (pin.key === pinId ? { ...pin, usado: true } : pin))
            );

            await axios.put(`${import.meta.env.VITE_API_Url}/sales/user/${user.handle}/pins/${pinId}`, { usado: true });
            fetchUnusedPins();
            toast.success('Pin marcado como usado');
        } catch (error) {
            setError('Hubo un error al actualizar el estado del pin.');
            console.error(error);
        }
    };

    const handleCopyClick = (key: string) => {
        navigator.clipboard.writeText(key).catch(() => {
            console.error('Error al copiar el texto');
        });
        toast.success('Pin copiado al portapapeles');
    };

    const handleCopyAll = () => {
        const allPins = filteredPins.map(pin => pin.key).join('\n');
        navigator.clipboard.writeText(allPins).catch(() => {
            console.error('Error al copiar todos los pines');
        });
        toast.success('Todos los pines copiados al portapapeles');
    };

    const handleProductCheckboxChange = (productName: string) => {
        setSelectedProducts(prevSelected =>
            prevSelected.includes(productName) ? [] : [productName]
        );
    };

    const filteredPins = selectedProducts.length
        ? pins.filter(pin => selectedProducts.includes(pin.productName))
        : pins;

    const paginatedPins = filteredPins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDownload = () => {
        const filteredPinsForDownload = filteredPins.map(pin => ({
            Pines: pin.key,
        }));

        const ws = XLSX.utils.json_to_sheet(filteredPinsForDownload);

        ws['!cols'] = [
            { wpx: 400 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pines');

        const fileName = selectedProducts.length ? `reportees_de_pines_${selectedProducts.join('_')}.xlsx` : 'reportees_de_pines.xlsx';
        XLSX.writeFile(wb, fileName);

        toast.success('Descarga exitosa');
    };

    return (
        <>
            <Title ta="center" weight={700} mb="sm" order={2}>Pines No Usados</Title>

           <Group position='center'>

                {defaultProducts.map(name => (
                    <Checkbox
                        key={name}
                        label={name}
                        color="rgba(12, 42, 133, 1)"
                        checked={selectedProducts.includes(name)}
                        onChange={() => handleProductCheckboxChange(name)}
                    />

                ))}
           </Group>
            <Group position='apart'>
                <Pagination
                    total={Math.ceil(filteredPins.length / itemsPerPage)}
                    radius="md"
                    mt={15}
                    size="lg"
                    page={currentPage}
                    onChange={setCurrentPage}
                    styles={(theme) => ({
                        item: {
                            '&[data-active]': {
                                backgroundImage: theme.fn.gradient({ from: '#0c2a85', to: '#0c2a85' }),
                            },
                        },
                    })}
                />

                {filteredPins.length > 0 && (
                    <Group>
                        <ActionIcon
                            style={{ background: '#0c2a85', color: 'white' }}
                            radius="md"
                            size="xl"
                            color="indigo"
                            variant="filled"
                            onClick={handleCopyAll}
                        >
                            <IconCopy size={30} />
                        </ActionIcon>
                        <ActionIcon
                            style={{ background: '#0c2a85', color: 'white' }}
                            radius="md"
                            size="xl"
                            color="indigo"
                            variant="filled"
                            onClick={handleDownload}
                        >
                            <IconDownload size={30} />
                        </ActionIcon>
                    </Group>
                )}

            </Group>

            {filteredPins.length === 0 && !error && (
                <Text color="gray" ta="center" size="lg">No hay pines no usados disponibles</Text>
            )}

            {filteredPins.length > 0 && (
                <Table mt={15} striped highlightOnHover withBorder withColumnBorders>
                    <thead style={{ background: '#0c2a85' }}>
                        <tr>
                            <th style={{ textAlign: 'center', color: 'white' }}>
                            Productos ({filteredPins.length})
                            </th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Copiar</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Marcar usado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPins.map((pin, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>{pin.key}</td>
                                <td align='center'>
                                    <ActionIcon
                                        mr={25}
                                        style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                                        onClick={() => handleCopyClick(pin.key)}
                                    >
                                        <IconCopy size={18} />
                                    </ActionIcon>
                                </td>
                                <td align='center'>
                                    <ActionIcon
                                        style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                                        onClick={() => handleCheckboxClick(pin.key)}
                                    >
                                        <IconCheckbox size={23} />
                                    </ActionIcon>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {error && <Text color="red" ta="center" size="lg">{error}</Text>}
        </>
    );
};

export default Inventario;