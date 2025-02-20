import { useEffect, useState } from "react";
import Logo from '../../assets/Logo TopLevel PNG.png';
import NavLinkItem from "../Navlink";
import { Stack, Image, Divider, Title, NavLink } from "@mantine/core";
import { IconGauge, IconUsers, IconReport, IconUserFilled, IconX } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserData, NavLinksProps } from "../../types/types";


const data = [
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconUsers, label: 'Compra de pines' },
    { icon: IconReport, label: 'Reportes' },
];

function NavLinks({ active, setActiveLink }: NavLinksProps) {
    const [userData, setUserData] = useState<UserData | null>(null);

    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1000px)");

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.setItem('isAuthenticated', 'false');
        navigate('/');
    };

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await axios.get('http://localhost:4000/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error al obtener datos del usuario:', error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
        const intervalId = setInterval(fetchUserData, 5000);
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
                <Title ta="center" c="#0c2a85" order={3}>
                    {userData ? `${userData.saldo}$` : 'Saldo no disponible'}
                </Title>

                <Divider />
                <NavLink
                    mt={15}
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
                    mt={15}
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
    );
}

export default NavLinks;