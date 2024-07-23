/**
 * 
 * @param {boolean} withoutBearer 
 * @returns {string}
 */
const token = (withoutBearer = false) =>
  !withoutBearer
    ? `Bearer ${localStorage.getItem("token").replaceAll('"', "")}`
    : localStorage.getItem("token").replaceAll('"', "");

export default token;
