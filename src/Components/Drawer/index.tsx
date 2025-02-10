import Logo from '../../assets/Logo TopLevel PNG.png'
import NavLinkItem from "../Navlink/index";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { IconGauge, IconBuildingStore, IconReport, IconUserFilled, IconX } from "@tabler/icons-react";
import {
  Drawer as MantineDrawer,
  Burger,
  Divider,
  NavLink,
  Stack,
  Image,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

function Drawer({ setActiveLink }: { setActiveLink: (index: number) => void }) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(1);
  const isMobile = useMediaQuery("(min-width: 1000px)");

  const data = [
    { icon: IconGauge, label: "Dashboard" },
    { icon: IconBuildingStore, label: "Productos" },
    { icon: IconReport, label: "Reportes" },
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
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
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
        <Stack justify="space-between" style={{ height: '90vh' }}>

          <div>

            <div style={{ width: 150, marginLeft: 'auto', marginRight: 'auto' }}>
              <Image
                mt={-55}
                src={Logo}
                alt="Panda"
              />
            </div>

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
      </MantineDrawer>
    </>
  );
}

export default Drawer;