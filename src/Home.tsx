import './App.css';
import Logo from './assets/Logo TopLevel PNG.png'
import TableC from './Components/TableC/Index';
import Reports from './Components/Reports';
import NavLinkItem from './Components/Navlink';
import useLazyLoad from './Hooks/useLazyLoad';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from '@mantine/hooks';
import { Card, Divider, Group, NavLink, Stack, Image } from '@mantine/core';
import { IconGauge, IconBuildingStore, IconReport, IconUserFilled, IconX } from '@tabler/icons-react';

interface HomeProps {
  navOpen: boolean;
  activeLink: number;
  setActiveLink: (index: number) => void;
}

function Home({ navOpen, activeLink, setActiveLink }: HomeProps) {
  const data = [
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconBuildingStore, label: 'Productos' },
    { icon: IconReport, label: 'Reportes' },
  ];
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  const isMobile = useMediaQuery('(max-width: 1000px)');
  const isVisible = useLazyLoad();

  const items = data.map((item, index) => (
    <NavLinkItem
      key={index}

      index={index}
      active={activeLink}
      label={item.label}
      icon={item.icon}
      disabled={item.label === 'Dashboard'}
      onClick={() => setActiveLink(index)}
    />
  ));

  const renderContent = () => {
    if (data[activeLink].label === 'Reportes') {
      return <Reports />;
    }
    return <TableC />;
  };

  return (
    <>
      <Group
        mt={15}
        mx="sm"
        style={{
          display: 'flex',
          flexDirection: 'row',
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

            <Stack justify="space-between" style={{ height: '90vh' }}>

              <div>
                <Image
                  mt={-55}
                  src={Logo}
                  alt="Panda"
                />

                {items}
              </div>

              <div>
                <Divider />
                <NavLink
                  mt={15}
                  label="User@user"
                  color="indigo"
                  icon={<IconUserFilled size={16} stroke={1.5} />}
                  style={{
                    padding: "10px 15px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    color: "#0c2a85",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dbe4f3";
                    e.currentTarget.style.color = "#0c2a85";

                  }}
                  onMouseLeave={(e) => {

                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#0c2a85";

                  }}
                />
                <NavLink
                  mt={15}
                  label="Cerrar Sesión"
                  onClick={handleLogin}
                  color="indigo"
                  icon={<IconX size={16} stroke={1.5} />}
                  active
                  style={{
                    padding: "10px 15px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    color: "#0c2a85",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dbe4f3";
                    e.currentTarget.style.color = "#0c2a85";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#0c2a85";
                  }}
                />

              </div>
            </Stack>


          </Card>
        )}

        <Card
          id="lazy-load-card"
          className={`lazy-load ${isVisible ? 'visible' : ''}`}
          radius="md"
          style={{
            flexGrow: 1,
            padding: '20px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            height: data[activeLink].label === 'Reportes' ? '95vh' : 'auto',
          }}
        >
          {renderContent()}
        </Card>

      </Group>
    </>
  );
}

export default Home;
