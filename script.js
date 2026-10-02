const introDialog = document.getElementById("intro-dialog");
const introDialogClose = document.getElementById("intro-dialog-close");

////// DIALOG //////
// open dialog
introDialog.showModal();

// add event listener to the dialog close button
introDialogClose.addEventListener("click", function closeIntroDialog() {
  introDialog.close();
});

// introDialog.addEventListener("close", toneInit);

////// CALENDAR //////

const monthYear = document.getElementById("month-year");
const daysContainer = document.getElementById("days");

const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const eventDialog = document.getElementById("event-dialog");
const eventForm = document.getElementById("event-form");
const eventDialogTitle = document.getElementById("event-dialog-title");
const eventName = document.getElementById("event-name");
const eventDate = document.getElementById("event-date");
const eventTime = document.getElementById("event-time");
const eventDelete = document.getElementById("event-delete");
const sliders = {
  excitement: document.getElementById("event-excitement"),
  energy: document.getElementById("event-energy"),
  social: document.getElementById("event-social"),
};

let currentDate = new Date();
let editingEventId = null;
let events = JSON.parse(localStorage.getItem("calendar-events") || "[]");

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function saveEvents() {
  localStorage.setItem("calendar-events", JSON.stringify(events));
}

function openEventEditor(dateKey, eventToEdit = null) {
  editingEventId = eventToEdit ? eventToEdit.id : null;
  eventDialogTitle.textContent = eventToEdit ? "Edit event" : "Add event";
  eventName.value = eventToEdit?.name || "";
  eventDate.value = eventToEdit?.date || dateKey;
  eventTime.value = eventToEdit?.time || "12:00";

  Object.keys(sliders).forEach((attribute) => {
    sliders[attribute].value = eventToEdit?.[attribute] ?? 50;
  });

  eventDelete.hidden = !eventToEdit;
  eventDialog.showModal();
}

function renderEvents(day, dateKey) {
  events
    .filter((event) => event.date === dateKey)
    .sort((first, second) => first.time.localeCompare(second.time))
    .forEach((event) => {
      const eventButton = document.createElement("button");
      eventButton.type = "button";
      eventButton.className = "calendar-event";
      eventButton.innerHTML = `<strong>${event.name}</strong><span>${formatTime(event.time)}</span>`;
      eventButton.addEventListener("click", (clickEvent) => {
        clickEvent.stopPropagation();
        openEventEditor(dateKey, event);
      });
      day.appendChild(eventButton);
    });
}

function createCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previousMonthDays = new Date(year, month, 0).getDate();

  const monthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  monthYear.textContent = `${monthName[month]} ${year}`;

  // Days from the previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div");

    day.textContent = previousMonthDays - i;
    day.classList.add("other-month");
    const date = new Date(year, month - 1, previousMonthDays - i);
    const dateKey = getDateKey(date);
    day.dataset.date = dateKey;
    day.addEventListener("click", () => openEventEditor(dateKey));
    renderEvents(day, dateKey);

    daysContainer.appendChild(day);
  }

  // Days in the current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");

    day.textContent = i;
    const date = new Date(year, month, i);
    const dateKey = getDateKey(date);
    day.dataset.date = dateKey;

    const today = new Date();

    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add("today");
    }

    day.addEventListener("click", () => openEventEditor(dateKey));
    renderEvents(day, dateKey);

    daysContainer.appendChild(day);
  }

  // Days from the next month
  const totalCells = firstDay + daysInMonth;
  const remainingCells = 7 - (totalCells % 7);

  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      const day = document.createElement("div");

      day.textContent = i;
      day.classList.add("other-month");
      const date = new Date(year, month + 1, i);
      const dateKey = getDateKey(date);
      day.dataset.date = dateKey;
      day.addEventListener("click", () => openEventEditor(dateKey));
      renderEvents(day, dateKey);

      daysContainer.appendChild(day);
    }
  }
}

previousButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  createCalendar();
});

nextButton.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  createCalendar();
});

eventForm.addEventListener("submit", (submitEvent) => {
  submitEvent.preventDefault();
  const formData = new FormData(eventForm);
  const eventData = {
    id: editingEventId || crypto.randomUUID(),
    name: formData.get("name").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    excitement: Number(formData.get("excitement")),
    energy: Number(formData.get("energy")),
    social: Number(formData.get("social")),
  };

  if (editingEventId) {
    events = events.map((event) =>
      event.id === editingEventId ? eventData : event,
    );
  } else {
    events.push(eventData);
  }

  saveEvents();
  eventDialog.close();
  createCalendar();
});

eventDelete.addEventListener("click", () => {
  events = events.filter((event) => event.id !== editingEventId);
  saveEvents();
  eventDialog.close();
  createCalendar();
});

document.getElementById("event-cancel").addEventListener("click", () => {
  eventDialog.close();
});

createCalendar();

// slider colours

function updateSlider(slider) {
  const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;

  slider.style.setProperty("--value", `${value}%`);
}

Object.values(sliders).forEach((slider) => {
  updateSlider(slider);

  slider.addEventListener("input", () => {
    updateSlider(slider);
  });
});
////// TONE //////
