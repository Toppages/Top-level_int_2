import Logo from '../../assets/Logo TopLevel PNG.png';
import NavLinkItem from "../Navlink";
import { Stack, Image, Divider, Title, NavLink } from "@mantine/core";
import { IconGauge, IconUsers, IconReport, IconUserFilled, IconX, } from "@tabler/icons-react";

interface NavLinksProps {
    active: number;
    setActiveLink: (index: number) => void;
    handleLogout: () => void;
}

const data = [
    { icon: IconGauge, label: 'Dashboard' },
    { icon: IconUsers, label: 'Compra de pines' },
    { icon: IconReport, label: 'Reportes' },
];

function NavLinks({ active, setActiveLink, handleLogout }: NavLinksProps) {
    return (
        <Stack justify="space-between" style={{ height: '90vh' }}>
            <div>
                <Image mt={-55} src={Logo} alt="Panda" />
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
                    300$
                </Title>
                <Divider />
                <NavLink
                    mt={15}
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