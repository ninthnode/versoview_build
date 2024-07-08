const FormatDate = (dateString) => {
    const date = new Date(dateString);
  
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedDate = `${monthName} ${day}, ${year} ${hours}:${minutes}`;
    return formattedDate;
};

export default FormatDate;

