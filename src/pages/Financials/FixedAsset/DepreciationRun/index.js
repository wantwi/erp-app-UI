// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, Table, } from "reactstrap";
import { convertDateUSA } from "helpers/utility";

import { AppContext } from "App";
import { useGet } from "hook/useGet";
import { useGetQuery } from "hook/useGetQuery";
import useCustomAxios from "hook/useCustomAxios";

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

    const [selectedUsers, setselectedUsers] = useState([])
    // const { isLoading, data = [], isError, error } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Users`,"users")


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
                Header: 'Asset Cost',
                accessor: 'journal',
            },
            {
                Header: 'Capitalisation Date',
                accessor: 'description'
            },
            {
                Header: 'Net Book Value',
                accessor: 'transType'
            },
            {
                Header: 'Depreciation Amount',
                accessor: 'accountName'
            },
            //{
            //    Header: 'Currency',
            //    accessor: 'Currency'
            //},
            // {
            //     Header: 'Debit(LC)',
            //     accessor: 'Debit'
            // },
            // {
            //     Header: 'Credit(LC)',
            //     accessor: 'Credit'
            // },
            // {
            //     Header: 'Debit(FC)',
            //     accessor: 'Debit(FC)'
            // },
            // {
            //     Header: 'Credit(FC)',
            //     accessor: 'Credit(FC)'
            // },
            // {
            //     Header: 'Balance(LC)',
            //     accessor: 'Balance(LC)'
            // },
            // {
            //     Header: 'Balance(FC)',
            //     accessor: 'Balance(FC)'
            // },
            // {
            //     Header: 'Comments',
            //     accessor: 'Comments'
            // },
        ],
        [selectedUsers]
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
    document.title = "Biz-360 ERP | Depreciation Run";

    console.log({selectedDates: formatDate(selectedDates[0]), end: formatDate(selectedDates[1])});


    // API CALLS
    const { data: currenciesList = [] } = useGet(`${process.env.REACT_APP_ADMIN_URL}/Currencies`, 'currencies')
    const {isLoading, isFetching, data:accounts=[]} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Accounts/GetAllAccounts`,"accounts")

    const {refetch, data:journals} = useGetQuery(
        `${process.env.REACT_APP_ADMIN_URL}/Journals`,
        ["journals",formatDate(selectedDates[0]),formatDate(selectedDates[1])]
    )


    const getGL = async ()=>{
        try {
            const request = await axios.get(`${process.env.REACT_APP_ADMIN_URL}/GeneralLedger/GeneralLedgerByDates`,
            {
                headers:{
                    'Content-Type': 'application/json'
                },
                params: {
                    startDate: "2023-09-16T10:56:03.242Z",
                    endDate: "2023-09-16T10:56:03.242Z",
                    accountIds: [
                      0
                    ],
                    transactionTypes: [
                      "string"
                    ]
                  },
              }
            )
            console.log({request});
        } catch (error) {
            
        }
    }

    useEffect(() => {
        getGL()
    
      return () => {
        
      }
    }, [])
    



    return (
        <> {
            showLoading ?
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
                <Breadcrumbs title="Financials" breadcrumbItem="Depreciation Run" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                   
                    <CardBody >
                        <TableContainer
                            columns={columns}
                            data={data}
                            isGlobalFilter={true}
                            isAddOptions={true}
                            customPageSize={10}
                            setmodal_backdrop={setmodal_backdrop}
                            setSelectedDates={setSelectedDates}
                            selectedDates={selectedDates}
                            refetch={refetch}
                            accounts={accounts}
                         className="table-sm"
                        />
                    </CardBody>

                </Card>

            </div>



            {/* Modal */}
            {/* <CompanyForm setShowLoading={setShowLoading} accounts={accounts} currenciesList={currenciesList} modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized}/> */}

        </div>
        </>
       



    );
}
BusinessPartnerGroups.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default BusinessPartnerGroups;