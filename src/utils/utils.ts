import axios from 'axios';
import { toast } from 'sonner';
import { Product } from '../types/types';

export const fetchUserRole = async (
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>,
) => {
  try {
    const response = await fetch("http://localhost:4000/user", {
      method: "GET",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const data = await response.json();
    setUserRole(data.role);
  } catch (err) {
    toast.error('Hubo un problema al obtener el rol del usuario.');
  }
};

export const handleSearchChange = (
  query: string,
  allReports: any[],
  setFilteredReports: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const filtered = allReports.filter((report) =>
    report.productName.toLowerCase().includes(query.toLowerCase()) ||
    report.user.handle.toLowerCase().includes(query.toLowerCase())
  );
  setFilteredReports(filtered);
};
export const fetchReports = async (
  userHandle: string,
  userRole: string,
  setAllReports: React.Dispatch<React.SetStateAction<any[]>>,
  setFilteredReports: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!userHandle) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    setError('No se encontró el token. Inicia sesión nuevamente.');
    return;
  }
  
  try {
    const url = userRole === 'master'
    ? 'http://localhost:4000/sales'
    : `http://localhost:4000/sales/user/${userHandle}`;
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setAllReports(response.data);
    setFilteredReports(response.data);
    toast.success('Reportes cargados exitosamente');
    
  } catch (err) {
    toast.error('Hubo un problema al obtener los reportes.');
  }
};

export const fetchTransactions = async (
  userHandle: string,
  userRole: string,
  setAllTransactions: React.Dispatch<React.SetStateAction<any[]>>,
  setFilteredTransactions: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!userHandle) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    setError('No se encontró el token. Inicia sesión nuevamente.');
    return;
  }
  
  try {
    let url = '';
    if (userRole === 'master') {
      // Si el rol es 'master', obtenemos todas las transacciones
      url = 'http://localhost:4000/transactions';
    } else {
      // Si no es 'master', obtenemos transacciones por el handle del usuario
      url = `http://localhost:4000/transactions/${userHandle}`;
    }
    
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setAllTransactions(response.data);
    setFilteredTransactions(response.data);
    toast.success('Transacciones cargadas exitosamente');
  } catch (err) {
    setError('Hubo un problema al obtener las transacciones.');
    toast.error('Hubo un problema al obtener las transacciones.');
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export const handlePinClick = (
  report: any,
  setPines: React.Dispatch<React.SetStateAction<any[]>>,
  setPinsModalOpened: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedReport: React.Dispatch<React.SetStateAction<any | null>>
) => {
  setPines(report.pins);
  setSelectedReport(report);
  setPinsModalOpened(true);
};

export const copyToClipboard = (text: string, isAllPins: boolean = false) => {
  navigator.clipboard.writeText(text)
  .then(() => {
    if (isAllPins) {
      toast.success('Todos los pines copiados al portapapeles');
    } else {
      toast.success('Pin copiado al portapapeles');
    }
  })
  .catch(() => {
    toast.error('Error al copiar al portapapeles');
  });
};

export const fetchProductsFromAPI = async (setFetchedProducts: React.Dispatch<React.SetStateAction<Product[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setLoading(true);
  try {
    const response = await axios.get('http://localhost:4000/products');
    if (response.status === 200) {
      // Filtrar los productos donde product_group sea "Free Fire Latam"
      const filteredProducts = response.data.filter((product: Product) => product.product_group === "Free Fire Latam");
      setFetchedProducts(filteredProducts);
    }
  } catch (error) {
    toast.error('Hubo un problema al obtener los productos');
  } finally {
    setLoading(false);
  }
};


export const fetchUserData = async (
  setUserData: React.Dispatch<React.SetStateAction<any | null>>,
) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await axios.get('http://localhost:4000/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(response.data);
    } catch (error) {
      toast.error('Error al obtener los datos del usuario');
    }
  }
};
export const fetchTotalSaldos = async (
  setTotalSaldos: React.Dispatch<React.SetStateAction<number | null>>,
) => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await axios.get('http://localhost:4000/total-saldos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTotalSaldos(response.data.totalSaldo); 
    } catch (error) {
      toast.error('Error al obtener la suma de saldos');
    }
  }
};

export const handleLogout = (navigate: Function) => {
  localStorage.removeItem('token');
  localStorage.setItem('isAuthenticated', 'false');
  navigate('/');
};

export const updateProductAPI = async (product: Product) => {
  
  if (!product._id) {
    toast.error('El ID del producto no fue proporcionado');
    throw new Error('ID del producto no proporcionado');
  }
  
  try {
    const response = await fetch(`http://localhost:4000/products/${product._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_oro: product.price_oro,
        price_plata: product.price_plata,
        price_bronce: product.price_bronce,
        available: product.available,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Producto actualizado exitosamente');
      return data;
    } else {
      toast.error(data.error || 'Error al actualizar el producto');
      throw new Error(data.error || 'Error al actualizar el producto');
    }
  } catch (error) {
    toast.error('Hubo un problema al actualizar el producto');
    throw error;
  }
};

export const getSalesByDayOfWeek = (sales: any[]) => {
  const weekSales: Record<"Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo", { count: number, totalPrice: number }> = {
      "Lunes": { count: 0, totalPrice: 0 },
      "Martes": { count: 0, totalPrice: 0 },
      "Miércoles": { count: 0, totalPrice: 0 },
      "Jueves": { count: 0, totalPrice: 0 },
      "Viernes": { count: 0, totalPrice: 0 },
      "Sábado": { count: 0, totalPrice: 0 },
      "Domingo": { count: 0, totalPrice: 0 },
  };

  sales.forEach((sale: any) => {
      const saleDate = new Date(sale.created_at);
      const dayNames: Array<keyof typeof weekSales> = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const dayName = dayNames[saleDate.getDay()];

      weekSales[dayName].count++;
      weekSales[dayName].totalPrice += sale.totalPrice;
  });

  return weekSales;
};