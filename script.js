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
const eventEndTime = document.getElementById("event-end-time");
const eventDelete = document.getElementById("event-delete");
const playCalendarButton = document.getElementById("play-calendar");

const sliders = {
  excitement: document.getElementById("event-excitement"),
  energy: document.getElementById("event-energy"),
  social: document.getElementById("event-social"),
};
const sliderValues = {
  excitement: document.getElementById("excitement-value"),
  energy: document.getElementById("energy-value"),
  social: document.getElementById("social-value"),
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

function updateSliderValue(attribute) {
  sliderValues[attribute].value = sliders[attribute].value;
}

function openEventEditor(dateKey, eventToEdit = null) {
  editingEventId = eventToEdit ? eventToEdit.id : null;

  eventDialogTitle.textContent = eventToEdit ? "Edit event" : "Add event";

  eventName.value = eventToEdit?.name || "";
  eventDate.value = eventToEdit?.date || dateKey;
  eventTime.value = eventToEdit?.time || "12:00";
  eventEndTime.value = eventToEdit?.endTime || "13:00";

  eventDelete.hidden = !eventToEdit;

  eventDialog.showModal();

  sliders.excitement.value = eventToEdit?.excitement ?? 50;
  sliders.energy.value = eventToEdit?.energy ?? 50;
  sliders.social.value = eventToEdit?.social ?? 50;

  updateSlider(sliders.excitement);
  updateSlider(sliders.energy);
  updateSlider(sliders.social);
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

Object.keys(sliders).forEach((attribute) => {
  sliders[attribute].addEventListener("input", () =>
    updateSliderValue(attribute),
  );
});

function updateSlider(slider) {
  const value = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;

  slider.style.setProperty("--value", `${value}%`);

  const output = document.getElementById(
    `${slider.id.replace("event-", "")}-value`,
  );

  if (output) {
    output.value = slider.value;
    output.textContent = slider.value;
  }
}

Object.values(sliders).forEach((slider) => {
  updateSlider(slider);

  slider.addEventListener("input", () => {
    updateSlider(slider);
  });
});

eventForm.addEventListener("submit", (submitEvent) => {
  submitEvent.preventDefault();
  const formData = new FormData(eventForm);
  const eventData = {
    id: editingEventId || crypto.randomUUID(),
    name: formData.get("name").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    endTime: formData.get("endTime"),
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

////// TONE //////

////// TONE //////

let synth;
let toneStarted = false;

async function startTone() {
  if (!toneStarted) {
    await Tone.start();

    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine",
      },

      envelope: {
        attack: 0.2,
        decay: 0.2,
        sustain: 0.7,
        release: 0.5,
      },
    }).toDestination();

    toneStarted = true;
  }
}

function excitementToNote(excitement) {
  const notes = [
    "C3",
    "D3",
    "E3",
    "F3",
    "G3",
    "A3",
    "B3",
    "C4",
    "D4",
    "E4",
    "F4",
    "G4",
    "A4",
    "B4",
    "C5",
  ];

  const index = Math.round((excitement / 100) * (notes.length - 1));

  return notes[index];
}

function intensityToVolume(intensity) {
  return -30 + (intensity / 100) * 24;
}

function speedToRelease(speed) {
  return 0.2 + (speed / 100) * 1.5;
}

function getEventDuration(event) {
  if (!event.time || !event.endTime) return 60; // fallback: 1 hour

  const start = new Date(`${event.date}T${event.time}`);
  let end = new Date(`${event.date}T${event.endTime}`);

  // handle events that run past midnight
  if (end < start) end.setDate(end.getDate() + 1);

  const minutes = (end - start) / 60000;
  return Number.isFinite(minutes) ? minutes : 60;
}

async function playEvent(event) {
  await startTone();

  const note = excitementToNote(event.excitement);

  const durationMinutes = getEventDuration(event);

  // Convert the event duration into a short musical note
  const durationSeconds = Math.min(5, Math.max(0.5, durationMinutes * 0.02));

  synth.volume.value = intensityToVolume(event.energy);

  synth.set({
    envelope: {
      release: Math.min(0.5, speedToRelease(event.social)),
    },
  });

  synth.triggerAttackRelease(note, durationSeconds);

  await new Promise((resolve) => {
    setTimeout(resolve, durationSeconds * 1000);
  });
}

async function playCalendar() {
  if (events.length === 0) {
    alert("There are no events in your calendar yet.");

    return;
  }

  await startTone();

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);

    const dateB = new Date(`${b.date}T${b.time}`);

    return dateA - dateB;
  });

  playCalendarButton.disabled = true;

  playCalendarButton.textContent = "Playing...";

  for (const event of sortedEvents) {
    await playEvent(event);
  }

  playCalendarButton.disabled = false;

  playCalendarButton.textContent = "Play Calendar";
}

playCalendarButton.addEventListener("click", playCalendar);
