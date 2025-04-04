import { DatePicker } from '@mantine/dates';
import { IconAdjustments, IconCalendarWeek, IconCopy } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Table, Title, Loader, Pagination, Modal, ActionIcon, Group } from '@mantine/core';
import { toast } from 'sonner';

interface Pin {
    key: string;
    _id: { $oid: string };
}

interface Log {
    logId: number;
    product_code: string;
    product_name: string;
    quantity: number;
    total_amount: number;
    date: string;
    pins?: Pin[];
}


function Inventario() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const elementsPerPage = 8;
    const [opened, setOpened] = useState(false);
    const [selectedPins, setSelectedPins] = useState<Pin[] | null>(null);

    useEffect(() => {
        setIsLoading(true);
        fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory/logs`)
            .then((response) => response.json())
            .then((data) => {
                setLogs(data);
                setFilteredLogs(data);
                setIsLoading(false);
            })
            .catch((error) => {
                console.error('Error al obtener los logs:', error);
                setIsLoading(false);
            });
    }, []);
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
          toast.success('Pin copiado al portapapeles');
        }).catch(() => {
          toast.error('No se pudo copiar el pin');
        });
      };
      
      
    useEffect(() => {
        if (selectedDate) {
            const filtered = logs.filter((log) => {
                const logDate = new Date(log.date);
                return logDate.toDateString() === selectedDate.toDateString();
            });
            setFilteredLogs(filtered);
        } else {
            setFilteredLogs(logs);
        }

        setPage(1);
    }, [selectedDate, logs]);

    const startIndex = (page - 1) * elementsPerPage;
    const currentLogs = filteredLogs.slice(startIndex, startIndex + elementsPerPage);

    const rows = currentLogs.map((log) => (
        <tr key={log.logId}>
          <td style={{ textAlign: 'center' }}>{log.logId}</td>
          <td style={{ textAlign: 'center' }}>
            {new Date(log.date).toLocaleString(undefined, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </td>
          <td style={{ textAlign: 'center' }}>{log.product_name}</td>
          <td style={{ textAlign: 'center' }}>{log.quantity}</td>
          <td style={{ textAlign: 'center' }}>{log.total_amount.toFixed(3)} USD</td>
          <td style={{ textAlign: 'center' }}>
            <Group position="center" spacing="xs">
              {log.pins && log.pins.length > 0 ? (
                <ActionIcon
                  style={{ background: '#0c2a85', color: 'white' }}
                  size="sm"
                  variant="filled"
                  onClick={() => {
                    setSelectedPins(log.pins!);
                    setOpened(true);
                  }}
                >
                  <IconAdjustments size={18} />
                </ActionIcon>
              ) : (
                <span style={{ fontStyle: 'italic', color: '#555' }}>Inventario</span>
              )}
            </Group>
          </td>
        </tr>
      ));
      
    const totalPages = Math.ceil(filteredLogs.length / elementsPerPage);

    return (
        <>
<Modal
  opened={opened}
  onClose={() => {
    setOpened(false);
    setSelectedPins(null);
  }}
  title="Pines"
  size="md"
>
  {selectedPins && selectedPins.length > 0 ? (
    <Table striped  highlightOnHover  >
      <thead style={{ backgroundColor: '#0c2a85' }}>
        <tr>
          <th style={{ color: 'white', textAlign: 'center' }}>Pin</th>
          <th style={{ color: 'white', textAlign: 'center' }}></th>
        </tr>
      </thead>
      <tbody>
        {selectedPins.map((pin) => (
          <tr key={pin._id.$oid}>
            <td style={{ textAlign: 'center' }}>{pin.key}</td>
            <td style={{ textAlign: 'center' }}>
              <ActionIcon
                onClick={() => copyToClipboard(pin.key)}
                style={{ background: '#0c2a85', color: 'white' }}
              >
                <IconCopy size={18} />
              </ActionIcon>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  ) : (
    <p>No hay pines disponibles.</p>
  )}
</Modal>



            <Title ta="center" order={2}>Movimientos pin central</Title>
            <DatePicker
                radius="md"
                size="lg"
                icon={<IconCalendarWeek />}
                label="Seleccionar fecha"
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Selecciona una fecha"
            />
            <Pagination
                mt={10}
                total={totalPages}
                page={page}
                radius="md"
                size="md"
                onChange={setPage}
                withControls
                styles={(theme) => ({
                    item: {
                        '&[data-active]': {
                            backgroundImage: theme.fn.gradient({ from: '#0c2a85', to: '#0c2a85' }),
                        },
                    },
                })}
            />
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Loader size="xl" />
                </div>
            ) : (
                <Table mt={5} striped highlightOnHover withBorder withColumnBorders>
                    <thead style={{ background: '#0c2a85' }}>
                        <tr>
                            <th style={{ textAlign: 'center', color: 'white' }}>ID</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Fecha</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Nombre del Producto</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Cantidad</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Monto Total</th>
                            <th style={{ textAlign: 'center', color: 'white' }}>Pines</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length > 0 ? rows : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center' }}>No hay disponibles para esta fecha.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}
        </>
    );
}

export default Inventario;
