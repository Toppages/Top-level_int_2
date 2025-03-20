import React, { useState, useEffect } from 'react';
import StepperRed from '../StepperRed/Index';
import { IconEye } from '@tabler/icons-react';
import { Product } from "../../types/types";
import { fetchProductsFromAPI } from '../../utils/utils';
import { ActionIcon, Table, Loader } from '@mantine/core';


interface TableMProps {
    user: { _id: string; name: string; email: string; handle: string; role: string; saldo: number; rango: string; } | null;
}
const TableC: React.FC<TableMProps> = ({ user }) => {
    const [opened, setOpened] = useState<boolean>(false);
    const [fetchedProducts, setFetchedProducts] = useState<Product[]>([]);
    const [selectedProductGroup, setSelectedProductGroup] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchProductsFromAPI(setFetchedProducts, setLoading);
    }, []);


    const openModalForGroup = (group: string) => {
        setSelectedProductGroup(group);
        setOpened(true);
    };

    const productsInSelectedGroup = selectedProductGroup
        ? fetchedProducts.filter(product => product.product_group === selectedProductGroup)
        : [];

    const uniqueGroups = Array.from(new Set(fetchedProducts.map(product => product.product_group)));

    return (
        <>
            <StepperRed opened={opened} onClose={() => setOpened(false)} products={productsInSelectedGroup} />

            {loading ? <Loader color="indigo" size="xl" variant="dots" style={{ margin: 'auto', display: 'block' }} /> :
                <Table striped highlightOnHover>
                    <thead style={{ background: '#0c2a85' }}>
                        <tr>
                            <th style={{ textAlign: 'center', color: 'white' }}>Juegos Disponibles</th>

                            <th style={{ textAlign: 'center', color: 'white' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {uniqueGroups.length > 0 ? (
                            uniqueGroups.map((group, index) => (
                                <tr key={index}>
                                    <td style={{ textAlign: 'center' }}>{group}</td>
                                    <td>
                                        <ActionIcon
                                            onClick={() => openModalForGroup(group)}
                                            style={{ background: '#0c2a85', color: 'white', marginLeft: '10px' }}
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
                                <td colSpan={2} style={{ textAlign: 'center' }}>No se encontraron grupos.</td>
                            </tr>
                        )}

                    </tbody>
                </Table>
            }
        </>
    );
};

export default TableC;