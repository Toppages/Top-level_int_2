import * as XLSX from 'xlsx';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { IconCopy, IconReload, IconEye, IconDownload, IconCalendarWeek, IconUser } from '@tabler/icons-react';
import { fetchUserRole, fetchReports, formatDate, handlePinClick, copyToClipboard } from '../../utils/utils';
import { Group, ScrollArea, Table, Text, Modal, Title, ActionIcon, Pagination, Divider, Select } from '@mantine/core';

interface ReportsProps {
  user: { _id: string; name: string; email: string; handle: string; role: string; } | null;
}

function Reports({ user }: ReportsProps) {

  const exportToExcel = (data: any[]) => {
    const filteredData = data.map((report) => {
      const { _id, product, order_id, productName, status, pins, saleId, __v, user, created_at, quantity, totalPrice, moneydisp, ...cleanedReport } = report;

      const formattedDate = new Date(report.created_at);
      const formattedDateStr = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

      cleanedReport['Fecha'] = formattedDateStr;
      cleanedReport['ID'] = report.saleId;
      cleanedReport['Producto'] = report.productName;
      cleanedReport['Cantidad'] = report.quantity;
      cleanedReport['Precio total'] = report.totalPrice;
      cleanedReport['Saldo Actual'] = report.moneydisp;

      if (userRole !== 'cliente') {
        cleanedReport['Usuario'] = report.user.handle;
      }

      return cleanedReport;
    });

    let fileName = 'reportes_ventas';
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fileName += `_fecha_${dateStr}`;
    }
    if (selectedUserHandle && selectedUserHandle !== 'todos') {
      fileName += `_usuario_${selectedUserHandle}`;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData);
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [allReports, setAllReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pinsModalOpened, setPinsModalOpened] = useState(false);
  const [pines, setPines] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const userHandle = user?.handle || null;

  const [userHandles, setUserHandles] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUserHandle, setSelectedUserHandle] = useState<string | null>(null);

  useEffect(() => {
    if (userHandle) {
      fetchUserRole(setUserRole);
    }
  }, [userHandle]);

  useEffect(() => {
    if (userHandle && userRole) {
      fetchReports(userHandle, userRole, setAllReports, setFilteredReports, setError);
    }
  }, [userHandle, userRole]);

  useEffect(() => {
    const uniqueHandles = [...new Set(allReports.map((report) => report.user.handle))];
    setUserHandles(uniqueHandles);
  }, [allReports]);

  const clearFilters = () => {
    setSelectedUserHandle('todos');
    setSelectedDate(null);
    setFilteredReports(allReports);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };



  useEffect(() => {
    let filtered = allReports;

    if (selectedUserHandle && selectedUserHandle !== 'todos') {
      filtered = filtered.filter(report => report.user.handle === selectedUserHandle);
    }

    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(report => {
        const reportDate = report.created_at.split('T')[0];
        return reportDate === dateStr;
      });
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [selectedUserHandle, selectedDate, allReports]);

  const paginatedReports = filteredReports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const copyAllPins = () => {
    const allPinKeys = pines.map(pin => pin.key).join('\n');
    copyToClipboard(allPinKeys, true);
  };

  return (

    <>
      <Modal radius="lg" withCloseButton={false} opened={pinsModalOpened} onClose={() => setPinsModalOpened(false)}>
        {isMobile && selectedReport && (
          <>
            <Title ta="center" order={4}>{selectedReport.saleId}: {selectedReport.productName}</Title>
            <Group mt='md' position="apart" mb="md">
              <Title order={4}>Cantidad:</Title>
              <Title order={4}>{selectedReport.quantity}</Title>
            </Group>
            <Group mt='md' position="apart" mb="md">
              <Title order={4}>Total:</Title>
              <Title order={4}>{selectedReport.totalPrice} USD</Title>
            </Group>
            <Group mt='md' position="apart" mb="md">
              <Title order={4}>Fecha:</Title>
              <Title order={4}> {formatDate(selectedReport.created_at)}</Title>
            </Group>
            <Group mt='md' position="apart" mb="md">
              <Title order={4}>Saldo Disponible</Title>
              <Title order={4}>{selectedReport.moneydisp} USD</Title>
            </Group>
            {userRole !== 'cliente' && userRole !== 'vendedor' && (
              <Title ta='center' order={4}>{selectedReport.user.handle}</Title>
            )}
            <Divider my="sm" size='md' variant="dashed" />
          </>
        )}
        <ScrollArea style={{ height: '350px', width: '100%' }}>
          <Table striped highlightOnHover withColumnBorders>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}><Title order={3}>Pines</Title></th>
                <th style={{ textAlign: 'center' }}>
                  <ActionIcon radius="md" size="lg" color="blue" variant="filled" onClick={copyAllPins}>
                    <IconCopy size={23} />
                  </ActionIcon>

                </th>
              </tr>
            </thead>
            <tbody>
              {pines.map((pin, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{pin.key}</td>
                  <td style={{ display: 'flex', justifyContent: 'center' }} >
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

      <Title ta="center" weight={700} mb="xl" order={2}>Reportes de Retiros</Title>
      {userRole == 'cliente' || userRole == 'vendedor' && (
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
              dropdownType="modal"
              radius="md"
              size="lg"
              icon={<IconCalendarWeek />}
              placeholder="Filtrar Fecha"
              label="Filtrar Fecha"
              inputFormat="DD/MM/YYYY"
              labelFormat="MM/YYYY"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <Group mt={25}>

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
        </>
      )}

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
              onChange={handleDateChange}
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
                color="indigo"
                size="xl"
                variant="filled"
                onClick={() => exportToExcel(filteredReports)}
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

        <Table mt={5}  striped highlightOnHover withBorder withColumnBorders>
          <thead style={{ background: '#0c2a85' }}>
            <tr>
              <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>ID</Title></th>
              {!isMobile && (
                <>
                  <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Fecha</Title></th>
                </>
              )}
              <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Producto</Title></th>
              {!isMobile && (
                <>
                  <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Cantidad</Title></th>
                </>
              )}
               { userRole !== 'vendedor' && (
              <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Precio total</Title></th>
                )}
              {!isMobile && userRole !== 'vendedor' && (
                <>
                  <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Saldo Actual</Title></th>
                </>
              )}
              {!isMobile && userRole !== 'cliente' && userRole !== 'vendedor' && (
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Usuario</Title></th>
              )}
              <th style={{ textAlign: 'center', color: 'white' }}>
                <Title order={4}>{isMobile ? 'Info' : 'Pins'}</Title>
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedReports.map((report) => (
              <tr key={report.transactionId}>
                <td style={{ textAlign: 'center' }}>{report.saleId}</td>
                {!isMobile && (
                  <>
                    <td style={{ textAlign: 'center' }}>
                      {new Date(report.created_at).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                  </>
                )}
                <td style={{ textAlign: 'center' }}>{report.productName}</td>
                {!isMobile && (
                  <>
                    <td style={{ textAlign: 'center' }}>{report.quantity}</td>
                  </>
                )}
                  { userRole !== 'vendedor' && (
                <td style={{ textAlign: 'center' }}>{report.totalPrice} USD</td>
                  )}
                {!isMobile && userRole !== 'vendedor' &&  (
                  <>
                    <td style={{ textAlign: 'center' }}>{report.moneydisp}  USD</td>
                  </>
                )}
                {!isMobile && userRole !== 'cliente' && userRole !== 'vendedor' && (
                  <td style={{ textAlign: 'center' }}>{report.user.handle}</td>
                )}
                <td style={{ display: 'flex', justifyContent: 'center' }}>
                  <ActionIcon
                    style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
                    color="indigo"
                    size='sm'
                    variant="filled"
                    onClick={() => handlePinClick(report, setPines, setPinsModalOpened, setSelectedReport)}
                  >
                    <IconEye size={23} />
                  </ActionIcon>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}

export default Reports;