import React, { useRef } from 'react'
import "flatpickr/dist/themes/material_blue.css";
import Flatpickr from "react-flatpickr";
import { FaCalendar } from "react-icons/fa"

const DatepickerFormControl = ({ name, control, Controller }) => {

    const flatpickrRef = useRef(null);

    const openFlatpickr = () => {
        flatpickrRef?.current?.flatpickr.open();
    };

    return (
        <div className="input-group">

            <Controller
                name={name}
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <Flatpickr
                        {...field}
                        className="form-control form-control-sm"
                        placeholder="dd M, yyyy"
                        options={{
                            altInput: true,
                            altFormat: "d M, Y",
                            dateFormat: "Y-m-d"
                        }}
                        ref={flatpickrRef}
                    />
                )}
            />
            <div className="input-group-append">
                <span className="input-group-text" onClick={openFlatpickr}>
                    <FaCalendar />
                </span>
            </div>
        </div>
    )
}

export default DatepickerFormControl