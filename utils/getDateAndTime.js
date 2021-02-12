const convertTZ = (date, tzString) => {
  return new Date(
    (typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {
      timeZone: tzString,
    })
  );
};

const getDateAndTime = (dateObj) => {
  dateObj = convertTZ(dateObj, "Asia/Kolkata");
  dateObj = dateObj.toString();

  const pos = dateObj.indexOf(":") - 2;
  return [
    dateObj.substring(4, pos),
    dateObj.substring(pos, pos + 5) + " (IST)",
  ];
};

module.exports = {
  getDateAndTime,
};
