import * as XLSX from 'xlsx';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect, SetStateAction } from 'react';
import { IconSearch, IconReload, IconDownload, IconAdjustments } from '@tabler/icons-react';
import { Button, Group, ScrollArea, Table, Text, Title, ActionIcon, Input, Pagination } from '@mantine/core';
import { fetchTransactions } from '../../utils/utils';

const BalanceReports: React.FC<{ user: any }> = ({ user }) => {
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [finishDate, setFinishDate] = useState<Date | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 8;

    const isMobile = useMediaQuery('(max-width: 1000px)');

    useEffect(() => {
        if (user) {
            fetchTransactions(
                user._id, 
                user.role,
                setAllTransactions,
                setFilteredTransactions,
                setError
            );
        }
    }, [user]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = allTransactions.filter((transaction) =>
                transaction.transactionUserName.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTransactions(filtered);
        } else {
            setFilteredTransactions(allTransactions);
        }
    }, [searchQuery, allTransactions]);

    const handleFilterDates = () => {
        if (startDate && finishDate) {
            const filtered = allTransactions.filter((transaction) => {
                const transactionDate = new Date(transaction.created_at);
                const finishDateEndOfDay = new Date(finishDate);
                finishDateEndOfDay.setHours(23, 59, 59, 999);
                return transactionDate >= startDate && transactionDate <= finishDateEndOfDay;
            });
            setFilteredTransactions(filtered);
        }
    };

    const clearDateFilter = () => {
        setStartDate(null);
        setFinishDate(null);
        setFilteredTransactions(allTransactions);
    };

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

    const paginatedReports = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

    return (
        <div>
            <Title ta="center" weight={700} mb="sm" order={2}>Reportes de Balance</Title>
            <Group style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '4fr 1fr', gap: '10px', width: '100%' }}>
                <Input
                    radius="md"
                    size="lg"
                    icon={<IconSearch />}
                    placeholder="Usuario"
                    value={searchQuery}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
                />
                <Group>
                    <ActionIcon style={{ background: '#0c2a85', color: 'white' }} radius="md" size="xl" onClick={handleFilterDates} color="indigo" variant="filled">
                        <IconAdjustments size={30} />
                    </ActionIcon>
                    <ActionIcon style={{ background: '#0c2a85', color: 'white' }} radius="md" size="xl" onClick={clearDateFilter} color="indigo" variant="filled">
                        <IconReload size={30} />
                    </ActionIcon>
                    <ActionIcon style={{ background: '#0c2a85', color: 'white' }} radius="md" size="xl" onClick={() => exportToExcel(filteredTransactions)} color="indigo" variant="filled">
                        <IconDownload size={30} />
                    </ActionIcon>
                </Group>
            </Group>

            {error && <Text color="red" mb="md">{error}</Text>}

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
                <ScrollArea style={{ height: '380px', width: '100%' }} type="never">
                    <Table mt={15} mb={isMobile ? 100 : 5} striped highlightOnHover withBorder withColumnBorders>
                        <thead style={{ background: '#0c2a85' }}>
                            <tr>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Monto</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Balance Anterior</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Tipo</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Fecha</Title></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReports.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td style={{ textAlign: 'center' }}>{transaction.amount}</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.previousBalance}</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.type}</td>
                                    <td style={{ textAlign: 'center' }}>{new Date(transaction.created_at).toLocaleDateString('es-ES')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </ScrollArea>
            )}
        </div>
    );
};

export default BalanceReports;
