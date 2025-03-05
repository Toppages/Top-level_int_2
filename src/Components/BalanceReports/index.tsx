import * as XLSX from 'xlsx';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect, SetStateAction } from 'react';
import { IconDownload, IconSearch } from '@tabler/icons-react';
import { Group, ScrollArea, Table, Text, Title, ActionIcon, Pagination, Input } from '@mantine/core';
import { fetchTransactions } from '../../utils/utils';

const BalanceReports: React.FC<{ user: any }> = ({ user }) => {
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
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
        const filtered = allTransactions.filter((transaction) =>
            transaction.transactionUserName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTransactions(filtered);
        setCurrentPage(1);
    }, [searchTerm, allTransactions]);


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
            <Group style={{ display: 'grid', gridTemplateColumns: '9fr 1fr', gap: '25px', width: '100%' }}>
                <Input
                    radius="md"
                    size="lg"
                    icon={<IconSearch />}
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
                />
                <Group>
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
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>ID</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Realizado por</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Monto</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Balance Anterior</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Tipo</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>beneficiado</Title></th>
                                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Fecha</Title></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReports.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td style={{ textAlign: 'center' }}>{transaction.transactionId}</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.transactionUserName}</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.amount} USD</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.previousBalance} USD</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.type}</td>
                                    <td style={{ textAlign: 'center' }}>{transaction.userName}</td>
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
