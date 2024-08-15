import toastr from "toastr";
import "toastr/build/toastr.min.css";

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
const dateTimeOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
}
let currTime = new Date().toLocaleString().replace(',', '').split(' ')[1];

let convertDateUSA = (utcString) => {
  return !utcString
    ? ''
    : new Date(utcString).toUTCString('en-US', dateOptions).substring(5,16)
}

let capFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

const moneyInTxt = (value, standard, dec = 2) => {
  var nf = new Intl.NumberFormat(standard, {
    minimumFractionDigits: dec,
    maximumFractionDigits: 2,
  })
  return nf.format(Number(value) ? value : 0.0)
}

let addDays=(date, days)=> {
  var result = new Date(date);
  result.setDate(result.getDate() + days); 
  return result;
};

const commaRemover = (value) => {
  value = value.replace(/,/g, '')
  return parseFloat(value)
}

const isValidDate=(dateObject)=>{
  return new Date(dateObject).toString() !== 'Invalid Date';
}

const validDateUK =(date)=> {
  let dateformat = /^(0?[1-9]|[1-2][0-9]|3[01])[\/](0?[1-9]|1[0-2])/;

  // Matching the date through regular expression      
  if (date.match(dateformat)) {
      let operator = date.split('/');

      // Extract the string into month, date and year      
      let datepart = [];
      if (operator.length > 1) {
          datepart = date.split('/');
      }
      let day = parseInt(datepart[0]);
      let month = parseInt(datepart[1]);
      let year = parseInt(datepart[2]);

      // Create a list of days of a month      
      let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      if (month == 1 || month > 2) {
          if (day > ListofDays[month - 1]) {
              //to check if the date is out of range
              console.log("Invalid date")     
              return false;
          }
      } else if (month == 2) {
          let leapYear = false;
          if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
          if ((leapYear == false) && (day >= 29)) {
              console.log("Invalid date")
              return false;
          }
          else
              if ((leapYear == true) && (day > 29)) {
                  console.log('Invalid date format!');
                  return false;
              }
      }
  } else {
      console.log("Invalid date format!");
      return false;
  }
  return "Valid date";
}

const calculateDays = (endDate, startDate) => {
  let noOfDays = ((new Date(endDate) - new Date(startDate)) / 86400000)
  return parseInt(noOfDays)
}


const showEasing = "swing";
const hideEasing = "linear";
const showMethod = "fadeIn";
const hideMethod = "fadeOut";
const showDuration = 300;
const hideDuration = 1000;
const timeOut = 5000;
const extendedTimeOut = 1000;

function showToast(toastType, message, title="") {

  //position class
  let positionClass = "toast-top-right";

  toastr.options = {
    positionClass: positionClass,
    timeOut: timeOut,
    extendedTimeOut: extendedTimeOut,
    closeButton: true,
    debug: true,
    progressBar: false,
    preventDuplicates: false,
    newestOnTop: true,
    showEasing: showEasing,
    hideEasing: hideEasing,
    showMethod: showMethod,
    hideMethod: hideMethod,
    showDuration: showDuration,
    hideDuration: hideDuration
  };

  // setTimeout(() => toastr.success(`Settings updated `), 300)
  //Toaster Types
  if (toastType === "info") toastr.info(message, title);
  else if (toastType === "warning") toastr.warning(message, title);
  else if (toastType === "error") toastr.error(message, title);
  else toastr.success(message, title);
}

function clearToast() {
  toastr.clear();
}


function containsObject(obj, list) {
  var x;
  for (x in list) {
      if (list.hasOwnProperty(x) && list[x] === obj) {
          return true;
      }
  }

  return false;
}

const sumValues = (values =[]) => {

  if (!values.every((value) => typeof value === 'number')) {
    throw new Error('All elements in the `values` array must be numbers');
  }

  const total = values.reduce((prev, curr) => prev + curr, 0)

  return moneyInTxt(total, "en", 2)

}

export {
  dateOptions,
  dateTimeOptions,
  convertDateUSA,
  capFirstLetter,
  moneyInTxt,
  commaRemover,
  validDateUK,
  addDays,
  isValidDate,
  calculateDays,
  currTime, showToast,containsObject,
  sumValues
}
