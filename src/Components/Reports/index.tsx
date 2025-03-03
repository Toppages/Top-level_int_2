import * as XLSX from 'xlsx';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect, SetStateAction } from 'react';
import { IconAdjustments, IconCopy, IconReload, IconEye, IconSearch, IconDownload } from '@tabler/icons-react';
import { Button, Group, ScrollArea, Table, Text, Modal, Title, ActionIcon, Input, Pagination } from '@mantine/core';
import { fetchUserRole, fetchReports, handleSearchChange, formatDate, handlePinClick, copyToClipboard } from '../../utils/utils';

interface ReportsProps {
  user: { _id: string; name: string; email: string; handle: string } | null;
}

function Reports({ user }: ReportsProps) {

  const exportToExcel = (data: any[]) => {
    const filteredData = data.map((report) => {
      const { user, order_id, _id, product, created_at, __v, status, ...cleanedReport } = report;

      const formattedDate = new Date(report.created_at);
      const formattedDateStr = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

      cleanedReport['Fecha'] = formattedDateStr;

      if (userRole === 'master') {
        cleanedReport['Usuario'] = report.user.handle;
      }

      return cleanedReport;
    });

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(filteredData);

    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');

    XLSX.writeFile(wb, 'reportes_ventas.xlsx');
  };



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

  const isMobile = useMediaQuery('(max-width: 1000px)');
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
      handleSearchChange(searchQuery, filteredReports.length > 0 ? filteredReports : allReports, setFilteredReports);
    }
  }, [searchQuery, allReports, filteredReports]);

  const handleFilterDates = () => {
    if (startDate && finishDate) {
      const filtered = allReports.filter((report) => {
        const reportDate = new Date(report.created_at);
        const finishDateEndOfDay = new Date(finishDate);
        finishDateEndOfDay.setHours(23, 59, 59, 999);

        return reportDate >= startDate && reportDate <= finishDateEndOfDay;
      });
      setFilteredReports(filtered);
    }
    setOpened(false);
  };

  const clearDateFilter = () => {
    setStartDate(null);
    setFinishDate(null);
    setFilteredReports(allReports);
  };

  useEffect(() => {
    handleSearchChange(searchQuery, filteredReports.length > 0 ? filteredReports : allReports, setFilteredReports);
  }, [searchQuery, filteredReports]);

  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (opened) {
      setStartDate(null);
      setFinishDate(null);
    }
  }, [opened]);

  return (
    <>
      <Modal radius="lg" withCloseButton={false} opened={pinsModalOpened} onClose={() => setPinsModalOpened(false)}>
        <ScrollArea style={{ height: '350px', width: '100%' }}>
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

      <Modal radius="lg" withCloseButton={false} opened={opened} onClose={() => setOpened(false)}>

        <Title ta="center" weight={700} mb="md" order={2}>Filtrar por fecha</Title>

        <Group
          mt={15}
          mb={15}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '10px',
            width: '100%',
          }}
        >
          <DatePicker
            placeholder="Fecha de inicio"
            label="Inicio"
            value={startDate}
            radius="md"
            size="lg"
            onChange={setStartDate}
          />
          <DatePicker
            placeholder="Fecha de fin"
            label="Fin"
            value={finishDate}
            radius="md"
            size="lg"
            onChange={setFinishDate}
          />
        </Group>


        <Group position="center" mb="md">
          <Button radius="lg" className="button" size="lg" onClick={handleFilterDates}>Filtrar Reportes</Button>
        </Group>

      </Modal>
      <Title ta="center" weight={700} mb="sm" order={2}>Reportes de Ventas</Title>

      <Group
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : ' 4fr 1fr',
          gap: '10px',
          width: '100%',
        }}
      >

        <Input
          radius="md"
          size="lg"
          icon={<IconSearch />}
          placeholder="Producto o Usuario"
          value={searchQuery}
          onChange={(e: { target: { value: SetStateAction<string> } }) => setSearchQuery(e.target.value)}
        />
        <Group>
          <ActionIcon style={{ background: '#0c2a85', color: 'white', }} radius="md" size="xl" onClick={() => setOpened(true)} color="indigo" variant="filled">
            <IconAdjustments size={30} />
          </ActionIcon>
          <ActionIcon
            style={{ background: '#0c2a85', color: 'white', }} radius="md" size="xl"
            color="indigo"
            variant="filled"
            onClick={clearDateFilter}
          >
            <IconReload size={30} />
          </ActionIcon>
          <ActionIcon
            style={{ background: '#0c2a85', color: 'white', }}
            radius="md"
            size="xl"
            color="indigo"
            variant="filled"
            onClick={() => exportToExcel(filteredReports)}
          >
            <IconDownload size={30} />
          </ActionIcon>
        </Group>

      </Group>
      <Pagination
        total={totalPages}
        radius="md"
        mt={15}
        size="lg"
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
      {error && <Text color="red" mb="md">{error}</Text>}

      {filteredReports.length === 0 && !error && (
        <Text color="gray" ta="center" size="lg">
          No hay reportes Disponibles
        </Text>
      )}

      {filteredReports.length > 0 && (
        <ScrollArea style={{ height: '420px', width: '100%' }} type="never">
          <Table mt={15} mb={isMobile ? 100 : 5} striped highlightOnHover withBorder withColumnBorders>
            <thead style={{ background: '#0c2a85' }}>
              <tr>
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Producto</Title></th>
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Precio</Title></th>
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Cantidad</Title></th>
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Fecha</Title></th>
                {userRole !== 'cliente' && userRole !== 'vendedor' && (
                  <th style={{ textAlign: 'center', color: 'white' }}><Title order={3}>Usuarios</Title></th>
                )}
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
                  {userRole !== 'cliente' && userRole !== 'vendedor' && (
                    <td style={{ textAlign: 'center' }}>{report.user.handle}</td>
                  )}
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
    </>
  );
}

export default Reports;