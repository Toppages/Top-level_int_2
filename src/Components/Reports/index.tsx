import * as XLSX from 'xlsx';
import { DatePicker } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { IconReload, IconEye, IconDownload, IconCalendarWeek, IconUser } from '@tabler/icons-react';
import { fetchUserRole, fetchReports, handlePinClick, formatDateTime } from '../../utils/utils';
import { Group, ScrollArea, Table, Text, Modal, Title, ActionIcon, Pagination, Divider, Select, Button } from '@mantine/core';

interface ReportsProps {
  user: { _id: string; name: string; email: string; handle: string; role: string; rango: string; } | null;
}

function Reports({ user }: ReportsProps) {

  const exportToExcel = (data: any[]) => {
    const filteredData = data.map((report) => {
      const { _id, product, order_id, productName, status, pins, saleId, __v, user, created_at, totalPrice, moneydisp, originalVendedorHandle, quantity, previousInventarioSaldo, ...cleanedReport } = report; // Excluir los campos quantity y previousInventarioSaldo

      const formattedDate = new Date(report.created_at);
      const formattedDateStr = `${formattedDate.getDate().toString().padStart(2, '0')}/${(formattedDate.getMonth() + 1).toString().padStart(2, '0')}/${formattedDate.getFullYear()} ${formattedDate.getHours().toString().padStart(2, '0')}:${formattedDate.getMinutes().toString().padStart(2, '0')}`;

      cleanedReport['Fecha'] = formattedDateStr;
      cleanedReport['ID'] = report.saleId;
      cleanedReport['Producto'] = report.productName;
      cleanedReport['Precio total'] = report.totalPrice;

      // Si el usuario es cliente, no incluir 'Saldo Actual'
      if (userRole !== 'cliente') {
        cleanedReport['Saldo Actual'] = report.moneydisp; // Solo agregar este campo si no es cliente
      }

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
  const [, setPines] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const userHandle = user?.handle || null;

  const [userHandles, setUserHandles] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUserHandle, setSelectedUserHandle] = useState<string | null>(null);
  const [availableHandles, setAvailableHandles] = useState<string[]>([]);

  useEffect(() => {
    if (userHandle) {
      fetchUserRole(setUserRole);
    }
  }, [userHandle]);

  useEffect(() => {
    if (user?.handle && user?.role && user?.rango) {
      fetchReports(user.handle, user.role, user.rango, setAllReports, setFilteredReports, setError);
    }
  }, [user]);
  useEffect(() => {
    if (userRole === 'cliente') {
      const originalHandles = allReports
        .map((r) => r.originalVendedorHandle)
        .filter((handle) => handle); // elimina null/undefined

      const uniqueHandles = Array.from(new Set([userHandle, ...originalHandles]));
      setAvailableHandles(uniqueHandles);
    }
  }, [allReports, userRole, userHandle]);

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
      filtered = filtered.filter(report => {
        const userHandleMatch = report.user.handle === selectedUserHandle;
        const originalHandleMatch = report.originalVendedorHandle === selectedUserHandle;
        return userHandleMatch || originalHandleMatch;
      });
    }


    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 59, 0, 0); // 00:59

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate >= startOfDay && reportDate <= endOfDay;
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


  return (

    <>
      <Modal radius="lg" withCloseButton={false} opened={pinsModalOpened} onClose={() => setPinsModalOpened(false)}>
        <Title ta="center" order={3}>Detalles de la Venta</Title>
        {isMobile && selectedReport && (
          <>
            <Title ta="center" order={4}>{selectedReport.saleId}: {selectedReport.productName}</Title>
            {userRole !== 'vendedor' && (

              <Group mt='md' position="apart" mb="md">
                <Title order={4}>Total:</Title>
                <Title order={4}>{selectedReport.totalPrice} USD</Title>
              </Group>
            )}
            <Group mt='md' position="apart" mb="md">
              <Title order={4}>Fecha:</Title>
              <Title order={4}>{formatDateTime(selectedReport.created_at)}</Title>
            </Group>

            {userRole !== 'vendedor' && userRole !== 'cliente' && (
              <Group mt='md' position="apart" mb="md">
                <Title order={4}>Saldo Disponible:</Title>
                <Title order={4}>{selectedReport.moneydisp} USD</Title>
              </Group>
            )}

            {userRole !== 'cliente' && userRole !== 'vendedor' && (
              <Title ta='center' order={4}>{selectedReport.user.handle}</Title>
            )}

            {userRole === 'cliente' && (user?.rango === 'oro' || user?.rango === 'plata') && selectedReport?.originalVendedorHandle && (
              <Group mt='md' position="apart" mb="md">
                <Title order={4}>Usuario:</Title>
                <Title order={4}>{selectedReport.originalVendedorHandle}</Title>
              </Group>
            )}
            <Divider my="sm" size='md' variant="dashed" />
          </>
        )}
        <Table striped highlightOnHover>
          <tbody>
            {selectedReport?.playerId && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>ID:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.playerId}</td>
              </tr>
            )}
            {selectedReport?.nickname && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Nickname:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.nickname}</td>
              </tr>
            )}
            {selectedReport?.pins?.length > 0 && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Pin:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.pins.map((pin: { serial: any; }) => pin.serial).join(', ')}</td>
              </tr>
            )}

            {selectedReport?.phone && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Teléfono:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.phone}</td>
              </tr>
            )}
            {selectedReport?.bank && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Banco:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.bank}</td>
              </tr>
            )}
            {selectedReport?.reference && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Referencia:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.reference}</td>
              </tr>
            )}
            {selectedReport?.fechaPago && (
              <tr>
                <td style={{ fontWeight: 'bold', textAlign: 'right' }}>Fecha de Pago:</td>
                <td style={{ textAlign: 'left' }}>{selectedReport.fechaPago}</td>
              </tr>
            )}


          </tbody>
        </Table>
      </Modal>


      <Title ta="center" weight={700} mb="lg" order={2}>Reportes de Ventas</Title>

      {(userRole === 'cliente') && (
        <>
          <Group
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 2fr 1fr',
              gap: '10px',
              width: '100%',
            }}
          >
            <Select
              radius="md"
              size="lg"
              icon={<IconUser />}
              placeholder="Filtrar por Usuario"
              label="Filtrar Usuario"
              transition="pop-top-left"
              transitionDuration={80}
              transitionTimingFunction="ease"
              data={[{ value: 'todos', label: 'Todos' }, ...availableHandles.map(h => ({ value: h, label: h }))]}
              value={selectedUserHandle}
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
              <Button
                style={{ background: '#0c2a85', color: 'white' }}
                leftIcon={<IconDownload />}
                radius="md"
                size="md"
                color="indigo"
                variant="filled"
                onClick={() => exportToExcel(filteredReports)}
              >
                Descargar
              </Button>
            </Group>
          </Group>
        </>
      )}

      {(userRole === 'vendedor') && (
        <>
          <Group
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '4fr 1fr' : '6fr 1fr',
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
              <Button
                style={{ background: '#0c2a85', color: 'white' }}
                leftIcon={<IconDownload />}
                radius="md"
                size="md"
                color="indigo"
                variant="filled"
                onClick={() => exportToExcel(filteredReports)}
              >
                Descargar
              </Button>


            </Group>
          </Group>
        </>
      )}
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
              dropdownType="modal"
              value={selectedDate}
              onChange={handleDateChange}
            />
            <Group position={isMobile ? 'center' : 'apart'} mt={20}>

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
                onClick={() => exportToExcel(filteredReports)}
              >
                Recargar
              </Button>

            </Group>
          </Group>
        </>
      )}

      <Pagination
        total={totalPages}
        radius="md"
        mt={10}
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

        <ScrollArea>

          <Table mt={10} striped highlightOnHover withBorder withColumnBorders>
            <thead style={{ background: '#0c2a85' }}>
              <tr>
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>ID</Title></th>
                {!isMobile && (
                  <>
                    <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Fecha</Title></th>
                  </>
                )}
                <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Producto</Title></th>
                {!isMobile && userRole === 'cliente' && user?.rango === 'oro' && (
                  <th style={{ textAlign: 'center', color: 'white' }}>
                    <Title order={4}>Usuario</Title>
                  </th>
                )}

                {userRole !== 'vendedor' && (
                  <th style={{ textAlign: 'center', color: 'white' }}><Title order={4}>Precio total</Title></th>
                )}
                {!isMobile && userRole !== 'vendedor' && userRole !== 'cliente' && (
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
                  {!isMobile && userRole === 'cliente' && (user?.rango === 'oro' || user?.rango === 'plata') && (
                    <td style={{ textAlign: 'center' }}>{report.originalVendedorHandle || report.user.handle}</td>
                  )}

                  {userRole !== 'vendedor' && (
                    <td style={{ textAlign: 'center' }}>{report.totalPrice} USD</td>
                  )}
                  {!isMobile && userRole !== 'vendedor' && userRole !== 'cliente' && (
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
        </ScrollArea>
      )}
    </>
  );
}

export default Reports;