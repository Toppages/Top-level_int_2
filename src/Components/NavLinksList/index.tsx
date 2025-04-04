import Logo from '../../assets/Logo TopLevel PNG.png';
import NavLinkItem from "../Navlink";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { UserData, NavLinksProps } from "../../types/types";
import { fetchTotalSaldos, fetchUserData, handleLogout } from "../../utils/utils";
import { Stack, Image, Divider, Title, NavLink, Group, Loader, Text, ActionIcon, Modal, Accordion, ScrollArea } from "@mantine/core";
import { IconGauge, IconWallet, IconArchive, IconUsers, IconReport, IconUserFilled, IconX, IconInfoCircle } from "@tabler/icons-react";


const getSaldoColor = (rango: string) => {
    switch (rango) {
        case 'ultrap':
            return '#0c2a85';
        case 'oro':
            return '#FFD700';
        case 'plata':
            return '#C0C0C0';
        case 'bronce':
            return '#cd7f32';
        default:
            return '#000000';
    }
};

function NavLinks({ active, setActiveLink }: NavLinksProps) {
    const [opened, setOpened] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [adminBalance, setAdminBalance] = useState<{ saldo: number; inventarioSaldo: number } | null>(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/balance`);
                const data = await response.json();
                if (response.ok) {
                    setAdminBalance({
                        saldo: data.saldo,
                        inventarioSaldo: data.inventarioSaldo,
                    });
                }
            } catch (error) {
                console.error('Error fetching balance:', error);
            }
        };
    
        fetchBalance();
    
        const intervalId = setInterval(fetchBalance, 5000);
        return () => clearInterval(intervalId);
    }, []);
    
    const [totalSaldos, setTotalSaldos] = useState<{
        totalSaldoAdmins: number;
        totalSaldoClientes: number;
        admins: { handle: string; correo: string; saldo: number }[]; 
        clientes: { handle: string; correo: string; saldo: number }[];
    } | null>(null);

    const data = [
        { icon: IconGauge, label: 'CONTROL GENERAL' },
        { icon: IconUsers, label:  'RECARGA DIRECTA' },
        { icon: IconReport, label: 'CONTROL DE VENTAS' },
        { icon: IconWallet, label: 'REPORTES DE INGRESO' },
        { icon: IconArchive, label: 'PIN CENTRAL' },
    ];
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    useEffect(() => {
        fetchUserData(setUserData);
        fetchTotalSaldos(setTotalSaldos);

        const intervalId = setInterval(() => {
            fetchUserData(setUserData);
            fetchTotalSaldos(setTotalSaldos);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Stack justify="space-between" style={{ height: isMobile ? '85vh' : '80vh' }}>
            <div>
                <Modal
                    radius='lg'
                    opened={opened}
                    onClose={() => setOpened(false)}
                    withCloseButton={false}
                >
                    {totalSaldos ? (
                        <>
                            <Title fz="xl" ta="center" c='#0c2a85' order={5}>
                                Total Saldo de Administradores: {totalSaldos.totalSaldoAdmins} USD
                            </Title>

                            <Title fz="xl" mt={15} ta="center" c='#0c2a85' order={5}>
                                Total Saldo de Clientes: {totalSaldos.totalSaldoClientes} USD
                            </Title>

                            <Accordion mt={15} variant="separated">
                                <Accordion.Item value="Administradores">
                                    <Accordion.Control>
                                        <Title ta="center" c='#0c2a85' order={6}>
                                            Detalles de Administradores:
                                        </Title>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea style={{ height: 200 }}>
                                            {totalSaldos.admins.map((admin, index) => (
                                                <div key={index}>
                                                    <Group position='apart'>
                                                        <p>{admin.handle} {admin.correo}</p>
                                                        <Text c="teal.4">{admin.saldo} USD</Text>
                                                    </Group>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </Accordion.Panel>
                                </Accordion.Item>

                                <Accordion.Item value="Clientes">
                                    <Accordion.Control>
                                        <Title ta="center" c='#0c2a85' order={6}>
                                            Detalles de Clientes:
                                        </Title>
                                    </Accordion.Control>
                                    <Accordion.Panel>
                                        <ScrollArea style={{ height: 200 }}>
                                            {totalSaldos.clientes.map((cliente, index) => (
                                                <div key={index}>
                                                    <Group position='apart'>
                                                        <p>{cliente.handle} {cliente.correo}</p>
                                                        <Text c="teal.4">{cliente.saldo} USD</Text>
                                                    </Group>
                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </>
                    ) : (
                        <Loader color="indigo" variant="bars" />
                    )}
                </Modal>
                <div style={{ width: 150, marginLeft: 'auto', marginRight: 'auto' }}>
                    <Image mt={-50} src={Logo} alt="Panda" />
                </div>
                {data.map((item, index) => {
                    if (item.label === 'REPORTES DE INGRESO' && userData?.role === 'vendedor') {
                        return null;
                    }
                    if (userData?.handle === 'toplevelmaster' && item.label !== 'CONTROL GENERAL') {
                        return null;
                    }
                    if (item.label === 'PIN CENTRAL' && userData?.role !== 'master') {
                        return null;
                    }
                    return (
                        <NavLinkItem
                            key={index}
                            index={index}
                            active={active}
                            label={item.label}
                            icon={item.icon}
                            onClick={() => setActiveLink(index)}
                        />
                    );
                })}
            </div>
            <div>
            {userData && userData.role === 'master' && userData.handle !== 'toplevelmaster' && (
                    <>
                        <Title  c='#0c2a85' order={6}>
                            PIN CENTRAL:  {adminBalance ? `${adminBalance.saldo.toFixed(3)} USD` : 'Saldo no disponible'}
                        </Title>
                        {!(totalSaldos && userData) ? (
                            <Loader color="indigo" variant="bars" />
                        ) : (
                            <Group>
                                <Title  c="#0c2a85" order={6}>
                                INVENTARIO:  {adminBalance ? `${adminBalance.inventarioSaldo.toFixed(3)} USD` : 'Saldo no disponible'}
                                </Title>

                                <ActionIcon ml={-17} color="indigo" size="xs" onClick={() => setOpened(true)}>
                                    <IconInfoCircle size={26} />
                                </ActionIcon>
                            </Group>
                        )}
                    </>
                )}

                {!userData || userData.role !== 'master' && userData.role !== 'vendedor' && (
                    <>
                        <Group ml={5} mr={5} position='apart'>
                            <Title ta="center" c='#0c2a85' order={5}>
                                Saldo:
                            </Title>
                            <Title ta="center" c={userData ? getSaldoColor(userData.rango) : '#000000'} order={6}>
                                {userData ? `${userData.saldo} USD` : 'Saldo no disponible'}
                            </Title>
                        </Group>
                    </>
                )}

                <Divider />
                <NavLink
                mt={5}
                label={userData ? `${userData.handle} (${userData.role || 'No role'})` : 'User@gmail.com'}

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
                    onClick={() => handleLogout(navigate)}
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
    );
}

export default NavLinks;
