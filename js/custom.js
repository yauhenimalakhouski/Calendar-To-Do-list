let items = restoreItems();
let currentMonth = new Date();

let shownMonth = document.querySelector('#bdaymonth');
shownMonth.value = moment(new Date(currentMonth)).format("YYYY-MM");

renderCalendar(currentMonth);

let taskListContainer = document.querySelector('.task_list');
taskListContainer.innerHTML = generateTaskListInMenu(getIdOfCurrentDay());

let currentDate = document.querySelector('.task_date');
currentDate.textContent = getCurrentDate(currentMonth);
renderTasksInAllDaysInCalendar();
renderAllTasksInMenu(getIdOfCurrentDay());
highlightToday(getIdOfToday());

function renderWeekDays() {
  return `
    <div class = 'weekdays-wrapper'>
    ${WEEK_DAYS.map(weekDay => `<div class = 'week_day'>${weekDay}</div>`).join("")}
    </div>
  `;
}

function generateCurrnetMonthDays(date) {
  const daysInMonth = getDaysInMonth(date);
  let html = '';
  for(let i=1; i<=daysInMonth; i++){
    html += `<div class='day event' data-date='${new Date(date.getFullYear(), date.getMonth(), i).getTime()}'><span class="event">${i}</span><ul class="event"></ul><span class="event" data-counter="0" hidden=""></span></div>`;
  }
  return html;
}

function generatePrevMonthDays(date) {
  let dayCount = getFirstDay(date).getDay()-1;
  if(dayCount===-1) {
    dayCount=6;
  } 
  const prevMonth = getPrevMonth(date);
  const daysInMonth = getDaysInMonth(prevMonth);
  const days = [];
  for (let i = dayCount; i > 0; i--) {
    days.push(daysInMonth - i + 1);
  }
  return days.map(day => `<div class='day event prev_month_day' data-date='${new Date(date.getFullYear(), date.getMonth()-1, day).getTime()}'><span class="event">${day}</span><ul class="event"></ul><span class="event" data-counter="0" hidden=""></span></div>`).join("");
}

function generateNextMonthDays(date) {
  const dayCount = 7 - getLastDay(date).getDay();
  const nextMonth = getNextMonth(date);
  const daysInMonth = getDaysInMonth(nextMonth);
  const days = new Array(daysInMonth).fill(0).map((e, i) => i + 1).slice(0, dayCount);
  return days.map(day => `<div class='day event next_month_day' data-date='${new Date(date.getFullYear(), date.getMonth()+1, day).getTime()}'><span class="event">${day}</span><ul class="event"></ul><span class="event" data-counter="0" hidden=""></span></div>`).join("");
}

function renderCalendarDays(date) {
  return `
  <div class='days_container'>
  ${generatePrevMonthDays(date)}
  ${generateCurrnetMonthDays(date)}
  ${generateNextMonthDays(date)}
  </div>
  `;
}

function renderCalendar(date) {
  const container = document.querySelector('.calendar');
  container.innerHTML = `
  ${renderWeekDays()}
  ${renderCalendarDays(date)}
  `;
}

function showPrevMonth() {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
  shownMonth.value = moment(new Date(currentMonth)).format("YYYY-MM");
  renderCalendar(currentMonth);
  renderTasksInAllDaysInCalendar();
  highlightToday(getIdOfToday());
}

function showNextMonth() {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
  shownMonth.value = moment(new Date(currentMonth)).format("YYYY-MM");
  renderCalendar(currentMonth);
  renderTasksInAllDaysInCalendar();
  highlightToday(getIdOfToday());
}

function changeMonth(event) {
  currentMonth = event.target.valueAsDate;
  renderCalendar(currentMonth);
  renderTasksInAllDaysInCalendar();
  highlightToday(getIdOfToday());
}

function highlightToday(id) {
  let day = document.querySelector(`[data-date = '${id}']`);
  if(day === null){
    return;
  }
  day.classList.add('highlightToday');
}

function highlightPickedDay(id) {
  let allDays = Array.from(document.querySelectorAll(`.day`));
  allDays.forEach(day => day.classList.remove('highlightPickedDay'));
  let pickedDay = document.querySelector(`[data-date='${id}']`);
  pickedDay.classList.add('highlightPickedDay');
}

function renderTasksInAllDaysInCalendar() {
  let allDays = Array.from(document.querySelectorAll(`.day`));
  allDays.forEach(day => renderAllTasksInCalendarDay(day.dataset.date));   
}

function generateTaskListInMenu(id) {
  return `
  <div class="task_menu">
    <div class="task_date" data-id="${id}"></div>
    <button type="button" class="btn_add_task" onclick="addTaskFromDialog()"></button>  
  </div>
  <span>Scheduled tasks for the day:</span>
  <ul class="list" data-id="${id}"></ul>
  `;
}

function renderAllTasksInMenu(dayId) {
  let currentTaskList = document.querySelector('.list');
  let forDayItems = items.filter(day => +day.id === +dayId);
  forDayItems.forEach(task => {
    currentTaskList.append(generateItemTaskInMenu(task));
  });
}

function generateItemTaskInMenu(item) {
  let newTask = document.createElement('li');
  newTask.setAttribute('taskId', item.taskId);
  newTask.taskId = item.taskId;
  newTask.innerHTML = `
  <span class="event">${item.text}</span>
  <button type="button" class="delete-button" onclick="deleteTask(event)">Complete</button>
  `;
  return newTask;
}

function generateItemTaskInCalendar(item) {
  let newTask = document.createElement('li');
  newTask.classList.add('event'); 
  newTask.setAttribute('taskId', item.taskId);
  newTask.innerHTML = `${item.text}`;
  return newTask;
}

async function addTaskFromDialog() {
  const textTask = await openDialogWindow(event);
  if(textTask !== undefined && textTask !== ""){
      addTask(textTask);
  }
}

function addTask(text) {
  taskList = document.querySelector('.list');
  const newItem = {
    id: taskList.dataset.id,
    taskId: Date.now(),
    text: text,
  }
  items.push(newItem);
  storeItems(); 
  taskList.append(generateItemTaskInMenu(newItem));
  addTaskToCalendar(newItem);
}

function addTaskToCalendar(item) {
  const day = document.querySelector(`.day[data-date='${item.id}'] ul`);
  let countOfMoreTask = document.querySelector(`.day[data-date='${item.id}'] [data-counter]`);
  countOfMoreTask.dataset.counter++;
  let countOfTasks = countOfMoreTask.dataset.counter;
  let taskInCalendar = document.createElement('li');
  taskInCalendar.classList.add('event');
  taskInCalendar.setAttribute('taskId', item.taskId);
  taskListContainer.classList.add("event");
  taskInCalendar.textContent = `${item.text}`;
  if(+countOfTasks === 3) {
    day.append(taskInCalendar);
    processThreeTask(day, countOfMoreTask, countOfTasks);
    return;
  }
  if(countOfTasks > 3) {
    day.append(taskInCalendar);
    processMoreThenThreeTask(day, countOfMoreTask, countOfTasks);
    return;
  }
  day.append(taskInCalendar);
}

function renderAllTasksInCalendarDay(dayId) {
  let currentTaskList = document.querySelector(`.day[data-date='${dayId}'] ul`);
  let forDayItems = items.filter(day => +day.id === +dayId);
  forDayItems.forEach(task => {
  const day = document.querySelector(`.day[data-date='${dayId}'] ul`);
  let countOfMoreTask = document.querySelector(`.day[data-date='${dayId}'] [data-counter]`);
  countOfMoreTask.dataset.counter++;
  let countOfTasks = countOfMoreTask.dataset.counter;
  currentTaskList.append(generateItemTaskInCalendar(task));
  if(+countOfTasks === 3) {
    processThreeTask(day, countOfMoreTask, countOfTasks);
    return;
  }
  if(countOfTasks > 3) {
    processMoreThenThreeTask(day, countOfMoreTask, countOfTasks);
    return;
  }
  });
}

function deleteTask(task) {
  task.target.parentElement.remove();
  const idToDelete = task.target.parentElement.taskId;
  let currentTaskInCalendar = document.querySelector(`[taskid="${idToDelete}"]`);
  let day = currentTaskInCalendar.parentElement;
  let moreTasksCount = day.nextElementSibling;
  if(+moreTasksCount.dataset.counter > 0 && +moreTasksCount.dataset.counter < 3){
    currentTaskInCalendar.remove();
    moreTasksCount.dataset.counter--;
  } else if(+moreTasksCount.dataset.counter === 3){
    currentTaskInCalendar.remove();
    moreTasksCount.dataset.counter--;
    for(let task of day.childNodes){
      task.removeAttribute('hidden');
    }
    moreTasksCount.hidden = true;
  } else if(+moreTasksCount.dataset.counter > 3){
    currentTaskInCalendar.remove();
    moreTasksCount.dataset.counter--;
    moreTasksCount.textContent=`+ ${moreTasksCount.dataset.counter-1} more`
  } else {
    currentTaskInCalendar.remove();
  }
  items = items.filter(item => item.taskId !== idToDelete);
  storeItems();
}

function showCurrentMonth(){
  let currentDate = document.querySelector('.task_date');
  currentDate.textContent = getCurrentDate(new Date());
  currentMonth = new Date();
  renderCalendar(new Date());
  let currentTaskList = document.querySelector('.list');
  renderTasksInAllDaysInCalendar();
  if(currentTaskList.childNodes.length !== 0){
    let tasks = Array.from(currentTaskList.childNodes);
    tasks.map(task => task.remove());
  }
  renderAllTasksInMenu(getIdOfToday());
  shownMonth.value = moment(new Date()).format("YYYY-MM");
  highlightToday(getIdOfToday());
}

let calendarDaysContainer = document.querySelector('.calendar');
calendarDaysContainer.addEventListener('click', dayTasksOpened);


function dayTasksOpened(event){
  if (!event.target.classList.contains("event")) {
    return;
  }
  taskListContainer.innerHTML = generateTaskListInMenu(event.target.closest(".day").dataset.date);
  currentDate = document.querySelector('.task_date');
  currentDate.textContent = getCurrentDate(event.target.closest(".day").dataset.date);
  renderAllTasksInMenu(event.target.closest(".day").dataset.date);
  highlightPickedDay(event.target.closest(".day").dataset.date);
}
