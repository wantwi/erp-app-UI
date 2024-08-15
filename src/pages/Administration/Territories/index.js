import React, { useContext, useMemo, useState } from "react";
import { Container, Card, CardBody} from "reactstrap";

import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from "./TableContainer";
import PageForm from "./form/PageForm";
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useEffect } from "react";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useDelete } from "hook/useDelete";
import { StatusTemplate } from "../Users";
import { showToast } from "helpers/utility";
//First Name, Last Name, Username, Email, Status(Active/Inactive), Role, Phone #


const Users = () => {
  const {modal_backdrop, setmodal_backdrop, setMinimized} = useContext(AppContext)
  const [dataList, setDataList] = useState([])
  const [showLoading, setShowLoading] = useState(false)
  const [showAlert, setshowAlert] = useState(false)
  const [selectedRow, setselectedRow] = useState({})
  const [rowInfo, setRowInfo] = useState({})

  const onDeleteSuccess =(data)=>{
    setShowLoading(false)
    setshowAlert(false)
    showToast("success", data?.message, "Notice")
      
   
  }
    const onDeletError = (error) =>{
      setShowLoading(false)
      showToast("error", error?.code, "Notice")
      
    }
  
    const {mutate, isSuccess} =useDelete(`${process.env.REACT_APP_ADMIN_URL}/Territories/${selectedRow?.id}`,"territories",onDeleteSuccess, onDeletError)
  
    const handleEdit = (rowItem) => {
      setRowInfo(rowItem)
      setmodal_backdrop(true)
        
    }
    const confirmDelete = (rowItem) => {
      setshowAlert(true)
      setselectedRow(rowItem)
    }
    const handleDelete = () => {
      setShowLoading(true)
      mutate(selectedRow?.id)
    }

  const columns = useMemo(
    () => [
      {
        Header: 'Code',
        accessor: 'code',
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
          Header: 'Description',
        accessor: 'description'
      },
      // {
      //     Header: 'Customer Count',
      //   accessor: 'count'
      // },
     
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
    []
  );

  // const data = [
  //   {
  //     "name": "Admin User",
  //     "status": 'active',
  //     "dateCreated": convertDateUSA(new Date().toISOString()),
  //   }
  // ];

  // const [modal_backdrop, setmodal_backdrop] = useState(false);
  
  function removeBodyCss() {
    document.body.classList.add("no_padding");
  }

  function tog_backdrop() {
    setmodal_backdrop(!modal_backdrop);
    removeBodyCss();
  }
  //meta title
  document.title = "Biz-360 ERP| Territories";

  // Get all user
  const onsuccess = (data) =>{
      console.log({onsuccess:data});
      setDataList(data)
  }
  const onError =(error)=>{
    console.log({error: error?.response});
  }
 const {isLoading} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Territories`,"territories",onsuccess, onError)


 useEffect(() => {
   
  setShowLoading(isLoading)
 
   return () => {
     
   }
 }, [isLoading])
 


//  if(isLoading){
//   return <LoadingSpinner />
//  }
  return (
    <React.Fragment>
      {
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
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Administration" breadcrumbItem="Territory" />



          <Card>
            <CardBody>
              {isLoading? "Loading users": null}
              <TableContainer
                columns={columns}
                data={dataList}
                isGlobalFilter={true}
                isAddOptions={true}
                customPageSize={10}
                setmodal_backdrop={setmodal_backdrop}
                setRowInfo={setRowInfo}
               className="table-sm"
              />
            </CardBody>

          </Card>


           {/* Modal */}
           <PageForm rowInfo={rowInfo} setShowLoading={setShowLoading} modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized} />
           
        </Container>
      </div>
      <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>
    </React.Fragment>
  )
}

export default Users;
