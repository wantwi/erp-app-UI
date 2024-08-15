// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA, moneyInTxt, showToast } from "helpers/utility";

import { AppContext } from "App";
import CompanyForm from "./form/CompanyForm";
import { useGet } from "hook/useGet";
import { useGetQuery } from "hook/useGetQuery";
import { useDelete } from "hook/useDelete";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useGetById } from "hook/useGetById";
import { useGetStatic } from "hook/useGetStatic";
import { usePut } from "hook/usePut";

const StatusTemplate = ({ value }) => {

    return (
        <>
            {
                value === 'Active' ?
                    <span className="badge rounded-pill bg-success">Active</span>
                    : value === "Draft" ? <span className="badge rounded-pill bg-info">{value}</span>
                        : <span className="badge rounded-pill bg-danger">{value}</span>

            }
        </>
    );
}

function formatDate(inputDateString) {
    // Create a Date object from the input string
    // console.log({ inputDateString });
    if (!inputDateString) {
        return ""
    }
    const inputDate = new Date(inputDateString);

    // Get the day, month, and year components from the Date object
    const day = inputDate.getDate();
    const month = inputDate.getMonth() + 1; // Month is zero-based, so add 1
    const year = inputDate.getFullYear();

    // Create a formatted date string in the desired format (dd-mm-yyyy)
    // const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    return formattedDate;
}



function BusinessPartnerGroups() {
    const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
    const [showLoading, setShowLoading] = useState(false)

    const [selectedDates, setSelectedDates] = useState([])
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")

    const [showAlert, setshowAlert] = useState(false)
    const [selectedRow, setselectedRow] = useState({})
    const [accountInfo, setAccountInfo] = useState({})

    const onDeleteSuccess = (data) => {
        showToast("success", "Cancel Journal successfull", "Notice")
        setShowLoading(false)
        setshowAlert(false)
    }
    const onDeletError = (error) => {
        showToast("error", error?.code, "Notice")
        setShowLoading(false)
    }

    const { mutate, isLoading: isDelectLoading } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations/${selectedRow?.id}`, "sales-quotations", onDeleteSuccess, onDeletError)
    const onGetByIdSuccess = (data) => {
        // console.log({ setAccountInfo: data });
        setAccountInfo(data)
        setShowLoading(false)
    }

    const { refetch: refetchGetById, isSuccess: isGetByIdSuccess } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/SalesQuotations/${selectedRow?.id}`, 'sales-quotations', selectedRow?.id, onGetByIdSuccess)

    useEffect(() => {

        if (isGetByIdSuccess) {
            setShowLoading(false)
        }


        return () => {

        }
    }, [isGetByIdSuccess])

    const handleEdit = (rowItem) => {
        setShowLoading(true)

        setselectedRow(rowItem)
        setTimeout(() => {

            refetchGetById()

        }, 300);
        //setmodal_backdrop(true)

    }
    const confirmDelete = (rowItem) => {
        setshowAlert(true)
        // setAccountInfo(rowItem)
        setselectedRow(rowItem)
    }
    const handleDelete = () => {
        // setShowLoading(true)
        mutate(selectedRow?.id)
    }



    const columns = useMemo(
        () => [
            {
                Header: 'Document Number',
                accessor: 'number',
            },
            {
                Header: 'Customer',
                accessor: 'businessPartner',
                Cell: ({ value }) => `${value?.code} - ${value?.name}`
            },
            {
                Header: 'Document Date',
                accessor: 'transactionDate',
                Cell: ({ value }) => convertDateUSA(new Date(value).toISOString())
            },
            {
                Header: 'Due Date',
                accessor: 'dueDate',
                Cell: ({ value }) => convertDateUSA(new Date(value).toISOString())
            },
            {
                Header: 'Currency',
                accessor: 'currency',
                Cell: ({ value }) => value?.code
            },

            {
                Header: 'Document Total',
                accessor: 'totalPriceAmount',
                Cell: ({ cell: { value } }) => moneyInTxt(value, "en", 2)
            },
            {
                Header: 'Status',
                accessor: 'status'
            },
            {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                    <div>
                        <span onClick={() => handleEdit(originalRow)} className="btn p-0 me-2"><i className="fa fa-eye text-primary"></i></span>
                        <span onClick={() => confirmDelete(originalRow)} className="btn btn-sm p-0"><i className="fa fa-trash-alt text-danger"></i></span>
                    </div>
                ),
                id: 'action',
                width: 40
            }

        ],
        []
    );



    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    //meta title
    document.title = "Biz-360 ERP | Sales Order";

    // console.log({ selectedDates: formatDate(selectedDates[0]), end: formatDate(selectedDates[1]) });


    // API CALLS
    const { data: currenciesList = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')
    const { data: UoM = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/UnitsOfMeasure/GetAll`, 'uom')
    const { data: TaxTable = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/TaxTable/GetAll`, 'tax-table')
    const { data: Warehouse = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Warehouses`, 'warehouse')
    const { isLoading, isFetching, data: accounts = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Items/GetAssets`, "assets")
    const { data: BusinessPartners = [] } = useGetStatic(`${process.env.REACT_APP_ADMIN_URL}/BusinessPartners`, 'business-partners')

    // API CALLS

    const { refetch, data: SalesQuotations = [] } = useGetQuery(
        `${process.env.REACT_APP_ADMIN_URL}/SalesQuotations`,
        ["sales-quotations"]
    )




    return (
        <> {
            showLoading || isLoading ?
                <div id="preloader">
                    <div id="status">
                        <div className="spinner-chase">
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                            <div className="chase-dot" />
                        </div>
                    </div>
                </div> : null
        }

            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Financials" breadcrumbItem="Sales Quotation" />
                    {/* <Table columns={columns} data={data} /> */}

                    <Card>

                        <CardBody >
                            <TableContainer
                                columns={columns}
                                data={SalesQuotations || []}
                                isGlobalFilter={true}
                                isAddOptions={true}
                                customPageSize={10}
                                setmodal_backdrop={setmodal_backdrop}
                                setSelectedDates={setSelectedDates}
                                selectedDates={selectedDates}
                                refetch={refetch}
                                accounts={accounts}
                                companies={[BusinessPartners]}
                                setAccountInfo={setAccountInfo}
                                className="table-sm"
                                setDateFrom={setDateFrom}
                                setDateTo={setDateTo}
                            />
                        </CardBody>

                    </Card>

                </div>



                {/* Modal */}
                <CompanyForm
                    refetch={refetch}
                    rowInfo={accountInfo}
                    setRowInfo={setAccountInfo}
                    setShowLoading={setShowLoading}
                    BusinessPartners={BusinessPartners}
                    currenciesList={currenciesList}
                    modal_backdrop={modal_backdrop}
                    setmodal_backdrop={setmodal_backdrop}
                    setMinimized={setMinimized}
                    items={accounts}
                    UoM={UoM}
                    TaxTable={TaxTable}
                    Warehouse={Warehouse}
                />
                <SweetAlert message={`Do you want to remove document ${selectedRow?.number}?`} setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />
            </div>
        </>




    );
}
BusinessPartnerGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartnerGroups;