// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA } from "helpers/utility";

import { AppContext } from "App";
import CompanyForm from "./form/CompanyForm";
import { useGet } from "hook/useGet";
import { useGetQuery } from "hook/useGetQuery";
import useCustomAxios from "hook/useCustomAxios";
import { convertToMoneyText } from "helpers/helperfunction";

function formatDate(inputDateString) {
    // Create a Date object from the input string
    console.log({inputDateString});
    if(!inputDateString){
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
    const axios = useCustomAxios()
    // const [modal_backdrop, setmodal_backdrop] = useState(false);
    const [formData, setFormData] = useState({ name: '', symbol: '', short_name: '' })
     const [showLoading, setShowLoading] = useState(false)
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [urlQuery, setUrlQuery] = useState('')
    const [selectedDates, setSelectedDates] = useState([])
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [showFC, setShowFC] = useState(true)
    const [showLC, setShowLC] = useState(true)

    const columns = useMemo(
        () => [
            {
                Header: 'Journal #',
                accessor: 'number',
                
            },
            {
                Header: 'Date',
                accessor: 'transactionDate',
                Cell:({value}) => convertDateUSA(new Date(value).toISOString())
            },
            {
                Header: 'Transaction Type',
                accessor: 'transactionType'
            },
            {
                Header: 'Account Name',
                accessor: 'accountName',
                
            },
            //{
            //    Header: 'Currency',
            //    accessor: 'Currency'
            //},
            {
                Header: 'Debit(LC)',
                accessor: 'debitLC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)
            },
            {
                Header: 'Credit(LC)',
                accessor: 'creditLC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)

            },
            {
                Header: 'Debit(FC)',
                accessor: 'debitFC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)
            },
            {
                Header: 'Credit(FC)',
                accessor: 'creditFC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)
            },
            {
                Header: 'Balance(LC)',
                accessor: 'balanceLC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)
            },
            {
                Header: 'Balance(FC)',
                accessor: 'balanceFC',
                Cell: ({ cell: { value } }) => convertToMoneyText(value)
            },
            {
                Header: 'Comments',
                accessor: 'comment'
            },
        ],
        []
    );
  

    const data = [];

   

    function removeBodyCss() {
        document.body.classList.add("no_padding");
    }

    function tog_backdrop() {
        setmodal_backdrop(!modal_backdrop);
        removeBodyCss();
    }

    //meta title
    document.title = "Biz-360 ERP | General Ledger";

    console.log({selectedDates: formatDate(selectedDates[0]), end: formatDate(selectedDates[1])});


    // API CALLS
    const { data: currenciesList = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')
    const {isLoading, isFetching, data:accounts=[]} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`,"accounts")

    // const {refetch, data:journals} = useGetQuery(
    //     `${process.env.REACT_APP_ADMIN_URL}/Journals`,
    //     ["journals",formatDate(selectedDates[0]),formatDate(selectedDates[1])]
    // )

    const { refetch, data: journals =[], isLoading:loadingGL } = useGetQuery(
        `${process.env.REACT_APP_ADMIN_URL}/GeneralLedger/GeneralLedgerByDates?AccountId=${selectedAccount?.value || 0}&StartDate=${formatDate(dateFrom)}&EndDate=${formatDate(dateTo)}`,
        ["gl", formatDate(dateFrom) ==="NaN-NaN-NaN"? "": formatDate(dateFrom) ,
         formatDate(dateTo)==="NaN-NaN-NaN"?"": formatDate(dateTo), selectedAccount?.value||0]


    )

    console.log({journals});


    // const getGL = async ()=>{
    //     try {
    //         const request = await axios.get(`${process.env.REACT_APP_ADMIN_URL}/GeneralLedger/GeneralLedgerByDates`,
    //         {
               
    //             params: {
    //                 startDate: "2023-09-16T10:56:03.242Z",
    //                 endDate: "2023-09-16T10:56:03.242Z",
    //                 accountIds: [
    //                   0
    //                 ],
    //                 transactionTypes: [
    //                   "string"
    //                 ]
    //               },
    //           }
    //         )
    //         console.log({request});
    //     } catch (error) {
            
    //     }
    // }

    // useEffect(() => {
    //     getGL()
    
    //   return () => {
        
    //   }
    // }, [])
    



    return (
        <> {
            showLoading || loadingGL ?
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
          </div>: null
          }
           {
           loadingGL ?
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
          </div>: null
          }
    
         <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="Financials" breadcrumbItem="General Ledger" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                   
                    <CardBody >
                        <TableContainer
                            columns={columns}
                            data={journals}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                            refetch={refetch}
                            accounts={accounts}
                         className="table-sm"
                         setDateFrom={setDateFrom}
                         setDateTo={setDateTo}
                         setSelectedAccount={setSelectedAccount}
                         selectedAccount={selectedAccount}
                         setShowLoading={setShowLoading}
                         setShowFC={setShowFC}
                         setShowLC={setShowLC}
                        />
                    </CardBody>

                </Card>

            </div>



            {/* Modal */}
            <CompanyForm setShowLoading={setShowLoading} accounts={accounts} currenciesList={currenciesList} modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized}/>

        </div>
        </>
       



    );
}
BusinessPartnerGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartnerGroups;