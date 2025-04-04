import axios from 'axios';
import { useState, useEffect } from 'react';
import { Modal, Button, Group, Select, TextInput, Box, Divider } from '@mantine/core';
import { IconUser, IconUserEdit } from '@tabler/icons-react';
import { toast } from 'sonner';

function EditUser() {
    const [opened, setOpened] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/all`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        if (opened) {
            fetchUsers();
        }
    }, [opened]);

    const handleUserChange = (value: string | null) => {
        setSelectedUserId(value);
        const user = users.find((u) => u._id === value);
        if (user) {
            const { password, purchaseLimits, __v, ...cleanedUser } = user;
            setFormData(cleanedUser);
        } else {
            setFormData(null);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value,
        }));
    };

    const groupedOptions = users.map((user) => ({
        value: user._id,
        label: `${user.name} (${user.email})`,
        group: user.role || 'Sin admin',
    }));

    const roleOptions = [
        { value: "admin", label: "Administrador" },
        { value: "vendedor", label: "Vendedor" },
        { value: "cliente", label: "Cliente" },
        { value: "master", label: "Master" },
    ];

    const handleUpdateUser = async () => {
        if (!selectedUserId || !formData) return;

        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/${selectedUserId}`, formData);
            toast.success('Usuario actualizado correctamente');

            closeModal();
        } catch (error) {
            toast.error('Error al actualizar usuario');
        }
    };

    const closeModal = () => {
        setOpened(false);
        setSelectedUserId(null);
        setFormData(null); 
    };

    return (
        <>
            <Modal opened={opened} onClose={closeModal} withCloseButton={false} size="lg">
                <Select
                    label="Selecciona un usuario"
                    placeholder="Elegí uno"
                    data={groupedOptions}
                    value={selectedUserId}
                    onChange={handleUserChange}
                    transition="pop-top-left"
                    transitionDuration={80}
                    transitionTimingFunction="ease"
                    searchable
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

                {formData && (
                    <div style={{ marginTop: 20 }}>
                        <Divider
                            my="xs"
                            variant="dashed"
                            labelPosition="center"
                            label={
                                <>
                                    <IconUser size={18} />
                                    <Box ml={5}>Datos actuales</Box>
                                </>
                            }
                        />
                        <Group grow mb={10}>
                            <TextInput
                                label="Nombre de usuario"
                                value={formData.handle}
                                onChange={(e) => handleInputChange('handle', e.currentTarget.value)}
                                style={{ width: "100%" }}
                            />
                            <TextInput
                                label="Nombre Completo"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.currentTarget.value)}
                                style={{ width: "100%" }}
                            />
                        </Group>
                        <Group grow mb={10}>
                            <TextInput
                                label="Correo Electrónico (Gmail)"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.currentTarget.value)}
                            />
                            <Select
                                label="Rol"
                                value={formData.role}
                                onChange={(value) => handleInputChange('role', value)}
                                data={roleOptions}
                                placeholder="Selecciona un rol"
                                transition="pop-top-left"
                                transitionDuration={80}
                                transitionTimingFunction="ease"
                                searchable
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
                        </Group>

                        <Button mt={20} fullWidth style={{ background: '#0c2a85' }} onClick={handleUpdateUser}>
                            Actualizar
                        </Button>
                    </div>
                )}
            </Modal>

            <Group position="center">
                <Button size="md" leftIcon={<IconUserEdit />} style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
                    Editar usuario
                </Button>
            </Group>
        </>
    );
}

export default EditUser;
