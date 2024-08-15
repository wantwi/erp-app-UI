  export function getNextTransactionDate(frequency, frequencyValue, onDay) {
    // Get the current date
    const currentDate = new Date();
  
    // Create a copy of currentDate
    let nextDate = new Date();
   

    if (frequency === 'day') {
      nextDate.setDate(currentDate.getDate() + frequencyValue);
        //return new Date(nextDate.setDate(currentDate.getDate() + frequencyValue)).toISOString()

    } else if (frequency === 'week') {
      nextDate.setDate(currentDate.getDate() + 7 * frequencyValue);

      //return new Date(nextDate.setDate(currentDate.getDate() + 7 * frequencyValue)).toISOString()

    } else if (frequency === 'month') {
      // Ensure 'onDay' is within a valid range (1-31)
      onDay = Math.min(Math.max(1, onDay), 31);
  
      // Calculate the next month and year
      let nextMonth = nextDate.getMonth() + frequencyValue;
      let nextYear = nextDate.getFullYear() + Math.floor(nextMonth / 12);
      nextMonth %= 12;
  
      // Set the date to the specified 'onDay'
      nextDate.setDate(onDay);
  
      // Move to the next month if needed
      if (onDay <= currentDate.getDate()) {
        nextDate.setMonth(nextMonth);
        nextDate.setFullYear(nextYear);
      }

      
      return new Date(nextDate).toISOString()
    } else if (frequency === 'year') {
      // Set the date to the specified 'onDay'
      nextDate.setDate(onDay);
  
      // Move to the next year if needed
      if (onDay <= currentDate.getDate() || currentDate.getMonth() !== 0) {
        nextDate.setFullYear(currentDate.getFullYear() + frequencyValue);
      }

      //return new Date(nextDate).toISOString()
    }
    // console.log({ currentDate, nextDate})
    return new Date(nextDate).toISOString();
  }


  

  export function getExpirationDate(frequency, frequencyValue, onDay) {
    const currentDate = new Date();
  
    if (frequency === 'day') {
      currentDate.setDate(currentDate.getDate() + frequencyValue);
    }
  
    if (frequency === 'week') {
      currentDate.setDate(currentDate.getDate() + 7 * frequencyValue);
    }
  
    if (frequency === 'month') {
      onDay = Math.min(Math.max(1, onDay), 31);
      currentDate.setDate(onDay);
      if (onDay <= currentDate.getDate()) {
        currentDate.setMonth(currentDate.getMonth() + frequencyValue);
      }
    }
  
    if (frequency === 'year') {
      currentDate.setDate(onDay);
      if (onDay <= currentDate.getDate() || currentDate.getMonth() !== 0) {
        currentDate.setFullYear(currentDate.getFullYear() + frequencyValue);
      }
    }
  
    // Calculate the expiration date by subtracting one day from the next transaction date
    const expirationDate = new Date(currentDate);
    expirationDate.setDate(expirationDate.getDate() - 1);
  
    return new Date(expirationDate).toISOString();
  }
  

  export const convertToMoneyText = (value)=>{
    return  value.toLocaleString('en-US', {
      style: 'currency',
      currency: "USD",


  }).replace('$', ``)
  }
