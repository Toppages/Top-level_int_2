import './App.css';
import TableM from './Components/TableM/Index';
import Reports from './Components/Reports';
import NavLinks from './Components/NavLinksList';
import Dashboard from './Components/Dashboard/Index';
import { useMediaQuery } from '@mantine/hooks';
import { Card, Group, ScrollArea } from '@mantine/core';
import { Toaster } from 'sonner';

interface HomeProps {
  navOpen: boolean;
  activeLink: number;
  setActiveLink: (index: number) => void;
}

function Home({ navOpen, activeLink, setActiveLink }: HomeProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/');
  };

  const isMobile = useMediaQuery('(max-width: 1000px)');  // Agregar condición para dispositivos móviles

  const renderContent = () => {
    switch (activeLink) {
      case 0:
        return <Dashboard />;
      case 1:
        return <TableM />;
      case 2:
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <Group
        mt={15}
        mx="sm"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',  // Cambiar dirección de los elementos en pantallas móviles
          alignItems: 'flex-start',
          gap: 15,
        }}
      >
        {!isMobile && (
          <Card
            style={{
              width: 250,
              height: '95vh',
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              display: navOpen ? 'block' : 'none',
            }}
            radius="md"
          >
            <NavLinks active={activeLink} setActiveLink={setActiveLink} handleLogout={handleLogout} />
          </Card>
        )}

        <ScrollArea style={{ height: '95vh', width: '80%' }}>

          <Card
            style={{
              flexGrow: 1,
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              height: activeLink === 2 ? '95vh' : 'auto',
              maxWidth: '100%', // Asegura que el Card se adapte al ancho
            }}
          >
            {renderContent()}
          </Card>
        </ScrollArea>

      </Group>
    </>
  );
}

export default Home;
