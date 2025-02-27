import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    Modal,
    Button,
    Group,
    NumberInput,
    Stack,
} from "@mantine/core";
import { toast } from 'sonner';

interface AdminBalanceFormData {
    saldo: number;
}

const AdminBR = () => {
    const [opened, setOpened] = useState(false);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<AdminBalanceFormData>({
        defaultValues: {
            saldo: 100,
        },
    });

    const onSubmit = async (data: AdminBalanceFormData) => {
        try {
            const response = await axios.put(`${import.meta.env.VITE_API_Url}/admin/balance`, {
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
                        <NumberInput
                            radius="md"
                            label="Saldo a Sumar"
                            {...register("saldo", {
                                valueAsNumber: true,
                                required: "El saldo es obligatorio",
                                min: {
                                    value: 1,
                                    message: "El saldo debe ser al menos 1",
                                },
                            })}
                            max={1000000}
                            min={1}
                            error={errors.saldo?.message}
                            onChange={(value) => setValue("saldo", value || 0)} 
                        />
                    </Stack>

                    <Group position="center" mt="md">
                        <Button type="submit">Sumar Saldo Admin</Button>
                    </Group>
                </form>
            </Modal>

            <Group position="center">
                <Button mt={15} onClick={() => setOpened(true)}>Añadir Saldo</Button>
            </Group>
        </>
    );
};

export default AdminBR;