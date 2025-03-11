import Logo from '../../assets/Logo TopLevel PNG.png';
import NavLinkItem from "../Navlink";
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { UserData, NavLinksProps } from "../../types/types";
import { fetchTotalSaldos, fetchUserData, handleLogout } from "../../utils/utils";
import { Stack, Image, Divider, Title, NavLink, Group, Loader } from "@mantine/core";
import { IconGauge, IconWallet, IconArchive, IconUsers, IconReport, IconUserFilled, IconX } from "@tabler/icons-react";

const data = [
    { icon: IconGauge, label: 'CONTROL DE RETIROS' },
    { icon: IconUsers, label: 'COMPRA DE PINES' },
    { icon: IconReport, label: 'REPORTES DE RETIROS' },
    { icon: IconWallet, label: 'BALANCE' },
    { icon: IconArchive, label: 'INVENTARIO' },
];

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
    const [userData, setUserData] = useState<UserData | null>(null);
    const [totalSaldos, setTotalSaldos] = useState<number | null>(null);

    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    useEffect(() => {
        fetchUserData(setUserData);
        fetchTotalSaldos(setTotalSaldos);
        const intervalId = setInterval(() => fetchUserData(setUserData), 5000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <Stack justify="space-between" style={{ height: isMobile ? '85vh' : '90vh' }}>
            <div>
                <div style={{ width: 150, marginLeft: 'auto', marginRight: 'auto' }}>
                    <Image mt={-50} src={Logo} alt="Panda" />
                </div>
                {data.map((item, index) => (
                    <NavLinkItem
                        key={index}
                        index={index}
                        active={active}
                        label={item.label}
                        icon={item.icon}
                        onClick={() => setActiveLink(index)}
                    />
                ))}
            </div>
            <div>
                {userData && userData.role === 'master' && (
                    <>
                        <Title ta="center" c='#0c2a85' order={6}>
                            Saldo Correracional: {userData ? `${userData.saldo} USD` : 'Saldo no disponible'}
                        </Title>
                        {!(totalSaldos && userData) ? (
  <Loader color="indigo" variant="bars" />
) : (
  <Title ta="center" c="#0c2a85" order={6}>
    Saldo De trabajo: {`${(userData.saldo - totalSaldos).toFixed(2)} USD`}
  </Title>
)}

                    </>
                )}

                {!userData || userData.role !== 'master' && (
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
                    label={userData ? userData.email : 'User@gmail.com'}
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
                    mt={5}
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
