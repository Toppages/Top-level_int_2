import AdminBR from "./AdminBR";
import Registrar from "./Registrar/Index";
import EditAdmins from "./EditAdmins/Index";
import EditClient from "./EditClient/Index";
import DeleteUser from "./DeleteUser";
import AllRetiros from "./AllRetiros";
import EditmyClients from "./EditmyClients/Index";
import LimitesmyVend from "./LimitesmyVend/Index";
import VentasmasterG from "./VentasmasterG";
import EditUser from "./EditUser";
import VentaClientesOro from "./VentaClientesOro";
import VentaVendedores from "./VentaVendedores";
import VentaAdminClientes from "./VentaAdminClientes";
import LimitVendedores from "./LimitVendedores/Index";
import AdmincargoReports from "./AdmincargoReports";
import UserCountsDisplay from "./UserCountsDisplay/Index";
import AdministrartInventario from "./AdministrartInventario/Index";
import Generardesdepincentral from "./Generardesdepincentral/Index";
import { Group, Tabs, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconCoins, IconLayoutDashboard } from "@tabler/icons-react";
interface DashboardProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
}

function Dashboard({ user }: DashboardProps) {
    const [userRole, setUserRole] = useState<string | null>(null);


    const onBalanceUpdate = (newBalance: number) => {
        console.log('Nuevo saldo:', newBalance);
    };

    useEffect(() => {
        if (user) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/user`, {
                method: "GET",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserRole(data.role);
                })
                .catch((err) => console.error("Error al obtener el usuario:", err));
        }
    }, [user]);

    return (
        <>
            <div style={{ width: '100%', overflowX: 'hidden' }}>

                <Tabs defaultValue="Retiro">

                    <Tabs.List>
                        <Tabs.Tab value="Retiro" icon={<IconCoins size={18} />}>Retiro</Tabs.Tab>

                        {(userRole === "master" && user?.handle !== "toplevelmaster" || userRole === "admin" || (user?.rango === "oro" && userRole === "cliente")) && (
                            <Tabs.Tab value="control" icon={<IconLayoutDashboard size={18} />}>Panel de control</Tabs.Tab>
                        )}
                    </Tabs.List>


                    <Tabs.Panel value="Retiro" pt="xs">
                        {userRole === "master" ? (
                            <VentasmasterG />
                        ) : userRole === "vendedor" ? (
                            user && <VentaVendedores userHandle={user.handle} userRango={user.rango} />
                        ) : userRole === "cliente" && (user?.rango === "oro" || user?.rango === "plata") ? (
                            <VentaClientesOro userHandle={user.handle} />
                        ) : (
                            user && <VentaAdminClientes userHandle={user.handle} userRole={user.role} />
                        )}
                    </Tabs.Panel>



                    <Tabs.Panel value="control" pt="xs">

                        {userRole === "master" && user && <UserCountsDisplay token={localStorage.getItem("token")} />}

                        {(userRole === "master") && (
                            <>
                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    General
                                </Title>
                                <Group>

                                    <AllRetiros />
                                    <Registrar />
                                    <AdminBR />
                                    <AdministrartInventario navOpen={false} setActiveLink={function (): void {

                                    }} user={null} />
                                    <Generardesdepincentral />
                                    <EditUser />
                                    <DeleteUser />
                                </Group>
                                <Group>
                                    <div>

                                        <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                            Clientes
                                        </Title>
                                        <EditClient user={user} onBalanceUpdate={onBalanceUpdate} />
                                    </div>
                                    <div>

                                        <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                            Administradores
                                        </Title>
                                        <EditAdmins user={user} onBalanceUpdate={onBalanceUpdate} />
                                    </div>
                                    <div>

                                        <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                            Vendedores
                                        </Title>
                                        <LimitVendedores />
                                    </div>
                                </Group>
                            </>
                        )}
                        {(userRole === "admin") && (
                            <>
                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    General
                                </Title>
                                <AdmincargoReports user={user} />
                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    Clientes
                                </Title>
                                <EditmyClients user={user} onBalanceUpdate={onBalanceUpdate} />
                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    Vendedores
                                </Title>
                                <LimitesmyVend user={user} />
                            </>
                        )}
                        {(userRole === "cliente") && (
                            <>
                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    General
                                </Title>
                                <AdmincargoReports user={user} />

                                <Title fz="xl" mt={15} c='#0c2a85' order={5}>
                                    Vendedores
                                </Title>
                                <LimitesmyVend user={user} />
                            </>
                        )}
                    </Tabs.Panel>



                </Tabs>

            </div>
        </>
    );
}

export default Dashboard;