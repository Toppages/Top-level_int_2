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
  userId: string,
  userRole: string,
  setAllReports: React.Dispatch<React.SetStateAction<any[]>>,
  setFilteredReports: React.Dispatch<React.SetStateAction<any[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!userId) return;

  const token = localStorage.getItem('token');
  if (!token) {
    setError('No se encontró el token. Inicia sesión nuevamente.');
    return;
  }

  try {
    const url = userRole === 'master' 
      ? 'http://localhost:4000/sales' 
      : `http://localhost:4000/sales/user/${userId}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setAllReports(response.data);
    setFilteredReports(response.data);
    toast.success('Reportes cargados exitosamente'); 

  } catch (err) {
    console.error('Error al obtener los reportes:', err);
    toast.error('Hubo un problema al obtener los reportes.');
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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

export const handlePinClick = (
  pins: any[], 
  setPines: React.Dispatch<React.SetStateAction<any[]>>, 
  setPinsModalOpened: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setPines(pins);
  setPinsModalOpened(true);
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success('Pin copiado al portapapeles'); 
    })
    .catch((err) => {
      console.error('Error al copiar al portapapeles:', err);
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
    console.error("Error fetching products:", error);
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
        console.error('Error al obtener datos del usuario:', error);
        toast.error('Error al obtener los datos del usuario');
      }
    }
  };
  
  export const handleLogout = (navigate: Function) => {
    localStorage.removeItem('token');
    localStorage.setItem('isAuthenticated', 'false');
    navigate('/');
  };