import React, { useContext, useMemo, useState } from "react";
import { Container, Card, CardBody} from "reactstrap";

import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from "./TableContainer";
import UserForm from "./form/FormComponet";
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useEffect } from "react";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useDelete } from "hook/useDelete";
import { showToast } from "helpers/utility";
//First Name, Last Name, Username, Email, Status(Active/Inactive), Role, Phone #

const initialValues = {
  firstName: '',
  lastName: '',
  otherNames: "",
  userName: '',
  role: '',
  email: '',
  phoneNumber: '',
  status: true,
  password: "",
  CustomerId:"",
  //confirmPassword:""
};

export const StatusTemplate = ({ value }) => {
  return (
    <>
      {value === 1 || value === 'Active'?
       <span  className="badge rounded-pill bg-success">Active</span>: <span className="badge rounded-pill bg-danger">Inactive</span>

    }
    </>
  );
};

const Users = () => {
  const {modal_backdrop, setmodal_backdrop, setMinimized} = useContext(AppContext)
  const [usersList, setUsersList] = useState([])
  const [showLoading, setShowLoading] = useState(false)
  const [showAlert, setshowAlert] = useState(false)
  const [selectedRow, setselectedRow] = useState({})
  const [userInfo, setuserInfo] = useState({})
  
const onDeleteSuccess =(data)=>{
  showToast("success", data?.message, "Notice")
    
  setShowLoading(false)
  setshowAlert(false)
}
  const onDeletError = (error) =>{
    
    showToast("error", error?.code, "Notice")
    
    setShowLoading(false)
  
  }

  const {mutate, isSuccess} =useDelete(`${process.env.REACT_APP_ADMIN_URL}/Users/id?id=${selectedRow?.id}`,"users",onDeleteSuccess, onDeletError)

  const handleEdit = (rowItem) => {
    setuserInfo(rowItem)
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
        Header: 'First Name',
        accessor: 'firstName',
      },
      {
        Header: 'Last Name',
        accessor: 'lastName'
      },
      {
        Header: 'Username',
        accessor: 'userName'
      },
      {
        Header: 'Email',
        accessor: 'email'
      },
      {
        Header: 'Phone #',
        accessor: 'phoneNumber'
      },
      {
        Header: 'Role',
        accessor: 'role'
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
  document.title = "Biz-360 ERP| Users";

  // Get all user
  const onsuccess = (data) =>{
      console.log({onsuccess:data});
      setUsersList(data)
  }
  const onError =(error)=>{
    console.log({error: error?.response});
  }
 const {isLoading, isFetching} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Users`,"users",onsuccess, onError)


 useEffect(() => {
   
  // setShowLoading(isLoading)
 
   return () => {
     
   }
 }, [isLoading])
 


 if(isLoading){
  return <LoadingSpinner />
 }
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
          <Breadcrumbs title="Administration" breadcrumbItem="Users" />



          <Card>
            <CardBody>
              {isLoading? "Loading users": null}
              <TableContainer
                columns={columns}
                data={usersList}
                isGlobalFilter={true}
                isAddOptions={true}
                customPageSize={10}
                setmodal_backdrop={setmodal_backdrop}
               className="table-sm"
              />
            </CardBody>

          </Card>


           {/* Modal */}
           <UserForm userInfo={userInfo} setuserInfo={setuserInfo} setShowLoading={setShowLoading} modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized} />
           
        </Container>
      </div>
      <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>
    </React.Fragment>
  )
}

export default Users;
