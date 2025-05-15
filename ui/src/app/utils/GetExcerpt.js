export const getExcerptHtml = (html, length) => {
  if (!html || !length) return;

  const div = document.createElement('div');
  div.innerHTML = html;

  let currentLength = 0;
  let done = false;

  const truncateNode = (node) => {
    if (done) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      const remaining = length - currentLength;
      if (node.textContent.length <= remaining) {
        currentLength += node.textContent.length;
        return node.cloneNode();
      } else {
        const truncated = node.textContent.substring(0, remaining);
        currentLength = length;
        done = true;
        return document.createTextNode(truncated + '...');
      }
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === 'img') {
        // Skip <img> tags completely
        return null;
      }

      const newNode = node.cloneNode(false);
      for (let child of node.childNodes) {
        const truncatedChild = truncateNode(child);
        if (truncatedChild) newNode.appendChild(truncatedChild);
        if (done) break;
      }
      return newNode;
    }

    return null;
  };

  const excerptContainer = document.createElement('div');
  for (let child of div.childNodes) {
    const truncated = truncateNode(child);
    if (truncated) excerptContainer.appendChild(truncated);
    if (done) break;
  }

  return excerptContainer.innerHTML;
};



export const getExcerptText = (text, length) => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};
