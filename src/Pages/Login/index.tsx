import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Text, TextInput, PasswordInput, Button, Stack, Image } from '@mantine/core';
import Logo from '../../assets/Logo TopLevel PNG.png';
import './index.css';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
      
        navigate('/home');
    };

    return (
        <div className="login-background">
            <Card shadow="md" p="lg" radius="md" style={{ width: 350, textAlign: 'center', margin: 'auto' }}>
                <Text size="lg" mb={15}>Bienvenido</Text>
                <div style={{ width: 150, margin: 'auto' }}>
                    <Image mt={-55} src={Logo} alt="Logo" />
                </div>
                <Stack mt="lg" spacing="sm">
                    <TextInput
                        label="Usuario"
                        placeholder="Ingrese su usuario"
                    />
                    <PasswordInput
                        label="Clave"
                        placeholder="Ingresa tu clave"
                    />
                    <Button className='button' fullWidth mt="md" onClick={handleLogin}>
                        Iniciar Sesión
                    </Button>
                </Stack>
            </Card>
        </div>
    );
};

export default Login;
