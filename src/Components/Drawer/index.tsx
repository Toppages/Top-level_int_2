import NavLinks from '../NavLinksList';
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { Drawer as MantineDrawer, Burger } from "@mantine/core";

function Drawer({ setActiveLink }: { setActiveLink: (index: number) => void }) {

  const [opened, setOpened] = useState(false);
  const [activeLink, setActive] = useState(0);
  const isMobile = useMediaQuery("(min-width: 1000px)");

  const handleSelect = (index: number) => {
    setActive(index);
    setActiveLink(index);
    setOpened(false);
  };

  const handleLogout = () => {
    setOpened(false);
    window.location.replace('/');
  };

  return (
    <>
      {!isMobile && (
        <Burger opened={opened} onClick={() => setOpened((o) => !o)} title={opened ? "Cerrar navegación" : "Abrir navegación"} />
      )}
      <MantineDrawer opened={opened} onClose={() => setOpened(false)} padding="xl" size="lg" position="left">
        <NavLinks active={activeLink} setActiveLink={handleSelect} handleLogout={handleLogout} />
      </MantineDrawer>
    </>
  );
}


export default Drawer;
