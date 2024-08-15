// src/components/filter.
import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from 'prop-types';

//import components
import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from './TableContainer';
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import { convertDateUSA, showToast } from "helpers/utility";

import { AppContext } from "App";
import AccountForm from "./form/AccountForm";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useGet } from "hook/useGet";
import { StatusTemplate } from "pages/Administration/Users";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useGetById } from "hook/useGetById";
import { useDelete } from "hook/useDelete";


function Account() {
    const {modal_backdrop, setmodal_backdrop, setMinimized} = useContext(AppContext)
    const [showLoading, setShowLoading] = useState(false)
    const [showAlert, setshowAlert] = useState(false)
    const [selectedRow, setselectedRow] = useState({})
    const [accountInfo, setAccountInfo] = useState({})

    const onDeleteSuccess =(data)=>{
        showToast("success", data?.message, "Notice")
        setShowLoading(false)
        setshowAlert(false)
    }
      const onDeletError = (error) =>{
        
        showToast("error", error?.code, "Notice")
        
        setShowLoading(false)
      
      }
    
      const {mutate, isLoading:isDelectLoading} =useDelete(`${process.env.REACT_APP_ADMIN_URL}/Position/${selectedRow?.id}`,"positions",onDeleteSuccess, onDeletError)
    


 const onGetByIdSuccess = (data)=>{
    console.log({setAccountInfo:data});
    setAccountInfo(data)
    setShowLoading(false)
 }
    
   const {refetch, isSuccess:isGetByIdSuccess} = useGetById(`${process.env.REACT_APP_ADMIN_URL}/Position/${selectedRow?.id}`,'positions', selectedRow?.id,onGetByIdSuccess)

   useEffect(() => {

        if(isGetByIdSuccess){
            setShowLoading(false)
        }
     
   
     return () => {
       
     }
   }, [isGetByIdSuccess])
   

    const handleEdit = (rowItem) => {
        setShowLoading(true)
       
       setselectedRow(rowItem)
        setTimeout(() => {

            refetch()
            
        }, 300);
        //setmodal_backdrop(true)
          
      }
      const confirmDelete = (rowItem) => {
        setshowAlert(true)
        setselectedRow(rowItem)
      }
      const handleDelete = () => {
        // setShowLoading(true)
        mutate(selectedRow?.id)
      }  

      const onsuccess = (data) =>{
        console.log({onsuccess:data.map(x => ({...x,currencies:x?.currencies?.id}))});
        //setUsersList(data)
    }
    const onError =(error)=>{
      console.log({error: error?.response});
    }
   const {isLoading, isFetching, data=[]} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Position/GetAllPositions`,"positions",onsuccess, onError)
      
      const { data: accountTypes = [], isLoading:acctypeLoading } = useGet(`${process.env.REACT_APP_ADMIN_URL}/AccountTypes/account`, 'account-types')


    const columns = useMemo(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
            },
            {
                Header: 'Parent Position',
                accessor: 'parentPositionId',
                Cell:({value}) => value === 0 ? "" : data.find(x => x?.id === value)?.name
            },
            // {
            //     Header: 'Description',
            //     accessor: 'description'
            // },
            {
                Header: 'Pay Grade',
                accessor: 'payGradeId',
                // Cell: ({ cell: { value } }) => data?.find(x => x?.id === value)?.name
                
            },
            {
                Header: 'Mass Position',
                accessor: 'massPosition',
                // Cell: ({ cell: { value } }) => accountTypes?.find(x => x?.id === value)?.name
                
            },
            {
                Header: 'FTE',
                accessor: 'fte',
                // Cell: ({ cell: { value } }) => value === "All Currencies" ? "All" : value

            },
           
            {
                Header: 'Start Date',
                accessor: 'effectiveDate',
                Cell:({value}) => convertDateUSA(new Date(value).toISOString())
                // Cell:({value}) => value === "true" ? 'Yes' : 'No'
            },
            {
                Header: 'End Date',
                accessor: 'endDate',
                Cell:({value}) => convertDateUSA(new Date(value).toISOString())
                // Cell:({value}) => value === "true" ? 'Yes' : 'No'
            },
            {
                Header: 'Manager',
                accessor: 'isManager',
                // Cell:({value}) => value === "true" ? 'Yes' : 'No'
            },
            {
                Header: 'Vacant',
                accessor: 'vacant',
                // Cell:({value}) => value === "true" ? 'Yes' : 'No'
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ cell: { value } }) =><StatusTemplate value={value}/>
              },
              {
                Header: 'Action',
                accessor: (originalRow, rowIndex) => (
                   <div>
                       <span onClick={() => handleEdit(originalRow)} className="btn-light me-2"><i className="far fa-edit" style={{color:'blue'}}></i></span>
                       <span onClick={() => confirmDelete(originalRow)} className="btn-light "><i className="far fa-trash-alt" style={{color:'red'}}></i></span>
                   </div>
                ),
                id: 'action',
                width: 40
              }
        ],
        [isFetching, isLoading]
    );

    // const data = [];

    
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
    document.title = "Biz-360 ERP | Position";

  
  
  console.log({Accounts: data});
   useEffect(() => {
     
    setShowLoading(isLoading)
   
     return () => {
       
     }
   }, [isLoading])
   
  
  
   if(isLoading || isDelectLoading){
    return <LoadingSpinner />
   }

   if(showLoading){
    return <LoadingSpinner />
   }


    return (
        <div className="page-content">
            <div className="container-fluid">
                <Breadcrumbs title="HR" breadcrumbItem="Position" />
                {/* <Table columns={columns} data={data} /> */}

                <Card>
                    <CardBody>
                        <TableContainer
                            columns={columns}
                            // data={data.map(x => ({...x,currenciesName:x?.currencies?.code ||"All", currencies:x?.currencies?.id}))}
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
            <AccountForm accountTypes={accountTypes} data={data} accountInfo={accountInfo} setAccountInfo={setAccountInfo} modal_backdrop={modal_backdrop} setMinimized={setMinimized}setmodal_backdrop={setmodal_backdrop}/>

            <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>
        </div>



    );
}
Account.propTypes = {
    preGlobalFilteredRows: PropTypes.any,

};


export default Account;