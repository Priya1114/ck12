const utils = (function () {

  function getBookId () {
    return window.location.pathname.replace('/book/', '');
  }

  function sortDataBySequence (data) {
    return data.sort((a, b) => a.sequenceNO - b.sequenceNO)
  }

  function makeAPICall (url) {
    const endpoint = `http://localhost:3000/api/book${url}`;

    return fetch(endpoint)
      .then((response) => response.json())
      .then((response) => response);
  }

  function setNotFoundText (container) {
    let text = `Oops! Data Not Found :(`;
    container.classList.add('not-found');
    container.appendChild(document.createTextNode(text));
  }

  const loading = document.createElement('div');
  const loader = document.createElement('div');

  function addLoaderToContainer (container) {
    loading.classList.add('loading');
    loader.classList.add('loader');
    loading.appendChild(loader);
    container.appendChild(loading);
  }

  function removeLoaderFromContainer(container) {
    loading.removeChild(loader);
    container.removeChild(loading);
  }

  return {
    getBookId,
    makeAPICall,
    sortDataBySequence,
    setNotFoundText,
    addLoaderToContainer,
    removeLoaderFromContainer,
  }

}());