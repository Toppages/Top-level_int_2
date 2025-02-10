import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { Button, Group, Table, Text, Title } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

function Reports() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem('accessToken');

  const fetchReports = async () => {
    if (!startDate || !finishDate) {
      setError('Por favor, selecciona ambas fechas.');
      return;
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedFinishDate = finishDate.toISOString().split('T')[0];

    if (new Date(finishDate).getTime() - new Date(startDate).getTime() > 31 * 24 * 60 * 60 * 1000) {
      setError('El rango entre fechas no puede exceder 31 días.');
      return;
    }

    if (!accessToken) {
      setError('No se encontró el token de acceso. Por favor, inicia sesión.');
      return;
    }

    try {
      setError(null);
      const response = await axios.get(
        `https://proxy.paginaswebstop.workers.dev/report/${formattedStartDate}/${formattedFinishDate}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setReports(response.data);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      setError('Hubo un error al obtener los reportes. Intenta nuevamente.');
    }
  };

  const reportRows = reports.map((report) => (
    <tr key={report.transactionId}>
      <td>{report.transactionId}</td>
      <td>{report.partnerReference}</td>
      <td>{report.productName}</td>
      <td>{report.salesPrice}</td>
      <td>{report.status}</td>
      <td>{report.transactionDate}</td>
      <td>{report.keySentToCustomer ? 'Enviado' : 'No enviado'}</td>
    </tr>
  ));

  const authenticate = useCallback(async () => {
    if (!accessToken) {
      console.error('No token found, please login');
    }
  }, [accessToken]);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

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

      <Table
        striped
        highlightOnHover
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
            <th>Clave Enviada</th>
          </tr>
        </thead>
        <tbody>{reportRows}</tbody>
      </Table>
    </div>
  );
}

export default Reports;
