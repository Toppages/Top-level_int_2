import axios from "axios";
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Modal, Button, Group, Stack, Select } from "@mantine/core";
import { IconUserX } from "@tabler/icons-react";

interface Client {
    _id: string;
    name: string;
    email: string;
    handle: string;
    role: string;
}

const DeleteUser = () => {
    const [opened, setOpened] = useState(false);
    const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
    const { handleSubmit, reset, setValue, watch } = useForm<{ clientId: string | null }>({
        defaultValues: { clientId: null },
    });

    const clientId = watch("clientId", "");

    useEffect(() => {
        if (opened) {
            axios.get<Client[]>(`${import.meta.env.VITE_API_BASE_URL}/users/all`)
                .then(({ data }) => {
                    setClients(data.map(client => ({
                        value: client.handle,
                        label: `${client.name} (${client.email})`,
                        group: client.role.charAt(0).toUpperCase() + client.role.slice(1),
                    })));
                })
                .catch(error => console.error('Error fetching clients:', error));
        }
    }, [opened]);

    const handleClose = () => {
        setOpened(false);
        reset();
    };

    const onSubmit = async () => {
        if (!clientId) {
            toast.error("Por favor, selecciona un cliente.");
            return;
        }

        handleClose();

        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/user/${clientId}`);
            toast.success("Usuario eliminado correctamente");
            setClients(clients.filter(client => client.value !== clientId));
        } catch (error) {
            toast.error('Error al eliminar el usuario');
            console.error(error);
        }
    };

    return (
        <>
            <Modal radius="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <Select
                            label="Selecciona un cliente para eliminar"
                            placeholder="Elige un cliente"
                            data={clients}
                            onChange={(value) => setValue("clientId", value)}
                            value={clientId}
                            transition="pop-top-left"
                            transitionDuration={80}
                            transitionTimingFunction="ease"
                            styles={() => ({
                                item: {
                                    '&[data-selected]': {
                                        '&, &:hover': {
                                            backgroundColor: '#c0392b',
                                            color: 'white',
                                        },
                                    },
                                },
                            })}
                        />
                    </Stack>
                    <Group position="center" mt="md">
                        <Button
                            style={{
                                background: !clientId ? 'gray' : '#c0392b',
                                cursor: !clientId ? 'not-allowed' : 'pointer',
                                opacity: !clientId ? 0.6 : 1,
                            }}
                            type="submit"
                            disabled={!clientId}
                        >
                            Eliminar Usuario
                        </Button>
                    </Group>
                </form>
            </Modal>
            <Button size="md" leftIcon={<IconUserX />} style={{ background: '#c0392b' }} onClick={() => setOpened(true)}>
                Eliminar Usuario
            </Button>
        </>
    );
};

export default DeleteUser;