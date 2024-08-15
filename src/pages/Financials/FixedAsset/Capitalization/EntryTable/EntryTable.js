import React, { useState } from 'react'
import "./AccountTable.css"
import { Table } from 'reactstrap'
import {useForm, useFieldArray} from "react-hook-form"

const defaultvalue ={account:"", credit:"", debit:"",commnet:""}

const EntryTable = () => {
    const [formRows, setFormRows] = useState([{ id: 1 }]);

    const [inputValues, setInputValues] = useState([]);

    const removeItemAtIndex = (array, index) => {
        if (index >= 0 && index < array.length) {
            array.splice(index, 1);
        }
        return array;
    };
    

    const handleInputChange = (e, rowIndex, columnIndex) => {
        const { name, value } = e.target;
        const newInputValues = [...inputValues];
        
        if (!newInputValues[rowIndex]) {
            newInputValues[rowIndex] = {};
        }
        
        newInputValues[rowIndex][name] = value;
        setInputValues(newInputValues);
    };

    const onAddFormRow = () => {
        const modifiedRows = [...formRows];
        modifiedRows.push({ id: modifiedRows.length + 1 });
        setFormRows(modifiedRows);

        console.log({inputValues});
    };

    const onDeleteFormRow = id => {
       
        if (id !== 1) {
            var modifiedRows = [...formRows];
            modifiedRows = modifiedRows.filter(x => x["id"] !== id);
            setFormRows(modifiedRows);

            setInputValues(prevInputValues => removeItemAtIndex([...prevInputValues], id-1));
        }
    };

    const {control,register,formState:{errors}} = useForm({
        defaultValues:{
            entries:[defaultvalue]
        }
    })

    const {append,remove,fields} = useFieldArray({
        name:"entries",
        control,
        rules:{
            required:"Please provide at least one GL entry"
        }
    })

    return (
        <div className="view main-card-body">
            <div className="wrapper">
                <div className="table-wrapper">
                    <Table className="table table-hover table-bordered" style={{ fontSize: '0.9em !important' }}>
                        <thead className="table-light">
                            <tr>
                                <th></th>
                                <th>Account</th>
                                <th>Credit</th>
                                <th>Debit</th>
                                <th>Comment</th>
                                <th></th>
                            </tr>


                        </thead>

                        <tbody id="cost_area_TableBody">
                            {
                                fields.map((field,index)=>(

                                    <tr key={index}>
                                    <td>{index+1}</td>
                                    <td>
                                        <select className='form-select' 
                                        name='account'
                                        id={`animate-item-name-${index}`}
                                       {...register(`entries.${index}.account`,{required:true})}
                                        >
                                            <option>Select Account Select Account </option>

                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="name"
                                           
                                            className="form-control"
                                            placeholder="Credit"
                                            {...register(`entries.${index}.credit`,{required:true})}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                          
                                            className="form-control"
                                            placeholder="debit"
                                            {...register(`entries.${index}.debit`,{required:true})}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            id="comment"
                                            className="form-control"
                                            placeholder="Comment"
                                            {...register(`entries.${index}.comment`)}
                                        ></textarea>
                                    </td>
                                    <td>
                                        <button className='btn btn-danger btn-sm' onClick={() => remove(index-1)}><i className='fa fa-trash'></i></button>{" "}
                                       
                                    </td>
                                </tr>

                                ))
                            }
                            {/* {(formRows || []).map((formRow, key) => (
                                <tr key={key}>
                                    <td>{key + 1}</td>
                                    <td>
                                        <select className='form-select' 
                                        name='account'
                                        value={inputValues[key]?.account || ''}
                                        onChange={(e) => handleInputChange(e, key, 0)}
                                        >
                                            <option>Select Account Select Account </option>

                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            id="name"
                                            name="credit"
                                            className="form-control"
                                            placeholder="Credit"
                                            value={inputValues[key]?.credit || ''}
                                        onChange={(e) => handleInputChange(e, key, 1)}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                          
                                            className="form-control"
                                            placeholder="debit"
                                            name="debit"
                                            value={inputValues[key]?.debit || ''}
                                            onChange={(e) => handleInputChange(e, key, 2)}
                                        />
                                    </td>
                                    <td>
                                        <textarea
                                            id="comment"
                                            className="form-control"
                                            placeholder="Comment"
                                            name="comment"
                                            value={inputValues[key]?.comment || ''}
                                            onChange={(e) => handleInputChange(e, key, 3)}
                                        ></textarea>
                                    </td>
                                    <td>
                                        <button className='btn btn-danger btn-sm' onClick={() => onDeleteFormRow(formRow.id)}><i className='fa fa-trash'></i></button>{" "}
                                        <button className='btn btn-primary btn-sm' onClick={() => onAddFormRow()}><i className='fa fa-plus'></i></button>
                                    </td>
                                </tr>
                            ))} */}

                        </tbody>
                    </Table>
                    <button className='btn btn-primary btn-sm' onClick={() => append(defaultvalue)}><i className='fa fa-plus'></i></button>
                </div>
            </div>
        </div>
    )
}

export default EntryTable