// src/components/filter.
import React, { useMemo, useState } from "react";
import PropTypes from 'prop-types';
import TableContainer from './TableContainer';


function UsersTable() {

   const data = [
    {
        id:1,
        account:"Account 1",
        debit:200,
        credit:120
    },
    {
        id:2,
        account:"Account 2",
        debit:200,
        credit:120
    },
    {
        id:3,
        account:"Account 3",
        debit:200,
        credit:120
    },
    {
        id:4,
        account:"Account 4",
        debit:200,
        credit:120
    },
    {
        id:5,
        account:"Account 5",
        debit:200,
        credit:120
    },
    {
        id:6,
        account:"Account 6",
        debit:200,
        credit:120
    }
   ]

    const columns = useMemo(
        () => [
            {
                Header: '#',
                accessor: 'id',
            },
            {
                Header: 'Account',
                accessor: 'account',
            },
            {
                Header: 'Debit',
                accessor: 'debit'
            },
            {
                Header: 'Credit',
                accessor: 'credit'
            },
            
            // {
            //     Header:"Action",
               
            //     Cell: ({})=> 
            //     <>
            //             <button type="button" className="btn btn-light me-2"><i className="far fa-edit" style={{color:'blue'}}></i></button>
            //             <button type="button" className="btn btn-light "><i className="far fa-trash-alt" style={{color:'red'}}></i></button>
                    
            //     </>
            // }

        ],
        []
    );


    return (
        <>

            <TableContainer
                columns={columns}
                data={data}
                isGlobalFilter={true}
                isAddOptions={false}
                customPageSize={5}
            />


        </>

    );
}
UsersTable.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default UsersTable;