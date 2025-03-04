import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    Modal,
    Button,
    Group,
    NumberInput,
    Stack,
    Select
} from "@mantine/core";
import { toast } from 'sonner';

interface AdminBalanceFormData {
    saldo: number;
    clientId: string | null;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    role: string;
    rango: string;
}

interface EditClientProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
    onBalanceUpdate: (newBalance: number) => void;
}

const EditClient = ({ user, onBalanceUpdate }: EditClientProps) => {
    const [opened, setOpened] = useState(false);
    const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
    const { handleSubmit, reset, setValue, watch } = useForm<AdminBalanceFormData>({
        defaultValues: {
            saldo: 1,
            clientId: null,
        },
    });

    const saldo = watch("saldo", 1);
    const clientId = watch("clientId", "");

    useEffect(() => {
        fetch('http://localhost:4000/users/clients')
            .then((res) => res.json())
            .then((data: Client[]) => {
                const formattedClients = data.map(client => ({
                    value: client._id,
                    label: `${client.name} (${client.email})`,  // Mostrar nombre y correo
                }));
                setClients(formattedClients);
            })
            .catch((error) => console.error('Error fetching clients:', error));
    }, []);

    const handleClose = () => {
        setOpened(false);
        reset({ saldo: 1, clientId: null });
    };

    const onSubmit = async (data: AdminBalanceFormData) => {
        if (!data.clientId) {
            toast.error("Por favor, selecciona un cliente.");
            return;
        }

        if (typeof data.saldo !== 'number' || data.saldo <= 0) {
            toast.error("Por favor, ingresa un saldo válido.");
            return;
        }

        handleClose();

        // Obtener los detalles completos del cliente seleccionado
        const selectedClient = clients.find(client => client.value === data.clientId);

        if (!selectedClient) {
            toast.error("Cliente no encontrado.");
            return;
        }

        // Enviar todos los detalles necesarios al backend
        const response = await axios.put('http://localhost:4000/user/balance', {
            userId: data.clientId,
            amount: data.saldo,
            transactionUserName: user?.handle,
            role: user?.role, // El rol del usuario que realiza la transacción
            clientDetails: selectedClient,  // Enviar los detalles completos del cliente
        });

        if (response.data?.saldo !== undefined) {
            toast.success("Saldo actualizado correctamente");
            onBalanceUpdate(response.data.saldo);
        } else {
            toast.error('Error al obtener el saldo actualizado');
        }
    };

    return (
        <>
            <Modal radius="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <Select
                            label="Selecciona un cliente"
                            placeholder="Elige un cliente"
                            data={clients}
                            onChange={(value) => setValue("clientId", value)}
                            value={clientId}
                        />

                        <NumberInput
                            radius="md"
                            label="Saldo a Sumar"
                            value={saldo}
                            onChange={(value) => setValue("saldo", value || 1)}
                            max={1000000}
                            min={1}
                        />
                    </Stack>

                    <Group position="center" mt="md">
                        <Button type="submit" disabled={!clientId || saldo <= 0}>
                            Sumar Saldo
                        </Button>
                    </Group>
                </form>
            </Modal>

            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                Añadir Saldo Cliente
            </Button>
        </>
    );
};

export default EditClient;
