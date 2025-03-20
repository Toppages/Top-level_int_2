import { useState } from 'react';
import { Modal, Button, Group } from '@mantine/core';
import TableM from '../../TableM/Index';

interface HomeProps {
    navOpen: boolean;
    setActiveLink: (index: number) => void;
    user: {
      _id: string;
      name: string;
      email: string;
      handle: string;
      role: string;
      saldo: number;
      rango: string;
    } | null;
  }
  

function AdministrartInventario({ user }: HomeProps) {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        withCloseButton={false}
      >
        <TableM user={user} />
      </Modal>

      <Group position="center">
        <Button style={{ background: '#0c2a85' }} onClick={() => setOpened(true)}>
        Administrar Inventario
        </Button>
      </Group>
    </>
  );
}

export default AdministrartInventario;