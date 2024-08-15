import React, { useRef } from 'react'
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa"

const DatepickerComponent = ({ setState }) => {

    const flatpickrRef = useRef(null);

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    return (
        <div className="input-group">

            <Flatpickr
                className="form-control form-control-sm d-block"
                placeholder="dd M,yyyy"
                options={{
                    mode: "single",
                    dateFormat: "d-M-Y"
                }}
                onChange={(e) => setState(e)}
                ref={flatpickrRef}
                style={{ borderRight: 0 }}

            />
            <div className="input-group-append">
                <span className="input-group-text" onClick={openFlatpickr}>
                    <FaCalendar />
                </span>
            </div>
        </div>
    )
}

export default DatepickerComponent