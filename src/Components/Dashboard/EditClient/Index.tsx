import axios from "axios";
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Modal, Button, Group, NumberInput, Stack, Select } from "@mantine/core";

interface AdminBalanceFormData {
    saldo: number;
    clientHandle: string | null;
}

interface Client {
    handle: string;
    name: string;
    email: string;
}

interface EditClientProps {
    user: { handle: string; role: string; saldo: number; } | null;
    onBalanceUpdate: (newBalance: number) => void;
}

const EditClient = ({ user, onBalanceUpdate }: EditClientProps) => {
    const [opened, setOpened] = useState(false);
    const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
    const { handleSubmit, reset, setValue, watch } = useForm<AdminBalanceFormData>({
        defaultValues: { saldo: 1, clientHandle: null },
    });

    const saldo = watch("saldo", 1);
    const clientHandle = watch("clientHandle", "");

    useEffect(() => {
        if (opened) {
            axios.get<Client[]>(`${import.meta.env.VITE_API_BASE_URL}/users/clients`)
                .then(({ data }) => {
                    setClients(data.map(client => ({
                        value: client.handle,
                        label: `${client.name} (${client.email})`,
                    })));
                })
                .catch(error => console.error('Error fetching clients:', error));
        }
    }, [opened]);
    
    const handleClose = () => {
        setOpened(false);
        reset();
    };

    const onSubmit = async (data: AdminBalanceFormData) => {
        if (!data.clientHandle) {
            toast.error("Por favor, selecciona un cliente.");
            return;
        }

        if (isNaN(data.saldo) || data.saldo <= 0) {
            toast.error("Por favor, ingresa un saldo válido.");
            return;
        }

        handleClose();

        try {
            const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/balance/${data.clientHandle}`, {
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
                            label="Selecciona un cliente"
                            placeholder="Elige un cliente"
                            data={clients}
                            onChange={(value) => setValue("clientHandle", value)}
                            value={clientHandle}
                            transition="pop-top-left"
                            transitionDuration={80}
                            transitionTimingFunction="ease"
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
                                background: !clientHandle || saldo <= 0 ? 'gray' : '#0c2a85',
                                cursor: !clientHandle || saldo <= 0 ? 'not-allowed' : 'pointer',
                                opacity: !clientHandle || saldo <= 0 ? 0.6 : 1,
                            }}
                            type="submit"
                            disabled={!clientHandle || saldo <= 0}
                        >
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