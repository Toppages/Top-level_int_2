import * as XLSX from 'xlsx';
import { useMediaQuery } from '@mantine/hooks';
import { DatePicker } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { IconCalendarWeek, IconDownload, IconReload, IconUser } from '@tabler/icons-react';
import { Group, ScrollArea, Table, Text, Title, ActionIcon, Pagination, Select } from '@mantine/core';
import { fetchTransactions } from '../../utils/utils';


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

    const isMobile = useMediaQuery('(max-width: 1000px)');

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

        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [selectedUserHandle, selectedDate, searchTerm, allTransactions]);

    const exportToExcel = (data: any[]) => {
        const filteredData = data.map((transaction) => {
            const { user, __v, ...cleanedTransaction } = transaction;
            const formattedDate = new Date(transaction.created_at);
            cleanedTransaction['Fecha'] = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;
            return cleanedTransaction;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(wb, ws, 'Transacciones');
        XLSX.writeFile(wb, 'balance_reports.xlsx');
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
            <Title ta="center" weight={700} mb="sm" order={2}>Reportes de Balance</Title>
            {userRole !== 'cliente' && userRole !== 'vendedor' && (
                <>

                    <Group
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : ' 3fr 3fr 1fr',
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
                            <ActionIcon
                                style={{ background: '#0c2a85', color: 'white', }} radius="md" size="xl"
                                color="indigo"
                                variant="filled"
                                onClick={clearFilters}
                            >
                                <IconReload size={30} />
                            </ActionIcon>
                            <ActionIcon
                                style={{ background: '#0c2a85', color: 'white', }}
                                radius="md"
                                size="xl"
                                color="indigo"
                                variant="filled"
                                onClick={() => exportToExcel(filteredTransactions)}
                            >
                                <IconDownload size={30} />
                            </ActionIcon>
                        </Group>
                    </Group>
                </>
            )}

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

                            <ActionIcon
                                style={{ background: '#0c2a85', color: 'white', }}
                                radius="md"
                                size="xl"
                                color="indigo"
                                variant="filled"
                                onClick={() => exportToExcel(filteredTransactions)}
                            >
                                <IconDownload size={30} />
                            </ActionIcon>
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
                <ScrollArea style={{ height: '340px', width: '100%' }} type="never">
                    <Table mt={15} striped highlightOnHover withBorder withColumnBorders>
                        <thead style={{ background: '#0c2a85' }}>
                            <tr>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>ID</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Fecha</Title></th>
                                {userRole !== 'cliente' && (
                                    <>
                                        <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Realizado por</Title></th>
                                        <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Beneficiado</Title></th>
                                    </>
                                )}
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Monto</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Balance Anterior</Title></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReports.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td style={{ textAlign: 'center' }}>{transaction.transactionId}</td>
                                    <td style={{ textAlign: 'center' }}>{new Date(transaction.created_at).toLocaleDateString('es-ES')}</td>
                                    {userRole !== 'cliente' && (
                                        <>
                                            <td style={{ textAlign: 'center' }}>{transaction.transactionUserName}</td>
                                            <td style={{ textAlign: 'center' }}>{transaction.userhandle}</td>
                                        </>
                                    )}
                                    <td style={{ textAlign: 'center' }}>{transaction.amount} USD</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.previousBalance} USD</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ScrollArea>
            )}
        </>
    );
};

export default BalanceReports;