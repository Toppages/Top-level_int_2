import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Modal, Button, Group, NumberInput, Stack, Select } from "@mantine/core";
import { toast } from 'sonner';

interface AdminBalanceFormData {
    saldo: number;
    clientId: string | null;
}

interface Client {
    _id: string;
    name: string;
    email: string;
}

interface EditClientProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; } | null;
    onBalanceUpdate: (newBalance: number) => void;
}

const EditAdmins = ({ user, onBalanceUpdate }: EditClientProps) => {
    const [opened, setOpened] = useState(false);
    const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
    const { handleSubmit, reset, setValue, watch } = useForm<AdminBalanceFormData>({
        defaultValues: { saldo: 1, clientId: null },
    });

    const saldo = watch("saldo", 1);
    const clientId = watch("clientId", "");

    useEffect(() => {
        axios.get<Client[]>(`${import.meta.env.VITE_API_URL}/users/admins`)
            .then(({ data }) => {
                setClients(data.map(client => ({
                    value: client._id,
                    label: `${client.name} (${client.email})`,
                })));
            })
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    const handleClose = () => {
        setOpened(false);
        reset();
    };

    const onSubmit = async (data: AdminBalanceFormData) => {
        if (!data.clientId) {
            toast.error("Por favor, selecciona un Administrador.");
            return;
        }

        if (isNaN(data.saldo) || data.saldo <= 0) {
            toast.error("Por favor, ingresa un saldo válido.");
            return;
        }

        handleClose();

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_URL}/user/balance`, {
                userId: data.clientId,
                amount: data.saldo,
                transactionUserName: user?.handle,
                role: user?.role,
            });

            if (response.data?.saldo !== undefined) {
                toast.success("Saldo actualizado correctamente");
                onBalanceUpdate(response.data.saldo);
            } else {
                toast.error('Error al obtener el saldo actualizado');
            }
        } catch (error) {
            toast.error('Error al actualizar el saldo');
            console.error(error);
        }
    };

    return (
        <>
            <Modal radius="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <Select
                            label="Selecciona un Administrador"
                            placeholder="Elige un Administrador"
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
                        <Button
                            style={{
                                background: !clientId || saldo <= 0 ? 'gray' : '#0c2a85',
                                cursor: !clientId || saldo <= 0 ? 'not-allowed' : 'pointer',
                                opacity: !clientId || saldo <= 0 ? 0.6 : 1,
                            }}
                            type="submit"
                            disabled={!clientId || saldo <= 0}
                        >
                            Sumar Saldo
                        </Button>
                    </Group>
                </form>
            </Modal>
            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                Añadir Saldo a los administradores
            </Button>
        </>
    );
};

export default EditAdmins;