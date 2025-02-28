import { DatePicker } from '@mantine/dates';
import { useState, useEffect, SetStateAction } from 'react';
import { IconAdjustments, IconCopy, IconEye, IconSearch } from '@tabler/icons-react';
import { Button, Group, ScrollArea, Table, Text, Modal, Title, ActionIcon, Input, Pagination } from '@mantine/core';
import { fetchUserRole, fetchReports, handleSearchChange, formatDate, handlePinClick, copyToClipboard } from '../../utils/utils';

interface ReportsProps {
  user: { _id: string; name: string; email: string; handle: string } | null;
}

function Reports({ user }: ReportsProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [pinsModalOpened, setPinsModalOpened] = useState(false);
  const [pines, setPines] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 7;

  const userId = user?._id || null;

  useEffect(() => {
    if (userId) {
      fetchUserRole(setUserRole);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && userRole) {
      fetchReports(userId, userRole, setAllReports, setFilteredReports, setError);
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (allReports.length > 0) {
      handleSearchChange(searchQuery, allReports, setFilteredReports);
    }
  }, [searchQuery, allReports]);

  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Modal radius='lg' withCloseButton={false} opened={pinsModalOpened} onClose={() => setPinsModalOpened(false)}>
        <ScrollArea style={{ height: '300px', width: '100%' }}>
          <Table striped highlightOnHover withColumnBorders>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>
                  <Title order={3}>Pines</Title>
                </th>
                <th style={{ textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {pines.map((pin, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{pin.key}</td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    <ActionIcon radius="md" size="lg" color="green" variant="filled" onClick={() => copyToClipboard(pin.key)}>
                      <IconCopy size={23} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      </Modal>
      <Modal radius='lg' withCloseButton={false} opened={opened} onClose={() => setOpened(false)}>
        <Title ta="center" weight={700} mb="md" order={2}>Filtrar por fecha</Title>
        <Group mb="md" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <DatePicker placeholder="Fecha de inicio" label="Inicio" value={startDate} radius="md" size="lg" onChange={setStartDate} />
          <DatePicker placeholder="Fecha de fin" label="Fin" value={finishDate} radius="md" size="lg" onChange={setFinishDate} />
        </Group>
        <Group position="center" mb="md">
          <Button radius="lg" className="button" size="lg">Filtrar Reportes</Button>
        </Group>
      </Modal>
      <Title ta="center" weight={700} mb="md" order={2}>
        Reportes de Ventas
      </Title>

      <Group position='apart'>
        <Pagination
          total={totalPages}
          radius="md"
          size="lg"
          position="center"
          page={currentPage}
          onChange={handlePageChange}
          styles={(theme) => ({
            item: {
              '&[data-active]': {
                backgroundImage: theme.fn.gradient({ from: '#0c2a85', to: '#0c2a85' }),
              },
            },
          })}
        />
        <Group>
          <Input
            radius="md"
            size="lg"
            icon={<IconSearch />}
            placeholder="Producto o Usuario"
            value={searchQuery}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchQuery(e.target.value)} // Actualizar `searchQuery`
          />
          <ActionIcon style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }} radius="md" size="xl" onClick={() => setOpened(true)} color="indigo" variant="filled">
            <IconAdjustments size={30} />
          </ActionIcon>
        </Group>
      </Group>

      {error && <Text color="red" mb="md">{error}</Text>}

      {filteredReports.length === 0 && !error && (
        <Text color="gray" ta="center" size="lg">
          No hay reportes Disponibles
        </Text>
      )}

      {filteredReports.length > 0 && (
        <ScrollArea style={{ height: '342px', width: '100%' }} type="never">
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead style={{ background: '#0c2a85' }}>
              <tr>
                <th style={{ textAlign: 'center',color:'white' }}><Title order={3}>Producto</Title></th>
                <th style={{ textAlign: 'center',color:'white' }}><Title order={3}>Precio</Title></th>
                <th style={{ textAlign: 'center' ,color:'white'}}><Title order={3}>Cantidad</Title></th>
                <th style={{ textAlign: 'center',color:'white' }}><Title order={3}>Fecha</Title></th>
                <th style={{ textAlign: 'center',color:'white' }}><Title order={3}>Usuarios</Title></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {paginatedReports.map((report) => (
                <tr key={report.transactionId}>
                  <td style={{ textAlign: 'center' }}>{report.productName}</td>
                  <td style={{ textAlign: 'center' }}>{report.totalPrice}$</td>
                  <td style={{ textAlign: 'center' }}>{report.quantity}</td>
                  <td style={{ textAlign: 'center' }}>{formatDate(report.created_at)}</td>
                  <td style={{ textAlign: 'center' }}>{report.user.handle}</td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    <ActionIcon
                      style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                      color="indigo"
                      variant="filled"
                      onClick={() => handlePinClick(report.pins, setPines, setPinsModalOpened)}
                    >
                      <IconEye size={23} />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}

export default Reports;