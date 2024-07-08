const DateTimeFormate = (dateString) => {
    const date = new Date(dateString);
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    let ampm = 'AM';
    
    // Convert hours to 12-hour format
    if (hours >= 12) {
        ampm = 'PM';
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }
    const formattedDate = `${monthName} ${day} | ${hours}:${minutes} ${ampm}`;
    return formattedDate;
};

export default DateTimeFormate;

