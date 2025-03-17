import * as XLSX from 'xlsx';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { fetchTransactions } from '../../utils/utils';
import { useState, useEffect } from 'react';
import { Group, Table, Text, Title, ActionIcon, Pagination, Select, Modal, Button } from '@mantine/core';
import { IconCalendarWeek, IconDownload, IconInfoCircle, IconReload, IconUser } from '@tabler/icons-react';


const BalanceReports: React.FC<{ user: any }> = ({ user }) => {
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [userHandles, setUserHandles] = useState<string[]>([]);
    const [selectedUserHandle, setSelectedUserHandle] = useState<string | null>('todos');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const itemsPerPage = 7;
    const userRole = user?.role;
    const [opened, setOpened] = useState(false);
    const [modalTransaction, setModalTransaction] = useState<any>(null);
    const isMobile = useMediaQuery('(max-width: 1000px)');

    const openModal = (transaction: any) => {
        setModalTransaction(transaction);
        setOpened(true);
    };

    useEffect(() => {
        if (user) {
            fetchTransactions(
                user.handle,
                user.role,
                setAllTransactions,
                setFilteredTransactions,
                setError
            );
        }
    }, [user]);

    useEffect(() => {
        const uniqueHandles = [...new Set(allTransactions.map((transaction) => transaction.transactionUserName))];
        setUserHandles(uniqueHandles);
    }, [allTransactions]);

    useEffect(() => {
        let filtered = allTransactions;

        if (selectedUserHandle && selectedUserHandle !== 'todos') {
            filtered = filtered.filter((transaction) =>
                transaction.transactionUserName.toLowerCase().includes(selectedUserHandle.toLowerCase())
            );
        }

        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            filtered = filtered.filter(transaction => {
                const transactionDate = transaction.created_at.split('T')[0];
                return transactionDate === dateStr;
            });
        }

        if (searchTerm) {
            filtered = filtered.filter((transaction) =>
                transaction.transactionUserName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filtered !== filteredTransactions) {
            setFilteredTransactions(filtered);
            setCurrentPage(1);
        }
    }, [selectedUserHandle, selectedDate, searchTerm, allTransactions]);


    const exportToExcel = (data: any[]) => {
        const filteredData = data.map((transaction) => {
            const {
                amount,
                previousBalance,
                type,
                transactionId,
                _id,
                userId,
                created_at,
                transactionUserName,
                userName,
                userEmail,
                userRole,
                userRango,
                userhandle,
                __v,
                user,
                ...cleanedTransaction
            } = transaction;

            const formattedDate = new Date(transaction.created_at);
            const formattedDateStr = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

            cleanedTransaction['ID'] = transaction.transactionId;
            cleanedTransaction['Fecha'] = formattedDateStr;
            cleanedTransaction['Saldo Anterior'] = `${transaction.previousBalance} USD`;
            cleanedTransaction['Monto'] = `${transaction.amount} USD`;
            cleanedTransaction['Saldo Final'] = `${transaction.amount + transaction.previousBalance} USD`;

            if (userRole !== 'cliente') {
                cleanedTransaction['Realizado por'] = transaction.transactionUserName;
                cleanedTransaction['Beneficiado'] = transaction.userhandle;
            }

            return cleanedTransaction;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');

        let fileName = 'balance_reports';

        if (selectedUserHandle && selectedUserHandle !== 'todos') {
            fileName += `_${selectedUserHandle}`;
        }

        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            fileName += `_${dateStr}`;
        }

        fileName += '.xlsx';

        XLSX.writeFile(wb, fileName);
    };


    const clearFilters = () => {
        setSelectedUserHandle('todos');
        setSelectedDate(null);
        setSearchTerm('');
        setFilteredTransactions(allTransactions);
    };

    const paginatedReports = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
        <>
            <Title ta="center" weight={700} mb="sm" order={2}>Reporte Carga De Saldo</Title>
            {userRole !== 'cliente' && userRole !== 'vendedor' && (
                <>

                    <Group
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : ' 1.2fr 1fr 1fr',
                            gap: '10px',
                            width: '100%',
                        }}
                    >
                        <Select
                            radius="md"
                            size="lg"
                            icon={<IconUser />}
                            placeholder="Filtrar Usuario"
                            label="Filtrar Usuario"
                            transition="pop-top-left"
                            transitionDuration={80}
                            transitionTimingFunction="ease"
                            data={[{ value: 'todos', label: 'Todos' }, ...userHandles.map(handle => ({ value: handle, label: handle }))]}
                            value={selectedUserHandle}
                            defaultValue="todos"
                            onChange={setSelectedUserHandle}
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

                        <DatePicker
                            radius="md"
                            size="lg"
                            icon={<IconCalendarWeek />}
                            placeholder="Filtrar Fecha"
                            label="Filtrar Fecha"
                            inputFormat="DD/MM/YYYY"
                            labelFormat="MM/YYYY"
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />

                        <Group position={isMobile ? 'center' : 'apart'} mt={25}>
                            <Button
                                style={{ background: '#0c2a85', color: 'white' }}
                                leftIcon={<IconReload />}
                                radius="md"
                                size="md"
                                color="indigo"
                                variant="filled"
                                onClick={clearFilters}
                            >
                                Recargar
                            </Button>
                            <Button
                                style={{ background: '#0c2a85', color: 'white' }}
                                leftIcon={<IconDownload />}
                                radius="md"
                                size="md"
                                color="indigo"
                                variant="filled"
                                onClick={() => exportToExcel(filteredTransactions)}
                            >
                                Descargar
                            </Button>


                        </Group>
                    </Group>
                </>
            )}

            <Modal
                opened={opened}
                withCloseButton={false}
                onClose={() => setOpened(false)}
            >
                {modalTransaction && (
                    <>
                        <Title ta='center' mb={5} order={4}>Detalles de la recarga</Title>
                        <Group position="center">
                            <IconUser size={150} />
                        </Group>
                        <Group mt='md' position="apart" mb="md">
                            <Title order={4}>ID:</Title>
                            <Title order={4}>{modalTransaction.transactionId}</Title>
                        </Group>
                        <Group mt='md' position="apart" mb="md">
                            <Title order={4}>Fecha:</Title>
                            <Title order={4}>{new Date(modalTransaction.created_at).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}</Title>
                        </Group>
                        <Group mt='md' position="apart" mb="md">
                            <Title order={4}>Saldo Anterior:</Title>
                            <Title order={4}>{modalTransaction.previousBalance} USD</Title>
                        </Group>
                        <Group mt='md' position="apart" mb="md">
                            <Title order={4}>Carga de Saldo:</Title>
                            <Title order={4}>{modalTransaction.amount} USD USD</Title>
                        </Group>
                        <Group mt='md' position="apart" mb="md">
                            <Title order={4}>Saldo Final:</Title>
                            <Title order={4}>{modalTransaction.amount + modalTransaction.previousBalance} USD</Title>
                        </Group>
                        {userRole !== 'cliente' && (
                            <>
                                <Group mt='md' position="apart" mb="md">
                                    <Title order={4}>Realizado por:</Title>
                                    <Title order={4}>{modalTransaction.transactionUserName}</Title>
                                </Group>
                                <Group mt='md' position="apart" mb="md">
                                    <Title order={4}>Beneficiado:</Title>
                                    <Title order={4}>{modalTransaction.userhandle}</Title>
                                </Group>
                            </>
                        )}

                    </>
                )}
            </Modal>
            {userRole == 'cliente' && (
                <>
                    <Group
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '4fr 1fr' : ' 6fr 1fr',
                            gap: '10px',
                            width: '100%',
                        }}
                    >


                        <DatePicker
                            radius="md"
                            size="lg"
                            icon={<IconCalendarWeek />}
                            placeholder="Filtrar Fecha"
                            label="Filtrar Fecha"
                            inputFormat="DD/MM/YYYY"
                            labelFormat="MM/YYYY"
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                        <Group mt={25}>

                            <Button
                                style={{ background: '#0c2a85', color: 'white' }}
                                leftIcon={<IconDownload />}
                                radius="md"
                                size="md"
                                color="indigo"
                                variant="filled"
                                onClick={() => exportToExcel(filteredTransactions)}
                            >
                                Descargar
                            </Button>
                        </Group>
                    </Group>
                </>
            )}

            <Pagination
                total={totalPages}
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

            {filteredTransactions.length === 0 && !error && (
                <Text color="gray" ta="center" size="lg">No hay transacciones disponibles</Text>
            )}

            {filteredTransactions.length > 0 && (
                <Table mt={15} striped highlightOnHover withBorder withColumnBorders>
                    <thead style={{ background: '#0c2a85' }}>
                        <tr>
                            <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>ID</Title></th>
                            <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Fecha</Title></th>
                            {!isMobile && userRole !== 'cliente' && (
                                <>
                                    <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Realizado por</Title></th>
                                    <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Beneficiado</Title></th>
                                </>
                            )}
                            {!isMobile && (
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Saldo Anterior</Title></th>
                            )}
                            <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Carga de saldo</Title></th>
                            {!isMobile && (
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Saldo Final</Title></th>
                            )}
                            {isMobile && (
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Info</Title></th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReports.map((transaction) => (
                            <tr key={transaction._id}>
                                <td style={{ textAlign: 'center' }}>{transaction.transactionId}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {new Date(transaction.created_at).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </td>

                                {!isMobile && userRole !== 'cliente' && (
                                    <>
                                        <td style={{ textAlign: 'center' }}>{transaction.transactionUserName}</td>
                                        <td style={{ textAlign: 'center' }}>{transaction.userhandle}</td>
                                    </>
                                )}
                                {!isMobile && (
                                    <td style={{ textAlign: 'center' }}>{transaction.previousBalance} USD</td>
                                )}
                                <td style={{ textAlign: 'center' }}>{transaction.amount} USD</td>
                                {!isMobile && (
                                    <td style={{ textAlign: 'center' }}>{transaction.amount + transaction.previousBalance} USD</td>
                                )}
                                {isMobile && (

                                    <td style={{ textAlign: 'center' }}>
                                        <ActionIcon
                                            style={{ background: '#0c2a85', color: 'white' }}
                                            size="xl"
                                            variant="filled"
                                            onClick={() => openModal(transaction)}
                                        >
                                            <IconInfoCircle size={32} />
                                        </ActionIcon>
                                    </td>
                                )}

                            </tr>

                        ))}
                    </tbody>

                </Table>
            )}
        </>
    );
};

export default BalanceReports;