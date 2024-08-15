import React, { useEffect, useRef, useState } from 'react'
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { FaRegCheckSquare, FaRegSquare, FaChevronRight, FaChevronDown, FaRegPlusSquare, FaRegMinusSquare, FaFolder, FaFolderOpen, FaFile, FaSquareRootAlt } from 'react-icons/fa';

import { Col, Modal, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap';
import classnames from "classnames";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { usePost } from 'hook/usePost';
import { showToast } from 'helpers/utility';
import { usePut } from 'hook/usePut';


const initialValues = { code: "", name: "", status: "Inactive", roleMenus: [] }

const getSelectedRoleMenus = (nodes, menus) => {
  const foundMenu = nodes
    .map(node => menus.find(menu => menu?.menuId === node))
    .filter(menu => menu !== undefined);

  return foundMenu;
};

const getSelectedMenuId = (nodes, menus) => {
  const foundMenu = nodes
    .map(node => menus.find(menu => menu?.menuId === node))
    .filter(menu => menu !== undefined);

  return foundMenu;
};


function UserRolesForm({ refetch, rowInfo, setRowInfo, appMenus, flatMenus, modal_backdrop, setmodal_backdrop, setMinimized, setShowLoading }) {

  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [activeTab, setactiveTab] = useState("1");
  const [isAllSelected, setisAllSelected] = useState(false)
  const checkAllRef = useRef(null)

  const validationSchema = Yup.object().shape({
    code: Yup.string().required('Code is required'),
    name: Yup.string().required('Name is required'),
    status: Yup.string(),
    roleMenus: Yup.array()
      .min(1, 'At least one menu must be selected')
      .required('At least one menu must be selected'),
  });

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setactiveTab(tab);
    }
  };

  const onsuccess = () => {
    setShowLoading(false)
    setmodal_backdrop(false)
    showToast("success", "Role Created Successfully", "Notice")
    setChecked([])
  }
  const onError = (error) => {
    setShowLoading(false)
    setmodal_backdrop(true)
    showToast("error", error?.message, "Notice")
  }

  const onPutError = (error) => {

    //console.log({ onPutError: error });
    showToast("error", error?.message, "Notice")

    setShowLoading(false)
  }

  const onPutSuccess = (data) => {
    setShowLoading(false)
    showToast("success", "Role Updated Successfully", "Notice")

  }

  const { mutate, isSuccess, isLoading: isPostLoading } = usePost(`${process.env.REACT_APP_ADMIN_URL}/Roles`, "roles", onsuccess, onError)

  const { mutate: putMutate, isSuccess: isPutSuccess, isLoading: isPutLoading } = usePut(`${process.env.REACT_APP_ADMIN_URL}/Roles/${rowInfo?.id}`, "roles", onPutSuccess, onPutError)


  const formik = useFormik({
    initialValues,
    validationSchema,

    onSubmit: (values, { resetForm }) => {

      setShowLoading(true)

      const formObj = {
        ...values,
        roleMenus: getSelectedRoleMenus(values?.roleMenus.map(x => +x), flatMenus)
      }

      //console.log({ values, formObj });
      //putMutate({...values, status:Number(values?.status)})
      rowInfo?.id ? putMutate(formObj) :
        mutate(formObj)

    },
  });

  const onCheck = (checkedValues) => {
    setChecked(checkedValues);
    formik.setFieldValue('roleMenus', checkedValues)
    if (checkedValues.length === flatMenus.length) {
      setisAllSelected(true)
      //console.log({checkAllRef1:checkAllRef});
      if (!checkAllRef.current.checked) {
        checkAllRef.current.click()
      }


    } else {
      setisAllSelected(false)
      if (checkAllRef.current.checked) {
        checkAllRef.current.checked = false
        checkAllRef.current.defaultChecked = false
      }
      //console.log({checkAllRef2:checkAllRef});
      //checkAllRef.current.defaultChecked = false
    }
  };

  const onExpand = (expandedValues) => {
    setExpanded(expandedValues);
  };

  const handleStatusChange = (evnt) => {
    if (evnt.target.checked) {
      formik.setFieldValue('status', "Active")
    } else {
      formik.setFieldValue('status', "Inactive")
    }
  }

  useEffect(() => {
    //checkAllRef.current?.checked = false
    //checkAllRef.current?.defaultChecked = false
    setisAllSelected(false)
    setChecked([])
    formik.resetForm()

    //console.log({ rowInfo });
    if (rowInfo?.id) {

      // const selecteRoleMenu = getSelectedMenuId(rowInfo?.rolesMenus?.flattenMenus, flatMenus)


      //console.log({ selectedMenus: rowInfo });
      setChecked(rowInfo?.roleMenus);
      formik.setFieldValue('roleMenus', rowInfo?.roleMenus)
      formik.setFieldValue('status', rowInfo?.status)
      formik.setFieldValue('code', rowInfo?.code)
      formik.setFieldValue('name', rowInfo?.name)
      if (rowInfo?.roleMenus.length === flatMenus.length) {
        setisAllSelected(true)
      }
      setmodal_backdrop(true)
    }


    return () => {

    }
  }, [])

  const restRoleform = () => {
    formik.resetForm()
    setmodal_backdrop(false);
    setRowInfo({})
    setChecked([])
    // checkAllRef.current.checked = false
    // checkAllRef.current.defaultChecked = false
    setisAllSelected(false)
    if (checkAllRef.current.checked) {
      checkAllRef.current.checked = false
      checkAllRef.current.defaultChecked = false
    }
  }
  const handleAllChecked = (event) => {
    setisAllSelected(!isAllSelected)
    if (event.target.checked) {
      setChecked(flatMenus.map(x => `${x?.menuId}`));
      formik.setFieldValue('roleMenus', flatMenus.map(x => `${x?.menuId}`))

    } else {
      setChecked([])
      formik.setFieldValue('roleMenus', [])
    }
  }

  const handleLabelClick = () => {
    setisAllSelected(!isAllSelected)
    checkAllRef.current.click()

  }
  // useEffect(() => {
  //   if(rowInfo?.roleMenus.length === flatMenus.length){
  //     setisAllSelected(true)
  // }else{
  //   setisAllSelected(false)
  //   checkAllRef.current.checked = false
  // }

  //   return () => {

  //   }
  // }, [checked])

  //console.log({checked, flatMenus});
  return (
    <Modal
      isOpen={modal_backdrop}
      toggle={() => {
        tog_backdrop();
      }}
      backdrop={'static'}
      id="staticBackdrop"
    >
      <div className="modal-header">
        <h5 className="modal-title" id="staticBackdropLabel">
          {rowInfo?.id ? `Edit ${rowInfo?.name}` : 'Add Role'}</h5>

        <div>
          <button onClick={() => { setmodal_backdrop(false); setMinimized(true) }} style={{ border: 'none', background: 'none' }} type="button"> <i className="mdi mdi-window-minimize"></i> </button>
          <button type="button" className="btn-close" style={{ border: 'none', background: 'none' }}
            onClick={restRoleform} aria-label="Close"><i className="mdi mdi-close"></i></button>
        </div>
        {/* <h5 className="modal-title" id="staticBackdropLabel">Add Role</h5>
        <button type="button" className="btn-close"
          onClick={() => {
            setmodal_backdrop(false);
          }} aria-label="Close"></button> */}
      </div>
      <form onSubmit={formik.handleSubmit}>
        <div className="modal-body">
          <div className="row">
            <div className="col col-md-3">
              <div className={`mb-3 ${formik.touched.code && formik.errors.code ? 'has-error' : ''}`}>
                <label className="form-label">Code <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="code"
                  className={`form-control form-control-sm ${formik.touched.code && formik.errors.code ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.code}
                  autoComplete="off"
                  placeholder="Code"
                />
                {formik.touched.code && formik.errors.code && <div className="text-danger">{formik.errors.code}</div>}
              </div>
            </div>
            <div className="col col-md-9">
              <div className={`mb-3 ${formik.touched.name && formik.errors.name ? 'has-error' : ''}`}>
                <label className="form-label">Name <i className="text-danger">*</i></label>
                <input
                  type="text"
                  name="name"
                  className={`form-control form-control-sm ${formik.touched.name && formik.errors.name ? 'is-invalid' : ''}`}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                  autoComplete="off"
                  placeholder="Enter account name"
                />
                {formik.touched.name && formik.errors.name && <div className="text-danger">{formik.errors.name}</div>}
              </div>
            </div>
          </div>
          <div className="form-check form-check-end"  >

            <input
              className="form-check-input"
              type="checkbox"
              id="isCashAccount"
              name="isCashAccount"
              ref={checkAllRef}
              onChange={handleAllChecked}
              defaultChecked={isAllSelected}
            />
            <label
              className="form-check-label"
              htmlFor="defaultCheck2"
              onClick={handleLabelClick}
            >
              Select All
            </label>
          </div>
          <Nav>
            <NavItem>
              <NavLink
                style={{ cursor: "pointer", }}
                className={classnames({
                  active: activeTab === "1",
                })}
                onClick={() => {
                  toggleTab("1");
                }}
              >
                Menus
              </NavLink>
            </NavItem>
            {/* <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              className={classnames({
                active: activeTab === "2",
              })}
              onClick={() => {
                toggleTab("2");
              }}
            >
              
            </NavLink>
          </NavItem> */}


          </Nav>
          <TabContent activeTab={activeTab} className="p-3 text-muted">
            <TabPane tabId="1">
              <Row>
                <Col sm="12">
                  <div style={{ minHeight: "20vh", maxHeight: "45vh", overflowY: "scroll" }}>
                    <CheckboxTree
                      nodes={appMenus}
                      checked={checked}
                      expanded={expanded}
                      onCheck={onCheck}
                      onExpand={onExpand}
                      icons={{
                        check: <FaRegCheckSquare />,
                        uncheck: <FaRegSquare />,
                        halfCheck: <FaRegMinusSquare />,
                        expandClose: <FaChevronRight />,
                        expandOpen: <FaChevronDown />,
                        expandAll: <FaRegPlusSquare />,
                        collapseAll: <FaRegMinusSquare />,
                        parentClose: <FaFolder style={{ color: "slateblue" }} />,
                        parentOpen: <FaFolderOpen style={{ color: "slateblue" }} />,
                        leaf: <FaFile />
                      }}

                    />
                  </div>


                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <Row>
                <Col sm="12">

                </Col>
              </Row>
            </TabPane>


          </TabContent>
          {formik.touched.roleMenus && formik.errors.roleMenus && <div className="text-danger">{formik.errors.roleMenus}</div>}
          <div className="col-6">
            <div className="mb-3">
              <label className="form-label">Status </label>
              <div className="form-check form-switch form-switch-md mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="customSwitchsizemd"
                  onChange={handleStatusChange} defaultChecked={rowInfo.status === "Active" ? true : false}
                />
                <label
                  className="form-check-label"
                  htmlFor="customSwitchsizemd"
                >
                  {formik.values.status === "Active" ? "Active" : "Inactive"}
                </label>
              </div>

            </div>
          </div>
          {/* <div className="mb-3">
            <label className="form-label">&nbsp;</label>
            <div className="input-group input-group-sm">
              Status &nbsp; &nbsp;
              <div className="form-check form-switch">
                <input className="form-check-input switch-status" onChange={handleStatusChange} defaultChecked={rowInfo.status === "Active" ? true : false} type="checkbox" id="chkStatus" />
              </div>
            </div>
          </div> */}
        </div>
        <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between" }}>
          <div></div>
          <div>
            <button type="button" className="btn btn-sm btn-light" onClick={restRoleform}>Close</button>
            <button type="submit" className="btn btn-sm btn-success"><i className="fas fa-save me-2"></i>{rowInfo?.id ? 'Update' : "Save"}</button>
          </div>

        </div>
      </form>
    </Modal>
  )
}

export default UserRolesForm