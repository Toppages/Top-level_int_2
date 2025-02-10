import './index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo TopLevel PNG.png'
import { Card, Text, TextInput, PasswordInput, Button, Stack, Image } from '@mantine/core';
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('https://proxy.paginaswebstop.workers.dev/auth', {
        identifier: username,
        secret: password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (data.isAuthenticated) {
        localStorage.setItem('accessToken', data.accessToken);
        navigate('/Home');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      setError('Error de autenticación, por favor intente de nuevo');
      console.error('Error de autenticación:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <Card
        shadow="md"
        p="lg"
        radius="md"
        style={{ width: 350, textAlign: 'center', marginLeft: 'auto', marginRight: 'auto' }}
      >
        <Text size="lg" mb={15}>
          Bienvenido
        </Text>
        <div style={{ width: 150, marginLeft: 'auto', marginRight: 'auto' }}>
          <Image
            mt={-55}
            src={Logo}
            alt="Logo"
          />
        </div>

        <Stack mt="lg" spacing="sm">
          <TextInput
            label="Usuario"
            placeholder="Tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Text color="red">{error}</Text>}
          <Button
            className='button'
            fullWidth
            mt="md"
            onClick={handleLogin}
            loading={loading}
          >
            Iniciar Sesión
          </Button>
        </Stack>
      </Card>
    </div>
  );
}

export default Login;
