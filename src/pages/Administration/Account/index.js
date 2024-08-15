// src/components/filter.
import React, { useContext, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { convertDateUSA } from "helpers/utility";

import { AppContext } from "App";
import AccountForm from "./form/AccountForm";


function Account() {
    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Code',
                accessor: 'code'
            },
            {
                Header: 'Description',
                accessor: 'parent'
            },
            {
                Header: 'Currency',
                accessor: 'currency'
            },
            {
                Header: 'Cash Account',
                accessor: 'cashAmount'
            },
            {
                Header: 'Status',
                accessor: 'status'
            }  //
        ],
        []
    );

    const data = [];

    const {modal_backdrop, setmodal_backdrop, setMinimized} = useContext(AppContext)
    // const [modal_backdrop, setmodal_backdrop] = useState(false);
    const [formData, setFormData] = useState({name:'', symbol:'', short_name:''})

    function removeBodyCss() {
        document.body.classList.add("no_padding");
      }
    
    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    //meta title
    document.title = "Biz-360 ERP | Account";


    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Administration" breadcrumbItem="Account" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            data={data}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop ={setmodal_backdrop}
                             className="table-sm"
                        />
                    </CardBody>
                    
                </Card>
               
            </div>



            {/* Modal */}
            <AccountForm modal_backdrop={modal_backdrop} setMinimized={setMinimized}setmodal_backdrop={setmodal_backdrop}/>

          
        </div>



    );
}
Account.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Account;