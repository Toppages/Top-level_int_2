import axios from "axios";
import { toast } from 'sonner';
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Modal, Button, Group, Stack, Select, TextInput, NumberInput } from "@mantine/core";

interface AdminEditUserData {
    name: string;
    email: string;
    role: string;
    saldo: number;
    rango: string;
    clientId: string | null;
}

interface Client {
    _id: string;
    name: string;
    email: string;
    handle: string;
}

const EditUser = () => {
    const [opened, setOpened] = useState(false);
    const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
    const { handleSubmit, reset, setValue, watch } = useForm<AdminEditUserData>({
        defaultValues: { name: '', email: '', role: 'cliente', saldo: 100, rango: 'oro', clientId: null },
    });

    const clientId = watch("clientId", "");

    useEffect(() => {
        if (opened) {
            axios.get<Client[]>(`${import.meta.env.VITE_API_BASE_URL}/users/clients`)
                .then(({ data }) => {
                    setClients(data.map(client => ({
                        value: client._id,
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

    const onSubmit = async (data: AdminEditUserData) => {
        if (!data.clientId) {
            toast.error("Por favor, selecciona un cliente.");
            return;
        }

        handleClose();

        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/${data.clientId}`, {
                name: data.name,
                email: data.email,
                role: data.role,
                saldo: data.saldo,
                rango: data.rango,
            });

            toast.success("Usuario actualizado correctamente");
        } catch (error) {
            toast.error('Error al actualizar el usuario');
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
                            onChange={(value) => setValue("clientId", value)}
                            value={clientId}
                        />
                        <TextInput
                            label="Nombre"
                            value={watch("name")}
                            onChange={(e) => setValue("name", e.target.value)}
                        />
                        <TextInput
                            label="Email"
                            value={watch("email")}
                            onChange={(e) => setValue("email", e.target.value)}
                        />
                        <Select
                            label="Rol"
                            value={watch("role")}
                            onChange={(value) => setValue("role", value ?? '')}
                            data={[
                                { value: 'admin', label: 'Admin' },
                                { value: 'vendedor', label: 'Vendedor' },
                                { value: 'cliente', label: 'Cliente' },
                                { value: 'master', label: 'Master' },
                            ]}
                        />
                        <NumberInput
                            label="Saldo"
                            value={watch("saldo")}
                            onChange={(value) => setValue("saldo", value ?? 0)}
                        />
                        <Select
                            label="Rango"
                            value={watch("rango")}
                            onChange={(value) => setValue("rango", value ?? '')}
                            data={[
                                { value: 'ultrap', label: 'Ultrap' },
                                { value: 'oro', label: 'Oro' },
                                { value: 'plata', label: 'Plata' },
                                { value: 'bronce', label: 'Bronce' },
                            ]}
                        />
                    </Stack>
                    <Group position="center" mt="md">
                        <Button type="submit">Actualizar Usuario</Button>
                    </Group>
                </form>
            </Modal>
            <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                Editar Usuario
            </Button>
        </>
    );
};

export default EditUser;
