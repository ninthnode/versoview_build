const getExcerpt = (html, length) => {
  let text = stripHtml(html)
  if (!text || !length) return;
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export default getExcerpt;