// src/components/filter.
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';


import TableContainer from './TableContainer';
import { useGet } from "hook/useGet";
import { showToast } from "helpers/utility";


function UsersTable() {

    const [selectedUsers, setselectedUsers] = useState([])
    const { isLoading, data = [], isError, error } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Users`,"users")


    const removeUser = (event) => {



        const newData = selectedUsers.filter(x => x !== event.target.value)
        setselectedUsers([])
        setselectedUsers(newData)

    }

    const addUser = (event) => {
        setselectedUsers(prev => [...prev, event.target.value])

    }

    const isChecked = (id) => {
        const isfound = selectedUsers.find(x => x === id)


        if (isfound) {
            return <input id={id} type="checkbox" value={id} checked onClick={removeUser} className="form-check-input" />;
        }
        return <input id={id} type="checkbox" value={id} onChange={addUser} className="form-check-input" />;
    }

    const handleAllClick = (event) => {
        console.log({ removeUser: event.target.checked });
        if (event.target.checked) {
            setselectedUsers(data.map(x => x?.id))
        } else {
            setselectedUsers([])
        }
    }

    const columns = useMemo(
        () => [
            {
                Header: <input type="checkbox" onClick={handleAllClick} onChange={handleAllClick} className="form-check-input" />,
                accessor: 'id',
                Cell: ({ value }) => {
                    return isChecked(value)
                },
                disableSortBy: true
            },
            {
                Header: 'First Name',
                accessor: 'firstName',
            },
            {
                Header: 'Last Name',
                accessor: 'lastName'
            }

        ],
        [selectedUsers]
    );






    console.log({ isError, error });

    useEffect(() => {
        if (isError) {
            showToast("error", error?.message, "Notice")
        }


        return () => {

        }
    }, [isError])




    return (
        <>
            {
                isError ? <div className="alert alert-danger fade show" role="alert">sorry could not load users list</div>
                    :
                    <TableContainer
                        columns={columns}
                        data={data}
                        isGlobalFilter={true}
                        isAddOptions={false}
                        customPageSize={5}
                    />}

                <hr/>
            <strong>
                Count
                {
                   ": "+ selectedUsers.length+ "  user(s) selected."
                }
            </strong>


        </>






    );
}
UsersTable.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default UsersTable;