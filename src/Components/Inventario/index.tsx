import { useState, useEffect } from 'react';
import { Table, Text, Title, Pagination, ActionIcon } from '@mantine/core';
import axios from 'axios';
import { IconCheckbox, IconCopy } from '@tabler/icons-react';

const Inventario: React.FC<{ user: any }> = ({ user }) => {
    const [error, setError] = useState<string | null>(null);
    const [pins, setPins] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const fetchUnusedPins = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/sales/user/${user.handle}/unused-pins`);
            if (Array.isArray(response.data.unusedPins)) {
                setPins(response.data.unusedPins);
            } else {
                setPins([]);
            }
        } catch (error) {
            setError('Hubo un error al obtener los pines.');
            console.error(error);
        }
    };

    useEffect(() => {
        if (user?.handle) {
            fetchUnusedPins();
        }
    }, [user]);

    const handleCheckboxClick = async (pinId: string) => {
        try {
            setPins(prevPins =>
                prevPins.map(pin =>
                    pin.key === pinId ? { ...pin, usado: true } : pin
                )
            );

            await axios.put(`http://localhost:4000/sales/user/${user.handle}/pins/${pinId}`, { usado: true });

            fetchUnusedPins();
        } catch (error) {
            setError('Hubo un error al actualizar el estado del pin.');
            console.error(error);
        }
    };

    const handleCopyClick = (key: string) => {
        navigator.clipboard.writeText(key).then(() => {
        }).catch(() => {
        });
    };

    const paginatedPins = pins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <Title ta="center" weight={700} mb="sm" order={2}>Pines No Usados</Title>

            <Pagination
                total={Math.ceil(pins.length / itemsPerPage)}
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

            {pins.length === 0 && !error && (
                <Text color="gray" ta="center" size="lg">No hay pines no usados disponibles</Text>
            )}

            {pins.length > 0 && (
                    <Table mt={15} striped highlightOnHover withBorder withColumnBorders>
                        <thead style={{ background: '#0c2a85' }}>
                            <tr>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Pin</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Estado</Title></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPins.map((pin, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>{pin.key}</td>
                                    <td style={{ display: 'flex', justifyContent: 'center' }}>
                                        <ActionIcon
                                            mr={25}
                                            style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                                            color="indigo"
                                            variant="filled"
                                            onClick={() => handleCopyClick(pin.key)} // Copiar al hacer clic
                                        >
                                            <IconCopy size={18} />
                                        </ActionIcon>
                                        <ActionIcon
                                            style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                                            color="indigo"
                                            variant="filled"
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

            {error && (
                <Text color="red" ta="center" size="lg">{error}</Text>
            )}
        </>
    );
};

export default Inventario;
