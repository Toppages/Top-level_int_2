import { useState, useEffect } from 'react';
import { Button, Group, ScrollArea, Table, Text, Modal, Title, ActionIcon, Input, Pagination } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import axios from 'axios';
import { IconAdjustments, IconCopy, IconEye, IconSearch } from '@tabler/icons-react';

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
  const itemsPerPage = 10;

  const userId = user?._id || null;

  const fetchUserRole = async () => {
    try {
      const response = await fetch("http://localhost:4000/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setUserRole(data.role);
    } catch (err) {
      console.error("Error al obtener el rol del usuario:", err);
      setError('Hubo un problema al obtener el rol del usuario.');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserRole();
    }
  }, [userId]);

  const fetchReports = async () => {
    if (!userId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('No se encontró el token. Inicia sesión nuevamente.');
      return;
    }

    try {
      const url = userRole === 'master'
        ? 'http://localhost:4000/sales'
        : `http://localhost:4000/sales/user/${userId}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllReports(response.data);
      setFilteredReports(response.data);

    } catch (err) {
      console.error('Error al obtener los reportes:', err);
      setError('Hubo un problema al obtener los reportes.');
    }
  };

  useEffect(() => {
    if (userId && userRole) {
      fetchReports();
    }
  }, [userId, userRole]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = allReports.filter((report) =>
      report.productName.toLowerCase().includes(query) || report.user.handle.toLowerCase().includes(query)
    );
    setFilteredReports(filtered);
  };

  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePinClick = (pins: any[]) => {
    setPines(pins);
    setPinsModalOpened(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Pin copiado al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar al portapapeles:', err);
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      <Modal radius='lg' withCloseButton={false} opened={pinsModalOpened} onClose={() => setPinsModalOpened(false)} >
        <ScrollArea style={{ height: '300px', width: '100%' }}>
          <Table striped highlightOnHover withColumnBorders>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>
                  <Title order={3}>
                    Pines
                  </Title>
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

        <Title ta="center" weight={700} mb="md" order={2}>
          Filtrar por fecha
        </Title>
        <Group mb="md" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          <DatePicker placeholder="Fecha de inicio" label="Inicio" value={startDate} radius="md" size="lg" onChange={setStartDate} />
          <DatePicker placeholder="Fecha de fin" label="Fin" value={finishDate} radius="md" size="lg" onChange={setFinishDate} />
        </Group>

        <Group position="center" mb="md">
          <Button radius="lg" className="button" size="lg">
            Filtrar Reportes
          </Button>
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
            placeholder="Buscar por Producto o Usuario"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <ActionIcon style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }} radius="md" size="xl" onClick={() => setOpened(true)} color="indigo" variant="filled">
            <IconAdjustments size={30} />
          </ActionIcon>
        </Group>
      </Group>

      {error && <Text color="red" mb="md">{error}</Text>}

      {filteredReports.length === 0 && !error && (
        <Text color="gray" ta="center" size="lg">
          No hay reportes en el rango de fechas seleccionado.
        </Text>
      )}

      {filteredReports.length > 0 && (
        <ScrollArea style={{ height: '300px', width: '100%' }} type="never">
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}><Title order={3}>Producto</Title></th>
                <th style={{ textAlign: 'center' }}><Title order={3}>Precio</Title></th>
                <th style={{ textAlign: 'center' }}><Title order={3}>Cantidad</Title></th>
                <th style={{ textAlign: 'center' }}><Title order={3}>Fecha</Title></th>
                <th style={{ textAlign: 'center' }}><Title order={3}>Usuarios</Title></th>
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
                      onClick={() => handlePinClick(report.pins)}
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