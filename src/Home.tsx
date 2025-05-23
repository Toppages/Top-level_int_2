import './App.css';
import Reports from './Components/Reports';
import NavLinks from './Components/NavLinksList';
import Dashboard from './Components/Dashboard/Index';
import Inventario from './Components/Inventario';
import BalanceReports from './Components/BalanceReports';
import { Toaster } from 'sonner';
import { Card, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import TableC from './Components/TableC/Index';

interface HomeProps {
  navOpen: boolean;
  activeLink: number;
  setActiveLink: (index: number) => void;
  user: {
    _id: string;
    name: string;
    email: string;
    handle: string;
    role: string;
    purchaseLimits: any;
    saldo: number;
    rango: string;
    admin: string;
  } | null;
}

function Home({ navOpen, activeLink, setActiveLink, user }: HomeProps) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.replace('/');
  };

  const isMobile = useMediaQuery('(max-width: 1000px)');

  const renderContent = () => {
    switch (activeLink) {
      case 0:
        return <Dashboard user={user} />;
      case 1:
        return  <TableC user={user} />;
      case 2:
        return <Reports user={user} />;
      case 3:
        return <BalanceReports user={user} />;
      case 4:
        return <Inventario  />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <>
      <Toaster richColors position="bottom-right" />
      <Group
        mt={15}
        mx="sm"
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '0.8fr 3fr',
          gap: 15,
        }}
      >
        {!isMobile && (
          <Card
            style={{
              padding: '20px',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              height: '95vh',
              display: navOpen ? 'block' : 'none',
            }}
            radius="md"
          >
            <NavLinks active={activeLink} setActiveLink={setActiveLink} handleLogout={handleLogout} />
          </Card>
        )}

        <Card
          style={{
            padding: '20px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            height:    '100%',
            maxWidth: '100%',
          }}
        >
          {renderContent()}
        </Card>
      </Group>
    </>
  );
}

export default Home;
