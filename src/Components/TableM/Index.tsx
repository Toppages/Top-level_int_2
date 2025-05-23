import React, { useState, useEffect } from 'react';
import StepperMa from '../StepperMa/Index';
import { Product } from '../../types/types';
import { IconSearch, IconEye } from '@tabler/icons-react';
import { fetchProductsFromAPI, handleSearchChange } from '../../utils/utils';
import { ActionIcon, Table, Loader, Input } from '@mantine/core';

interface TableMProps {
  user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
  setModalStepOpened: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableM: React.FC<TableMProps> = ({ user, setModalStepOpened }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedProductGroup, setSelectedProductGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchProductsFromAPI(setFetchedProducts, setLoading);
  }, []);

  useEffect(() => {
    const handleResize = () => {
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const openModalForGroup = (group: string) => {
    setSelectedProductGroup(group);
    setOpened(true);
    setActiveStep(0);
    setModalStepOpened(true);
  };

  const productsInSelectedGroup = selectedProductGroup
    ? fetchedProducts.filter((product) => product.product_group === selectedProductGroup)
    : [];

  const filteredGroups = Array.from(new Set(fetchedProducts.map((product) => product.product_group)))
    .sort((a, b) => (a === "Free Fire Latam" ? -1 : b === "Free Fire Latam" ? 1 : 0))
    .filter((group) => group.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <StepperMa
        opened={opened}
        onClose={() => setOpened(false)}
        products={productsInSelectedGroup}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        user={user}
        setModalStepOpened={setModalStepOpened}
      />



      {loading ? (
        <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} />
      ) : (
        <Table striped highlightOnHover>
          <thead style={{ background: '#0c2a85' }}>
            <tr>
              <th style={{ textAlign: 'center', color: 'white' }}>Juegos Disponibles</th>
              <th>
                <Input
                  radius="md"
                  style={{
                    display: 'none',
                  }}
                  size="md"
                  icon={<IconSearch />}
                  placeholder="Buscar Juego"
                  value={searchQuery}
                  onChange={(e: { target: { value: any; }; }) => {
                    const query = e.target.value;
                    setSearchQuery(query);
                    handleSearchChange(query, fetchedProducts, setFetchedProducts);
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group, index) => (
                <tr key={index}>
                  <td style={{ textAlign: 'center' }}>{group}</td>
                  <td style={{ display: 'flex', justifyContent: 'center' }}>
                    <ActionIcon
                      onClick={() => openModalForGroup(group)}
                      style={{ background: '#0c2a85', color: 'white' }}
                      size="lg"
                      variant="filled"
                    >
                      <IconEye size={26} />
                    </ActionIcon>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>No se encontraron juegos disponibles.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TableM;