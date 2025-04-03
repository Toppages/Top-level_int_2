import { useState } from 'react';
import { Modal, Button, Group } from '@mantine/core';

function Generardesdepincentral() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        withCloseButton={false}
      >
      </Modal>

      <Group position="center">
        <Button onClick={() => setOpened(true)}>Pin central</Button>
      </Group>
    </>
  );
}


export default Generardesdepincentral;