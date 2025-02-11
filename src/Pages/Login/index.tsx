import './index.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo TopLevel PNG.png';
import { Card, Text, TextInput, PasswordInput, Button, Stack, Image } from '@mantine/core';

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/Top-level_int_2/home');
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
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
          />
          
          <Button
            className='button'
            fullWidth
            mt="md"
            onClick={handleLogin}
          >
            Iniciar Sesión
          </Button>
        </Stack>
      </Card>
    </div>
  );
}

export default Login;
