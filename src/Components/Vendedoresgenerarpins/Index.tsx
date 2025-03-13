import { Title, Card, Text, Group, Badge, ScrollArea, Button } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { PurchaseLimit, Report, ReportSummary } from '../../types/types';
import { useMediaQuery } from "@mantine/hooks";
import axios from 'axios';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { fetchUserData } from '../../utils/utils';
import { toast } from 'sonner';

const fetchReports = async (
    userHandle: string,
    userRole: string,
    setError: React.Dispatch<React.SetStateAction<string | null>>,
    setReportSummary: React.Dispatch<React.SetStateAction<ReportSummary | null>>
) => {
    if (!userHandle) return;

    const token = localStorage.getItem('token');
    if (!token) {
        setError('No se encontró el token. Inicia sesión nuevamente.');
        return;
    }

    try {
        const url = userRole === 'master'
            ? `${import.meta.env.VITE_API_BASE_URL}/sales`
            : `${import.meta.env.VITE_API_BASE_URL}/sales/user/${userHandle}`;

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const reports: Report[] = response.data;

        let totalKeys = 0;
        let usedKeys = 0;
        const productSummary: { [key: string]: { total: number; unused: number } } = {};

        reports.forEach(report => {
            report.pins.forEach(pin => {
                totalKeys++;
                if (pin.usado) {
                    usedKeys++;
                }
                if (!productSummary[pin.productName]) {
                    productSummary[pin.productName] = { total: 0, unused: 0 };
                }
                productSummary[pin.productName].total++;
                if (!pin.usado) {
                    productSummary[pin.productName].unused++;
                }
            });
        });

        const summary: ReportSummary = {
            totalKeys,
            usedKeys,
            unusedKeys: totalKeys - usedKeys,
            productSummary,
        };

        setReportSummary(summary);
    } catch (err) {
        console.error("Error fetching reports:", err);
    }
};

function Vendedoresgenerarpins() {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [userData, setUserData] = useState<any | null>(null);
    const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthorizing, setIsAuthorizing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(0);

    const isSmallScreen = useMediaQuery('(max-width: 768px)');
    const maxHeight = isSmallScreen ? windowHeight * 0.9 : windowHeight - 70;

    useEffect(() => {
        const handleResize = () => setWindowHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
    
        fetchUserData(setUserData);
        const intervalId = setInterval(() => {
            fetchUserData(setUserData);
        }, 5000); 
    
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(intervalId); 
        };
    }, []);
    

    useEffect(() => {
        if (userData) {
            const { handle, rango } = userData;
            fetchReports(handle, rango, setError, setReportSummary);
        }
    }, [userData]);

    const handleAuthorize = async () => {
        if (!selectedProduct || !userData) {
            console.error("Producto no seleccionado o datos del usuario no disponibles.");
            return;
        }

        const userPrice = userData?.purchaseLimits?.[selectedProduct.product]?.price || 0;
        console.log("Precio del producto:", userPrice);

        setIsAuthorizing(true);

        const apiKey = import.meta.env.VITE_API_KEY;
        const apiSecret = import.meta.env.VITE_API_SECRET;

        if (!apiKey || !apiSecret) {
            setIsAuthorizing(false);
            return;
        }

        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const url = 'https://pincentral.baul.pro/api/pins/authorize';
        const verb = "POST";
        const route = "/api/pins/authorize";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const chunks = Math.ceil(quantity / 10);
        let allCapturedPins: string[] = [];

        for (let i = 0; i < chunks; i++) {
            const batchQuantity = i === chunks - 1 ? quantity % 10 : 10;
            const body = {
                product: selectedProduct.product,
                quantity: batchQuantity,
                order_id: moment().format("YYYYMMDD_HHmmss") + `_${i}`,
            };

            const jsonBody = JSON.stringify(body);
            const hmacData = `${verb}${routeForHmac}${date}${jsonBody}`;
            const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
            const authorizationHeader = `${apiKey}:${hmacSignature}`;

            try {
                const response = await axios.post(url, body, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Date': date,
                        'Authorization': authorizationHeader
                    }
                });

                if (response.status === 200 && response.data.status === "authorized") {
                    const captureResponse = await handleCapture(response.data.id);
                    allCapturedPins = [...allCapturedPins, ...captureResponse];
                } else {
                    console.error("Error en la solicitud de autorización:");
                }
            } catch (error) {
                console.error("Error en la solicitud de autorización:", error);
            }
        }

        if (allCapturedPins.length > 0) {
            sendSaleToBackend(allCapturedPins, userPrice);
        }

        setIsAuthorizing(false);
    };

    const handleCapture = async (playerId: string) => {
        if (!playerId || !selectedProduct) {
            setIsAuthorizing(false);
            return [];
        }

        const apiKey = import.meta.env.VITE_API_KEY;
        const apiSecret = import.meta.env.VITE_API_SECRET;

        if (!apiKey || !apiSecret) {
            console.error("Error en la solicitud de captura");
            setIsAuthorizing(false);
            return [];
        }

        const date = moment().utc().format("YYYY-MM-DDTHH:mm:ss[Z]");
        const captureUrl = 'https://pincentral.baul.pro/api/pins/capture';
        const captureBody = { id: playerId };

        const jsonBody = JSON.stringify(captureBody);
        const verb = "POST";
        const route = "/api/pins/capture";
        const routeForHmac = route.startsWith("/") ? route.substring(1) : route;

        const hmacData = `${verb}${routeForHmac}${date}${jsonBody}`;
        const hmacSignature = CryptoJS.HmacSHA256(hmacData, apiSecret).toString(CryptoJS.enc.Hex);
        const authorizationHeader = `${apiKey}:${hmacSignature}`;

        try {
            const response = await axios.post(captureUrl, captureBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Date': date,
                    'Authorization': authorizationHeader
                }
            });

            if (response.status === 200 && response.data.status === "captured") {
                return response.data.pins.map((pin: { key: string }) => pin.key);
            } else {
                console.error("Error en la solicitud de captura:");
            }
        } catch (error) {
            console.error("Error en la solicitud de captura:", error);
        } finally {
            setIsAuthorizing(false);
        }

        return [];
    };

    const sendSaleToBackend = async (pins: string[], userPrice: number) => {
        try {
            const totalPrice = userPrice * quantity;
            const totalOriginalPrice = userPrice * quantity;

            const productLimit = userData?.purchaseLimits?.[selectedProduct?.product]?.limit || 0;

            const saleData = {
                quantity,
                product: selectedProduct?.product,
                productName: selectedProduct?.name,
                price: userPrice,
                totalPrice: totalPrice.toFixed(2),
                totalOriginalPrice: totalOriginalPrice.toFixed(2),
                status: "captured",
                order_id: moment().format("YYYYMMDD_HHmmss"),
                user: userData ? {
                    id: userData._id,
                    handle: userData.handle,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    saldo: userData.saldo
                } : null,
                pins: pins.map(pin => ({ serial: "", key: pin })),
                purchaseLimit: productLimit
            };

            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/sales`, saleData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                toast.success("Venta registrada con éxito");
                const updatedLimits = response.data.purchaseLimits;
                console.log("Límites de compra actualizados: ", updatedLimits);
            } else {
                toast.error("Error al registrar la venta");

            }
        } catch (error) {
            console.error("Error al enviar la venta al backend:", error);
        }
    };

    return (
        <>
            {error && <Text color="red">{error}</Text>}

            {userData ? (
                <>
                    <Title order={3}>Productos disponibles</Title>
                    <Text fz="lg">Seleccione un producto para generar un código</Text>
                    <ScrollArea style={{ height: maxHeight - 70 }}>
                        {userData.purchaseLimits && Object.keys(userData.purchaseLimits).length > 0 ? (
                            Object.entries(userData.purchaseLimits)
                                .filter(([_, limitData]) => (limitData as PurchaseLimit).limit > 0)
                                .map(([code, limitData]) => {
                                    const typedLimitData = limitData as PurchaseLimit;
                                    return (
                                        <Card key={code} shadow="xs" padding="md" radius="sm" withBorder mt="sm">
                                            <Group position='apart'>
                                                <div>
                                                    <Text>{typedLimitData.name}</Text>
                                                    <Badge c='black' color="gray">Limite de hoy: {typedLimitData.limit}</Badge>
                                                </div>

                                                <div>
                                                    {reportSummary && reportSummary.productSummary[typedLimitData.name] ? (
                                                        <Text fz="sm">
                                                            Pines sin usar: {reportSummary.productSummary[typedLimitData.name]?.unused || 0}
                                                        </Text>
                                                    ) : (
                                                        <Text fz="sm">Pines sin usar: 0</Text>
                                                    )}
                                                </div>
                                                <Group>
                                                <Button
    onClick={() => {
        toast("Registrando venta...");
        setSelectedProduct({
            product: code,
            name: typedLimitData.name
        });
        setQuantity(typedLimitData.limit);
        handleAuthorize();
    }}
    style={{
        background: (reportSummary?.productSummary[typedLimitData.name]?.unused ?? 0) >= typedLimitData.limit ? 'gray' : '#0c2a85',
    }}
    radius="xl"
    size="sm"
    rightIcon={<IconShoppingCart />}
    disabled={(reportSummary?.productSummary?.[typedLimitData.name]?.unused ?? 0) >= typedLimitData.limit}
>
    Generar
</Button>

                                                </Group>
                                            </Group>
                                        </Card>
                                    );
                                })
                        ) : (
                            <Text>No hay límites de compra asignados.</Text>
                        )}

                    </ScrollArea>
                </>
            ) : (
                <Text>No hay información del usuario disponible.</Text>
            )}
        </>
    );
}

export default Vendedoresgenerarpins;