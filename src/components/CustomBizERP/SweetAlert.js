import React from 'react'
import { Alert, Modal, UncontrolledAlert } from 'reactstrap';

const SweetAlert = ({message="Do you want to delete this record?",setshowAlert,showAlert, confirmActionHandler}) => {
    return (
        <Modal
            isOpen={showAlert}
           className='modal-dialog-centered'
            backdrop={'static'}
            id="staticBackdrop"
        >
            <div className="modal-header bg-gradient" style={{background:"#f8d7da"}}>
                <h5 className="modal-title" id="staticBackdropLabel"> <i className="mdi mdi-alert-outline me-2"></i> Alert</h5>
                <button type="button" className="btn-close"
                    onClick={() => {
                        setshowAlert(false);
                    }} aria-label="Close"></button>
            </div>
            {/* <div className="modal-body"> */}
            <div className="modal-body" style={{fontSize:16, height:100, display:"grid", placeContent:"center", color:"#753333"}}>
                   {
                    message
                   }
                    
                </div>
            {/* </div> */}
            <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => {
                    setshowAlert(false);
                }}>Close</button>
                <button type="button" onClick={confirmActionHandler} className="btn btn-success">Confirm</button>
            </div>
        </Modal>
    )
}

export default SweetAlert