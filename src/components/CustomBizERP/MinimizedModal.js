import React from 'react'
import { Card, CardBody, Modal, ModalBody, ModalFooter, } from "reactstrap";
import './index.css'

function MinimizedModal({setmodal_backdrop, setMinimized}) {
  return (
    <div className="minmaxCon">
                <Card>
                    <CardBody>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span>Minimized Modal</span> 
                    <div>
                        <button onClick={() => {setmodal_backdrop(true); setMinimized(false)}} style={{background:'none', border:'none'}} className="btn-default"><i className="far far fa-window-restore" ></i></button>
                        <button style={{background:'none', border:'none'}}><i className="far far fa-window-close"></i></button>
                        </div>
                    </div>
                       
                       
                    </CardBody>
                </Card>    
    </div>
  )
}

export default MinimizedModal