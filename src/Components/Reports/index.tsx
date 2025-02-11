import { useState } from 'react';
import { Button, Group, Table, Text, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

const LOCAL_REPORTS = [
  {
    transactionId: 'TX123',
    partnerReference: 'REF001',
    productName: 'Producto A',
    salesPrice: '50000 COP',
    status: 'Completado',
    transactionDate: '2025-02-02',
  },
  {
    transactionId: 'TX124',
    partnerReference: 'REF002',
    productName: 'Producto B',
    salesPrice: '75000 COP',
    status: 'Pendiente',
    transactionDate: '2025-02-05',
  },
  {
    transactionId: 'TX125',
    partnerReference: 'REF003',
    productName: 'Producto C',
    salesPrice: '120000 COP',
    status: 'Cancelado',
    transactionDate: '2025-02-05',
  },
];

function Reports() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = () => {
    if (!startDate || !finishDate) {
      setError('Por favor, selecciona ambas fechas.');
      setFilteredReports([]);
      return;
    }

    if (finishDate.getTime() - startDate.getTime() > 31 * 24 * 60 * 60 * 1000) {
      setError('El rango entre fechas no puede exceder 31 días.');
      setFilteredReports([]);
      return;
    }

    setError(null);
    
    const filtered = LOCAL_REPORTS.filter((report) => {
      const reportDate = new Date(report.transactionDate);
      return reportDate >= startDate && reportDate <= finishDate;
    });

    setFilteredReports(filtered);
  };

  return (
    <div
      style={{
        padding: '1rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Title ta="center" weight={700} mb="md" order={2}>
        Reportes de Ventas por Período
      </Title>

      <Group
        mb="md"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center',
        }}
      >
        <DatePicker
          placeholder="Fecha de inicio"
          label="Inicio"
          value={startDate}
          style={{ flex: '1 1 300px' }}
          radius="md"
          size="lg"
          onChange={setStartDate}
        />
        <DatePicker
          placeholder="Fecha de fin"
          label="Fin"
          value={finishDate}
          style={{ flex: '1 1 300px' }}
          radius="md"
          size="lg"
          onChange={setFinishDate}
        />
      </Group>

      <Group position="center" mb="md">
        <Button radius="lg" className="button" size="lg" onClick={fetchReports}>
          Obtener Reportes
        </Button>
      </Group>

      {error && (
        <Text color="red" mb="md">
          {error}
        </Text>
      )}

      {filteredReports.length === 0 && !error && (
        <Text color="gray" ta="center" size="lg">
          No hay reportes en el rango de fechas seleccionado.
        </Text>
      )}

      {filteredReports.length > 0 && (
        <Table
          striped
          highlightOnHover
          withColumnBorders
          style={{
            overflowX: 'auto',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr>
              <th>ID Transacción</th>
              <th>Referencia</th>
              <th>Producto</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.transactionId}>
                <td>{report.transactionId}</td>
                <td>{report.partnerReference}</td>
                <td>{report.productName}</td>
                <td>{report.salesPrice}</td>
                <td>{report.status}</td>
                <td>{report.transactionDate}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default Reports;
