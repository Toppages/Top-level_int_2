import React, { useState, useEffect } from 'react';
import StepperMa from '../StepperMa/Index';
import { IconSearch, IconEye } from '@tabler/icons-react';
import { fetchProductsFromAPI, handleSearchChange } from '../../utils/utils'; 
import { ActionIcon, Table, Loader, Input, ScrollArea } from '@mantine/core';

interface Product {
  product_group: string;
  code: string;
  name: string;
  price: string;
}

interface TableMProps {
  user: { _id: string; name: string; email: string; handle: string;role:string;saldo: number; } | null;
}

const TableM: React.FC<TableMProps> = ({ user }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
  const [selectedProductGroup, setSelectedProductGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [searchQuery, setSearchQuery] = useState<string>('');


  useEffect(() => {
    fetchProductsFromAPI(setFetchedProducts, setLoading);
  }, []);

  const openModalForGroup = (group: string) => {
    setSelectedProductGroup(group);
    setOpened(true);
    setActiveStep(0);
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
      />

      {loading ? (
        <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} />
      ) : (
        <ScrollArea style={{ height: windowHeight - 100 }} type="never">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>Juegos Disponibles</th>
                <th>
                  <Input
                    radius="md"
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
        </ScrollArea>
      )}
    </>
  );
};

export default TableM;
