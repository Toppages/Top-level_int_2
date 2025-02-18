import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    Modal,
    Button,
    Group,
    TextInput,
    NumberInput,
    Stack,
} from "@mantine/core";
import { toast } from 'sonner';

interface AdminBalanceFormData {
    api_key: string;
    api_secret: string;
    saldo: number;
}

const AdminBR = () => {
    const [opened, setOpened] = useState(false);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AdminBalanceFormData>({
        defaultValues: {
            api_key: "",
            api_secret: "",
            saldo: 100,
        },
    });

    const onSubmit = async (data: AdminBalanceFormData) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_Url}/admin/balance`, {
                api_key: data.api_key,
                api_secret: data.api_secret,
                saldo: data.saldo,
            });
    
            if (response.status === 200) {
                toast.success('Saldo del administrador actualizado correctamente');
                setOpened(false);
                reset();
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error('Error al actualizar el saldo: ' + (error.response?.data?.message || error.message));
            } else {
                toast.error('Error desconocido: ' + (error instanceof Error ? error.message : 'No se pudo determinar el error.'));
            }
        }
    };
    

    const handleClose = () => {
        setOpened(false);
        reset();
    };

    return (
        <>
            <Modal radius="lg" opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <TextInput
                            label="API Key"
                            radius="md"
                            {...register("api_key", {
                                required: "La API Key es obligatoria",
                            })}
                            error={errors.api_key?.message}
                        />

                        <TextInput
                            label="API Secret"
                            radius="md"
                            {...register("api_secret", {
                                required: "El API Secret es obligatorio",
                            })}
                            error={errors.api_secret?.message}
                        />

                        <NumberInput
                            radius="md"
                            label="Saldo"
                            {...register("saldo", {
                                valueAsNumber: true,
                                required: "El saldo es obligatorio",
                                min: {
                                    value: 100,
                                    message: "El saldo debe ser al menos 100",
                                },
                            })}
                            max={1000000}
                            min={100}
                            error={errors.saldo?.message}
                            onChange={(value) => setValue("saldo", value || 0)} 
                        />
                    </Stack>

                    <Group position="center" mt="md">
                        <Button type="submit">Actualizar Saldo Admin</Button>
                    </Group>
                </form>
            </Modal>

            <Group position="center">
                <Button mt={15} onClick={() => setOpened(true)}>Saldo Admin</Button>
            </Group>
        </>
    );
};

export default AdminBR;
