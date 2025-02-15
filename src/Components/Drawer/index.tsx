import Logo from '../../assets/Logo TopLevel PNG.png';
import NavLinkItem from "../Navlink/index";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { IconReport, IconUserFilled, IconX, IconUsers } from "@tabler/icons-react";
import {
  Drawer as MantineDrawer,
  Burger,
  Divider,
  NavLink,  
  Stack,
  Image,
} from "@mantine/core";

function Drawer({ setActiveLink }: { setActiveLink: (index: number) => void }) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const isMobile = useMediaQuery("(min-width: 1000px)");

  const data = [
    // { icon: IconGauge, label: 'Dashboard' },
    // { icon: IconBuildingStore, label: 'Recarga directa' },
    { icon: IconUsers, label: 'Mayorista' },
    { icon: IconReport, label: 'Reportes' },
  ];

  const items = data.map((item, index) => (
    <NavLinkItem
      key={index}
      index={index}
      active={active}
      label={item.label}
      icon={item.icon}
      disabled={item.label === "Dashboard"}
      onClick={() => {
        setActive(index);
        setActiveLink(index);
        setOpened(false);
      }}
    />
  ));

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('apiSecret');
    setOpened(false);
    window.location.replace('/');
  };

  return (
    <>
      {!isMobile && (
        <Burger
          opened={opened}
          onClick={() => setOpened((o) => !o)}
          title={opened ? "Cerrar navegación" : "Abrir navegación"}
        />
      )}

      <MantineDrawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        size="lg"
        position="left"
        overlayOpacity={0.55}
        overlayBlur={3}
      >
        <Stack justify="space-between" style={{ height: '80vh' }}>
          <div>
            <div style={{ width: 150, marginLeft: 'auto', marginRight: 'auto' }}>
              <Image mt={-70} src={Logo} alt="Panda" />
            </div>
            {items}
          </div>

          <div>
            <Divider/>
            <NavLink
              label="User@gmail.com"
              color="indigo"
              icon={<IconUserFilled size={16} stroke={1.5} />}
              style={{
                padding: "10px 15px",
                borderRadius: "8px",
                marginBottom: "8px",
                color: "#0c2a85",
                cursor: "pointer",
              }}
              onMouseEnter={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
                e.currentTarget.style.backgroundColor = "#dbe4f3";
                e.currentTarget.style.color = "#0c2a85";
              }}
              onMouseLeave={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#0c2a85";
              }}
            />
            <NavLink
              label="Cerrar Sesión"
              onClick={handleLogout}
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
              onMouseEnter={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
                e.currentTarget.style.backgroundColor = "#dbe4f3";
                e.currentTarget.style.color = "#0c2a85";
              }}
              onMouseLeave={(e: { currentTarget: { style: { backgroundColor: string; color: string; }; }; }) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#0c2a85";
              }}
            />
          </div>
        </Stack>
      </MantineDrawer>
    </>
  );
}

export default Drawer;
