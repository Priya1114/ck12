const {
  getBookId,
  makeAPICall,
  sortDataBySequence,
  setNotFoundText,
  addLoaderToContainer,
  removeLoaderFromContainer,
} = utils;

let fetchingChaptersStatus = new Map();

// this function handles show and hide of chapter content
async function onClickChapter(e) {
  const elementId = e.target.className === 'chapter-name' ? e.target.id : e.target.parentNode.id;
  const elementIndex =  e.target.getAttribute('data-index');
  const chapterContentWrapper = document.getElementById(`chapter-content-${elementId}`);
  if (e.target.className === 'chapter-name' || e.target.className === 'chapter-title') {
    chapterContentWrapper.classList.toggle('show');
    const chapter = document.getElementById(`chapter-${elementId}`)
    chapter.classList.toggle('extended-tab');

    if(!fetchingChaptersStatus[elementId]) {
      fetchingChaptersStatus[elementId] = true;
      addLoaderToContainer(chapterContentWrapper);
      chapterContent = await getBookLessons(elementId, Number(elementIndex));
      removeLoaderFromContainer(chapterContentWrapper);
      chapterContentWrapper.appendChild(chapterContent);
    }

  }
}

// this function sets each lesson's title
function renderLessons(item, index, chapterIndex, length) {
  const lesson = document.createElement('div');
  lesson.classList.add('lesson');

  // this is to add progress line below progress circle, to each lesson except last one
  if(index != length-1) {
    lesson.classList.add('progress-line');
  }

  const progress = document.createElement('div');
  progress.classList.add('progress-circle');
  let progressTitle = 'Not started';

  // updating progress circle for completed lessons
  if(item.status === 'COMPLETE') {
    progress.classList.add('status-completed');
    lesson.style.color = '#13aa5a';
    progressTitle = 'Completed';
  }
  // updating progress circle for in-progress lessons
  else if(item.status === 'IN_PROGRESS') {
    progress.classList.add('status-in-progress');
    lesson.style.color = '#f2be54';
    progressTitle = 'In Progress';
  }
  progress.setAttribute('title', progressTitle);

  const title = document.createElement('div');
  const titleText = document.createTextNode(`${chapterIndex+1}.${index+1} ${item.title}`);
  title.classList.add('lesson-title');
  title.appendChild(titleText);

  lesson.appendChild(progress);
  lesson.appendChild(title);
  return lesson;
}

// this function renders lesson details of each respective chapter
async function getBookLessons (chapterId, chapterIndex) {
  const data = await makeAPICall(`/${getBookId()}/section/${chapterId}`);
  const chapterContent = document.createElement('div');

  // if Book detail exists
  if(data.status === 'OK') {
    for ([index, item] of sortDataBySequence(data.response[chapterId]).entries()) {
      const lesson = await renderLessons(item, index, chapterIndex, data.response[chapterId].length);
      chapterContent.appendChild(lesson);
    }
  }
  // book or section not found in DB
  else {
    setNotFoundText(chapterContent);
  }
  return chapterContent;
}

// this function sets each chapter's title and ratio in the containerCard
async function renderChapter (item, index) {
  fetchingChaptersStatus.set(item.id, false);

  const chapter = document.createElement('div');
  chapter.classList.add('chapter');
  chapter.setAttribute('id', `chapter-${item.id}`);

  const chapterDetails = document.createElement('div');
  chapterDetails.classList.add('chapter-name');
  chapterDetails.setAttribute('id', item.id);

  // set chapter title
  const title = document.createElement('div');
  title.classList.add('chapter-title');
  title.setAttribute('data-index', index);
  const titleText = document.createTextNode(`${index+1}. ${item.title}`);
  title.appendChild(titleText);

  // set number of lessons completed out of total
  const chapterCount = document.createElement('div');
  chapterCount.classList.add('chapter-count');
  const progressMeter = document.createElement('progress');
  progressMeter.classList.add('progress-meter');
  progressMeter.setAttribute('value', `${item.completeCount? item.completeCount : 0}`);
  progressMeter.setAttribute('max', `${item.childrenCount}`);
  chapterCount.appendChild(progressMeter);
  const ratioText = document.createTextNode(`${item.completeCount? item.completeCount : 0}/${item.childrenCount}`)
  chapterCount.appendChild(ratioText);

  chapterDetails.appendChild(title);
  chapterDetails.appendChild(chapterCount);

  chapter.appendChild(chapterDetails);

  const chapterContent = document.createElement('div');
  chapterContent.classList.add('chapter-content');
  chapterContent.setAttribute('id', `chapter-content-${item.id}`);

  chapter.appendChild(chapterContent);
  return chapter;
}

// this function renders the each chapter details
async function getBookDetails() {
  const data = await makeAPICall(`/${getBookId()}`);
  const containerCard = document.querySelector('.container-card');

  // If Book exists in DB
  if(data.status === 'OK') {
    const chaptersList= data.response;
    for ([index, item] of chaptersList.entries()) {
      const chapter = await renderChapter(item, index);
      containerCard.appendChild(chapter);
      containerCard.addEventListener('click', onClickChapter);
    }
  }
  else {
    setNotFoundText(containerCard);
  }
}

function setHeader() {
  const header = document.querySelector('.header');
  const headerContent = document.createElement('div');
  headerContent.classList.add('header-content');
  const headText = document.createTextNode(getBookId().slice(0,1).toUpperCase() + getBookId().slice(1));
  headerContent.appendChild(headText);
  header.appendChild(headerContent);
}

window.onload = function (){
  setHeader();
  getBookDetails();
}