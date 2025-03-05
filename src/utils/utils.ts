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
  userId: string,
  userRole: string,
  setAllTransactions: React.Dispatch<React.SetStateAction<any[]>>,
  setFilteredTransactions: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!userId) return;

  const token = localStorage.getItem('token');
  if (!token) {
    setError('No se encontró el token. Inicia sesión nuevamente.');
    return;
  }

  try {
    let url = '';
    if (userRole === 'master') {
      url = 'http://localhost:4000/transactions';
    } else {
      url = `http://localhost:4000/transactions/${userId}`;
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


export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success('Pin copiado al portapapeles');
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
      setFetchedProducts(response.data);
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