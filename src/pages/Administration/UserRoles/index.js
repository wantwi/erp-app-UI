import React, { useContext, useMemo, useState } from "react";
import { Container, Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";

import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from "./TableContainer";
import { convertDateUSA, showToast } from "helpers/utility";
import UserRolesForm from "./form/UserRolesForm";
import { useGet } from "hook/useGet";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { StatusTemplate } from "../Users";
import { usePost } from "hook/usePost";
import SweetAlert from "components/CustomBizERP/SweetAlert";
import { useDelete } from "hook/useDelete";
import { AppContext } from "App";
import { useGetStatic } from "hook/useGetStatic";
import { useGetById } from "hook/useGetById";
import { useGetByIdAll } from "hook/useGetByIdAll";

const getIcon = (key) => {
  // console.log({ IconKey: key });
  switch (key) {
    case "Add":
      return <i className="fa fa-plus" style={{ fontSize: 10 }} />
    case "Delete":
      return <i className="fa fa-trash text-danger" style={{ fontSize: 10, color: "#b90e0a" }} />

    case "Update":
      return <i className="far fa-edit" style={{ fontSize: 10, color: "teal" }} />

    default:
      return <i className="far fa-eye" style={{ fontSize: 10, color: "slateblue" }} />
  }
}

export const renderTreeMenus = (menus)=>{
  let arr = []
menus.forEach(x => {
  let obj = {}, L1Child = []
  if (x?.children.length > 0) {
    x?.children.forEach(y => {
      let obj2 = {}, L2Child = []



      if (y?.children.length > 0) {
        y.children.forEach(z => {
          let aObj = {}
          // console.log({ YChildren: z })

          // console.log({ Check: y?.children[0].mType });

          if (y?.children[0].mType === "action") {
            aObj.icon = getIcon(z?.menu)
            obj2.icon = <i className="far fa-file" style={{ color: "steelblue" }} />
            obj2.checkedStatus = z?.checkedStatus
           
          }

          aObj.value = z.menuId,
            aObj.label = z?.menu
          aObj.parentId = y?.menuId
          aObj.menu = y?.menu
          aObj.mType = z?.mType
          L2Child.push(aObj)
        })
      }

      obj2.value = y?.menuId
      obj2.label = y?.menu
      obj2.parentId = x?.menuId
      obj2.children = L2Child
      obj2.mType =y?.mType
      // First Dept
      L1Child.push(obj2)

    })
    obj.value = x?.menuId
    obj.label = x?.menu
    obj.parentId = x?.parentMenuId
    obj.mType = x?.mType
    obj.children = L1Child
    

    arr.push(obj)
  }
})



const flatArrys = arr.flatMap(x => x?.children).flatMap(x => x?.children)
const flattenMenus = [...arr, ...flatArrys].map(x => ({ menuId: x?.value, parentId: x?.parentId, mType:x?.mType })).filter(x => x?.mType !=="menu")

console.log({myAList:arr});
return {renderTreeMenus: arr,flattenMenus}
}

const UserRoles = () => {

  const {modal_backdrop, setmodal_backdrop, setMinimized} = useContext(AppContext)
  const [showLoading, setShowLoading] = useState(false)
  const [showAlert, setshowAlert] = useState(false)
  const [selectedRow, setselectedRow] = useState({})
  const [rowInfo, setRowInfo] = useState({})
  const [appMenus, setappMenus] = useState([])
  const [flatMenus, setFlatMenus] = useState([])

  const onDeleteSuccess =(data)=>{
      showToast("success", data?.message, "Notice")
      setShowLoading(false)
      setshowAlert(false)
  }
    const onDeletError = (error) =>{
      
      showToast("error", error?.code, "Notice")
      
      setShowLoading(false)
    
    }

    const onGetByIdSuccess = (data)=>{
      console.log({onGetByIdSuccess: data?.payload?.selectedRoleMenus});
      setRowInfo({id:data?.payload.id,name:data?.payload.name,code:data?.payload.code,status:data?.payload?.status, roleMenus: data?.payload?.selectedRoleMenus.map(x => `${x?.menuId}`)})
      setShowLoading(false)
     
   }

    const {refetch, isSuccess:isGetByIdSuccess} = useGetByIdAll(`${process.env.REACT_APP_ADMIN_URL}/Roles/${selectedRow?.id}`,'role-id', selectedRow?.id,onGetByIdSuccess)
  
    const {mutate, isLoading:isDelectLoading} =useDelete(`${process.env.REACT_APP_ADMIN_URL}/Roles/${selectedRow?.id}`,"roles",onDeleteSuccess, onDeletError)
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

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ cell: { value } }) =><StatusTemplate value={value}/>
      },
      {
        Header: 'Date Created',
        accessor: 'dateCreated',
        Cell:({value}) => convertDateUSA(new Date(value).toISOString())
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



 

  function removeBodyCss() {
    document.body.classList.add("no_padding");
  }

  function tog_backdrop() {
    setmodal_backdrop(!modal_backdrop);
    removeBodyCss();
  }
  //meta title
  document.title = "Biz-360 ERP| User Roles";

  const onSuccess = (data)=>{

    const formatedMenu = renderTreeMenus(data)
    // console.log({formatedMenu});
   setappMenus(formatedMenu?.renderTreeMenus)
   setFlatMenus(formatedMenu.flattenMenus)

  }



 const {data=[], isLoading} = useGet(`${process.env.REACT_APP_ADMIN_URL}/Roles/GetAllRoles`,"roles")
 const {data:menus=[]} = useGetStatic(`${process.env.REACT_APP_ADMIN_URL}/Roles/GetAllMenus`,"menus", onSuccess) 

 if (isLoading || showLoading) {
  return <LoadingSpinner />
}

  return (
    <React.Fragment>
      
      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Administration" breadcrumbItem="User Roles" />



          <Card>
            <CardBody>
              <TableContainer
                columns={columns}
                data={data}
                isGlobalFilter={true}
                isAddOptions={true}
                customPageSize={10}
                setmodal_backdrop={setmodal_backdrop}
                className="table-sm"

              />
            </CardBody>

          </Card>


           {/* Modal */}
           <UserRolesForm refetch={refetch} setRowInfo={setRowInfo} rowInfo={rowInfo} flatMenus={flatMenus} appMenus={appMenus} setShowLoading={setShowLoading} modal_backdrop={modal_backdrop} setMinimized={setMinimized} setmodal_backdrop={setmodal_backdrop} />
           <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete}/>
        </Container>

      </div>
    </React.Fragment>
  )
}

export default UserRoles;
