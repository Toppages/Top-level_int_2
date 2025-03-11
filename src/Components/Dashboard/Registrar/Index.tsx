import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
    Modal,
    Button,
    Group,
    TextInput,
    PasswordInput,
    Select,
    NumberInput,
    Stack,
    Progress,
    Text,
    Popover,
    Box,
} from "@mantine/core";
import { IconX, IconCheck } from '@tabler/icons-react';
import { toast } from 'sonner'

interface UserFormData {
    handle: string;
    name: string;
    password: string;
    confirmPassword: string;
    email: string;
    role: "admin" | "vendedor" | "cliente" | "master";
    saldo: number;
    rango?: "ultrap" | "plata" | "oro" | "bronce";
}

interface Client {
    handle: string;
    _id: string;
    name: string;
    email: string;
}

function PasswordRequirement({ meets, label }: { meets: boolean; label: string }) {
    return (
        <Text
            color={meets ? 'teal' : 'red'}
            sx={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />} <Box ml={10}>{label}</Box>
        </Text>
    );
}

const requirements = [
    { re: /[0-9]/, label: 'Incluye al menos un número' },
    { re: /[a-z]/, label: 'Incluye una letra minúscula' },
    { re: /[A-Z]/, label: 'Incluye una letra mayúscula' },
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;

    requirements.forEach((requirement) => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });

    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

function Registrar() {
    const [opened, setOpened] = useState(false);
    const [popoverOpened, setPopoverOpened] = useState(false);
    const [admins, setadmins] = useState<{ value: string, label: string }[]>([]);
    const [selectedAdmin, setSelectedAdmin] = useState<string | null>(null);

    useEffect(() => {
        axios.get<Client[]>(`${import.meta.env.VITE_API_Url}/users/admins`)
            .then(({ data }) => {
                setadmins(data.map(client => ({
                    value: client.handle,  
                    label: `${client.name} (${client.email})`,
                })));
            })
            .catch(error => console.error('Error fetching admins:', error));
    }, []);
    

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
    } = useForm<UserFormData>({
        defaultValues: {
            handle: "",
            name: "",
            password: "",
            confirmPassword: "",
            email: "",
            role: "cliente",
            saldo: 0,
            rango: "bronce",
        },
    });

    const onSubmit = async (data: UserFormData) => {
        try {
            if (["admin", "vendedor", "master"].includes(data.role)) {
                data.rango = "ultrap";
            } else if (data.role === "cliente" && !data.rango) {
                data.rango = "bronce";
            }
    
            const response = await axios.post(`${import.meta.env.VITE_API_Url}/auth/register`, {
                handle: data.handle,
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                saldo: data.saldo,
                rango: data.rango,
                admin: ["vendedor", "cliente"].includes(data.role) ? selectedAdmin : undefined,
            });
    
            toast.success("Registro exitoso: " + (response.data.message || "Usuario registrado correctamente"));
    
            setOpened(false);
            reset();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error("Error al registrar: " + (error.response?.data?.message || error.message));
            } else {
                toast.error("Error desconocido: " + (error instanceof Error ? error.message : "No se pudo determinar el error."));
            }
        }
    };

    const password = watch("password");

    const handleClose = () => {
        setOpened(false);
        reset();
    };

    const strength = getStrength(password);
    const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

    return (
        <>
            <Modal radius='lg' opened={opened} onClose={handleClose} withCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack>
                        <TextInput
                            label="Nombre de usuario"
                            radius='md'
                            {...register("handle", {
                                required: "El handle es obligatorio",
                                pattern: {
                                    value: /^[a-zA-Z0-9_]+$/,
                                    message: "El handle solo puede contener letras, números y guiones bajos",
                                },
                            })}
                            error={errors.handle?.message}
                        />

                        <TextInput
                            label="Nombre completo"
                            radius='md'
                            {...register("name", {
                                required: "El nombre es obligatorio",
                            })}
                            error={errors.name?.message}
                        />

                        <TextInput
                            label="Correo Electrónico (Gmail)"
                            radius='md'
                            {...register("email", {
                                required: "El correo electrónico es obligatorio",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                                    message: "El correo debe ser un Gmail válido",
                                },
                            })}
                            error={errors.email?.message}
                        />

<Select
    label="Rol"
    radius="md"
    {...register("role", { required: "El rol es obligatorio" })}
    data={[
        { value: "admin", label: "Administrador" },
        { value: "vendedor", label: "Vendedor" },
        { value: "cliente", label: "Cliente" },
        { value: "master", label: "Master" },
    ]}
    onChange={(value) => {
        const selectedRole = value as "admin" | "vendedor" | "cliente" | "master";
        setValue("role", selectedRole);
        if (["admin", "vendedor", "master"].includes(selectedRole)) {
            setValue("rango", "ultrap");
        } else {
            setValue("rango", "bronce");
        }
    }}
    error={errors.role?.message}
/>

                        {watch('role') === 'cliente' && (
                            <>
                            <Select
                                label="Rango"
                                radius='md'
                                {...register("rango", { required: "El rango es obligatorio para el rol cliente" })}
                                data={[
                                    { value: "oro", label: "Oro" },
                                    { value: "plata", label: "Plata" },
                                    { value: "bronce", label: "Bronce" },
                                ]}
                                error={errors.rango?.message}
                                onChange={(value) => {
                                    const selectedRango = value as "ultrap" | "plata" | "oro" | "bronce"; 
                                    setValue("rango", selectedRango);
                                }}
                            />
                            </>
                            
                        )}
                      {["vendedor", "cliente"].includes(watch("role")) && (
                       <Select
                       label="Selecciona un Admin"
                       placeholder="Elige un Admin"
                       data={admins}
                       onChange={(value) => {
                           if (value) {
                               setSelectedAdmin(value);
                               console.log("Admin seleccionado:", value);
                           } else {
                               console.log("No se seleccionó ningún admin.");
                           }
                       }}
                   />
                   

)}

                        <NumberInput
                            radius='md'
                            label="Saldo"
                            {...register("saldo", {
                                valueAsNumber: true,
                                required: watch('role') !== 'vendedor' && watch('role') !== 'master' ? 'El saldo es obligatorio' : false,
                                min: {
                                    value: 100,
                                    message: "El saldo debe ser al menos 100",
                                },
                                disabled: watch('role') === 'vendedor' || watch('role') === 'master',
                            })}
                            onChange={(value) => setValue("saldo", value || 0)}
                            max={1000000}
                            min={100}
                            error={errors.saldo?.message}
                        />

                        <Popover opened={popoverOpened} position="bottom" width="target" transition="pop">
                            <Popover.Target>
                                <div
                                    onFocusCapture={() => setPopoverOpened(true)}
                                    onBlurCapture={() => setPopoverOpened(false)}
                                >
                                    <PasswordInput
                                        radius='md'
                                        label="Contraseña"
                                        placeholder="Contraseña"
                                        {...register("password", {
                                            required: "La contraseña es obligatoria",
                                            minLength: {
                                                value: 8,
                                                message: "La contraseña debe tener al menos 8 caracteres",
                                            },
                                        })}
                                        error={errors.password?.message}
                                    />
                                </div>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <Progress color={color} value={strength} size={5} style={{ marginBottom: 10 }} />
                                <PasswordRequirement label="Incluye al menos 6 caracteres" meets={password.length > 5} />
                                {requirements.map((requirement, index) => (
                                    <PasswordRequirement key={index} label={requirement.label} meets={requirement.re.test(password)} />
                                ))}
                            </Popover.Dropdown>
                        </Popover>

                        <PasswordInput
                            label="Confirmar Contraseña"
                            radius='md'
                            {...register("confirmPassword", {
                                required: "Confirmar la contraseña es obligatorio",
                                validate: (value) =>
                                    value === password || "Las contraseñas no coinciden",
                            })}
                            error={errors.confirmPassword?.message}
                        />
                    </Stack>

                    <Group position="center" mt="md">
                        <Button type="submit">Registrar</Button>
                    </Group>
                </form>
            </Modal>

            <Group position="center">
                <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>Registrar Usuario</Button>
            </Group>
        </>
    );
}

export default Registrar;
