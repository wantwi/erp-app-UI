import React, { useContext, useMemo, useState } from "react";
import { Container, Card, CardBody } from "reactstrap";

import Breadcrumbs from '../../../components/Common/Breadcrumb';
import TableContainer from "./TableContainer";
import PageForm from "./form/PageForm";
import { AppContext } from "App";
import { useGet } from "hook/useGet";
import LoadingSpinner from "components/CustomBizERP/LoadingSpinner";
import { useEffect } from "react";
import { useGetById } from "hook/useGetById";
import { useDelete } from "hook/useDelete";
import { convertDateUSA, showToast } from "helpers/utility";
import SweetAlert from "components/CustomBizERP/SweetAlert";
//First Name, Last Name, Username, Email, Status(Active/Inactive), Role, Phone #

const StatusTemplate = ({ value }) => {
  return (
    <>
      {value === 1 || value === "Active" ?
        <span className="badge rounded-pill bg-success">Active</span> : <span className="badge rounded-pill bg-danger">Inactive</span>

      }
    </>
  );
};

const Users = () => {
  const [usersList, setUsersList] = useState([])
  const [showLoading, setShowLoading] = useState(false)
  const [showAlert, setshowAlert] = useState(false)
  const [selectedRow, setselectedRow] = useState({})
  const [rowInfo, setRowInfo] = useState({})

  const onDeleteSuccess = (data) => {
    showToast("success", data?.message, "Notice")

    setShowLoading(false)
    setshowAlert(false)
  }
  const onDeletError = (error) => {

    showToast("error", error?.code, "Notice")

    setShowLoading(false)

  }

  const onGetByIdSuccess = (data) => {

    setRowInfo(data)
    setShowLoading(false)
    setmodal_backdrop(true)
  }

  const { refetch, isSuccess: isGetByIdSuccess } = useGetById(`${process.env.REACT_APP_ADMIN_URL}/CostCenter/${selectedRow?.id}`, 'cost-center', selectedRow?.id, onGetByIdSuccess)

  const { mutate, isSuccess } = useDelete(`${process.env.REACT_APP_ADMIN_URL}/CostCenter/${selectedRow?.id}`, "cost-center", onDeleteSuccess, onDeletError)

  const handleEdit = (rowItem) => {
    setShowLoading(true)

    setselectedRow(rowItem)
    setTimeout(() => {

      refetch()

    }, 300);

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
        Header: 'Parent Cost Center',
        accessor: 'parentCostCenter',
        Cell: ({ value }) => value?.name
      },
      {
        Header: 'Start Date',
        accessor: 'startDate',
        Cell: ({ value }) => convertDateUSA(new Date(value).toISOString())

      },
      {
        Header: 'End Date',
        accessor: 'endDate',
        Cell: ({ value }) => convertDateUSA(new Date(value).toISOString())
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ cell: { value } }) => <StatusTemplate value={value} />
      },
      {
        Header: 'Action',
        accessor: (originalRow, rowIndex) => (
          <div>
            <span onClick={() => handleEdit(originalRow)} className="btn-light me-2"><i className="far fa-edit" style={{ color: 'blue' }}></i></span>
            <span onClick={() => confirmDelete(originalRow)} className="btn-light "><i className="far fa-trash-alt" style={{ color: 'red' }}></i></span>
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
  const { modal_backdrop, setmodal_backdrop, setMinimized } = useContext(AppContext)
  function removeBodyCss() {
    document.body.classList.add("no_padding");
  }

  function tog_backdrop() {
    setmodal_backdrop(!modal_backdrop);
    removeBodyCss();
  }
  //meta title
  document.title = "Biz-360 ERP| Cost Center";

  const onsuccess = (data) => {
    console.log({ onsuccess: data });
    setUsersList(data)
  }
  const onError = (error) => {
    console.log({ error: error?.response });
  }
  const { isLoading, isFetching, data } = useGet(`${process.env.REACT_APP_ADMIN_URL}/CostCenter/GetAllCostCenters`, "cost-center", onsuccess, onError)


  useEffect(() => {

    // setShowLoading(isLoading)

    return () => {

    }
  }, [isLoading])



  if (isLoading) {
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
          </div> : null
      }

      <div className="page-content">
        <Container fluid>
          {/* Render Breadcrumbs */}
          <Breadcrumbs title="Administration" breadcrumbItem="Cost Center" />



          <Card>
            <CardBody>
              {isLoading ? "Loading users" : null}
              <TableContainer
                columns={columns}
                data={usersList}
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
          <PageForm data={data} rowInfo={rowInfo} setShowLoading={setShowLoading} modal_backdrop={modal_backdrop} setmodal_backdrop={setmodal_backdrop} setMinimized={setMinimized} />
          <SweetAlert setshowAlert={setshowAlert} showAlert={showAlert} confirmActionHandler={handleDelete} />

        </Container>
      </div>
    </React.Fragment>
  )
}

export default Users;
