import './index.css';
import Logo from '../../assets/Logo TopLevel PNG.png';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, Text, TextInput, PasswordInput, Button, Stack, Image, Alert } from '@mantine/core';
import axios from 'axios';
import { toast } from 'sonner';

interface ILoginFormInputs {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm<ILoginFormInputs>();

    const onSubmit = async (data: ILoginFormInputs) => {
        try {
            const response = await axios.post('http://localhost:4000/auth/login', data);

            console.log('Respuesta del backend:', response.data);

            const token = response.data;
            if (token) {
                localStorage.setItem('token', token);
                toast.success('Inicio de sesión exitoso');
                navigate('/home');
            } else {
                toast.error('No se recibió el token');
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.error || error.response.data.message || 'Error desconocido';
                toast.error(errorMessage);
            } else {
                toast.error('Error desconocido: ' + (error instanceof Error ? error.message : 'No se pudo determinar el error.'));
            }
        }
    };



    return (
        <div className="login-background">
            <Card shadow="md" p="lg" radius="md" style={{ width: 350, textAlign: 'center', margin: 'auto' }}>
                <Text size="lg" mb={15}>Bienvenido</Text>
                <div style={{ width: 150, margin: 'auto' }}>
                    <Image mt={-55} src={Logo} alt="Logo" />
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack mt="lg" spacing="sm">
                        <TextInput
                            label="Email"
                            placeholder="Ingrese su email"
                            {...register('email', {
                                required: 'El email es obligatorio',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'El email no es válido'
                                }
                            })}
                        />
                        {errors.email && (
                            <Alert color="red" mt="md">
                                <Text c="red">{errors.email.message}</Text>
                            </Alert>
                        )}

                        <PasswordInput
                            label="Clave"
                            placeholder="Ingresa tu clave"
                            {...register('password', { required: 'La clave es obligatoria' })}
                        />
                        {errors.password && (
                            <Alert color="red" mt="md">
                                <Text c="red">{errors.password.message}</Text>
                            </Alert>
                        )}

                        <Button className="button" fullWidth mt="md" type="submit">
                            Iniciar Sesión
                        </Button>
                    </Stack>
                </form>
            </Card>
        </div>
    );
};

export default Login;
