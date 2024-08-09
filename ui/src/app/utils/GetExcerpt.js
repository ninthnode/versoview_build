const getExcerpt = (text, length) => {
  if (!text | !length) return;
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
export default getExcerpt;
