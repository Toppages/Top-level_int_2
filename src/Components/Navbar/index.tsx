import Logo from '../../assets/Logo TopLevel PNG.png'
import Drawer from '../Drawer';
import { Group, Card, Image } from '@mantine/core';

function Navbar({
  setActiveLink,
}: {
  setNavOpen: (open: boolean) => void;
  setActiveLink: (index: number) => void;
}) {



  return (
    <>
      <Card mx="sm" radius="md" mt={15}>
        <Group position="apart" style={{ width: "100%", background: "white" }}>
          <Drawer setActiveLink={setActiveLink} />


          <div style={{ width: 50, marginLeft: 'auto', marginRight: 'auto' }}>

            <Image
              src={Logo}
              alt="Panda"
            />
          </div>

        </Group>
      </Card>
    </>
  );
}

export default Navbar;
