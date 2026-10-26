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

// [hue at 0, hue at 100]; the middle (50) is always neutral grey
const sliderHues = {
  "event-excitement": [220, 50], // Boring = blue, Exciting = yellow
  "event-energy": [170, 330], // Business = teal, Leisure = pink
  "event-social": [270, 15], // Slow = purple, Fast = orange
};

function sliderColour(sliderId, value) {
  const [lowHue, highHue] = sliderHues[sliderId];
  const distance = Math.abs(value - 50) / 50; // 0 in the middle, 1 at either end
  const hue = value < 50 ? lowHue : highHue;
  return `hsl(${hue}, ${distance * 100}%, 50%)`;
}

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

// builds three concentric solid rings; thickness grows with each slider's value
// three concentric solid rings; thickness grows with distance from the middle (50)
function eventRings(event, unit, maxThickness, outside = false) {
  const rings = [
    { id: "event-excitement", value: event.excitement },
    { id: "event-energy", value: event.energy },
    { id: "event-social", value: event.social },
  ];

  let depth = 0;
  return rings
    .map((ring) => {
      depth += (Math.abs(ring.value - 50) / 50) * maxThickness;
      return `${outside ? "" : "inset "}0 0 0 ${depth}${unit} ${sliderColour(ring.id, ring.value)}`;
    })
    .join(", ");
}

// three vertical stripes on the right edge; thickness grows with distance from the middle (50)
function eventStripes(event, maxThickness) {
  const stripes = [
    { id: "event-excitement", value: event.excitement },
    { id: "event-energy", value: event.energy },
    { id: "event-social", value: event.social },
  ];

  let depth = 0;
  return stripes
    .map((stripe) => {
      depth += (Math.abs(stripe.value - 50) / 50) * maxThickness;
      return `inset -${depth}px 0 0 0 ${sliderColour(stripe.id, stripe.value)}`;
    })
    .join(", ");
}

function stripeMax() {
  const value = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--stripe-max"),
  );
  return Number.isFinite(value) ? value : 4;
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
      eventButton.style.background = "#000";
      eventButton.style.boxShadow = eventStripes(event, stripeMax());
      eventButton.title = event.name;
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

// slider colours

// each slider gets a hue range: [hue at 0, hue at 100]

function updateSlider(slider) {
  slider.style.setProperty(
    "--slider-colour",
    sliderColour(slider.id, slider.value),
  );

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
////// TONE //////

let toneStarted = false;

async function startTone() {
  if (!toneStarted) {
    await Tone.start();
    toneStarted = true;
  }
}

// one voice per orb, built from that event's sliders
function createVoice(event) {
  const slow = 1 - event.social / 100; // 1 = slow, 0 = fast

  // Business (0) = bright, 5000Hz cutoff. Leisure (100) = mellow, 500Hz cutoff
  const cutoff = 5000 * Math.pow(0.1, event.energy / 100);

  const filter = new Tone.Filter(cutoff, "lowpass").toDestination();

  const synth = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.02 + slow * 1.0, // fast = 0.02s, slow = about 1s
      decay: 0.2,
      sustain: 0.7,
      release: 0.15 + slow * 1.5, // fast = 0.15s, slow = about 1.65s
    },
    volume: -14,
  }).connect(filter);

  return { synth, filter };
}

function disposeVoices() {
  orbs.forEach((orb) => {
    if (orb.voice) {
      orb.voice.synth.dispose();
      orb.voice.filter.dispose();
    }
  });
  orbs.length = 0;
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

function getEventDuration(event) {
  if (!event.time || !event.endTime) return 60;

  const start = new Date(`${event.date}T${event.time}`);
  const end = new Date(`${event.date}T${event.endTime}`);
  if (end < start) end.setDate(end.getDate() + 1);

  const minutes = (end - start) / 60000;
  return Number.isFinite(minutes) ? minutes : 60;
}

////// PLAY SCREEN //////

const calendarEl = document.querySelector(".calendar");
const playScreen = document.getElementById("play-screen");
const padGrid = document.getElementById("pad-grid");
const playBackButton = document.getElementById("play-back");
const aura = document.getElementById("aura");

const AURA_RADIUS = 90; // keep in sync with #aura size in the CSS (2x this)
const orbs = [];

function orbSize(event) {
  const minutes = getEventDuration(event);
  return 35 + Math.min(1, minutes / 240) * 35; // 35% to 70% of the cell
}

function startOrb(orb) {
  orb.active = true;
  orb.el.classList.add("active");

  if (!orb.voice) orb.voice = createVoice(orb.event);
  orb.voice.synth.triggerAttack(orb.note, Tone.now());
}

function stopOrb(orb) {
  orb.active = false;
  orb.el.classList.remove("active");

  if (orb.voice) orb.voice.synth.triggerRelease(Tone.now());
}

function stopAll() {
  orbs.forEach((orb) => {
    if (orb.active) stopOrb(orb);
  });
}

function updateAura(x, y) {
  aura.hidden = false;
  aura.style.transform = `translate(${x - AURA_RADIUS}px, ${y - AURA_RADIUS}px)`;

  orbs.forEach((orb) => {
    const rect = orb.el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const near = Math.hypot(x - cx, y - cy) < AURA_RADIUS + rect.width / 2;

    if (near && !orb.active) startOrb(orb);
    else if (!near && orb.active) stopOrb(orb);
  });
}

async function openPlayScreen() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cellKeys = [];
  for (let i = 0; i < totalCells; i++) {
    cellKeys.push(getDateKey(new Date(year, month, 1 - firstDay + i)));
  }

  const visibleEvents = events.filter((e) => cellKeys.includes(e.date));

  if (visibleEvents.length === 0) {
    alert("There are no events in this month yet.");
    return;
  }

  await startTone();

  padGrid.innerHTML = "";
  padGrid.style.setProperty("--rows", totalCells / 7);
  disposeVoices();

  cellKeys.forEach((dateKey) => {
    const cell = document.createElement("div");
    cell.className = "pad-cell";

    visibleEvents
      .filter((e) => e.date === dateKey)
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((event) => {
        const el = document.createElement("div");
        el.className = "orb";
        const size = orbSize(event);
        el.style.width = `${orbSize(event)}cqmin`;
        el.style.background = "#000";
        el.style.boxShadow = eventRings(
          event,
          "cqmin",
          orbSize(event) * 0.15,
          true,
        );
        el.title = event.name;

        const label = document.createElement("span");
        label.className = "orb-label";
        label.textContent = event.name;
        el.appendChild(label);

        orbs.push({
          el,
          event,
          note: excitementToNote(event.excitement),
          active: false,
        });
        cell.appendChild(el);
      });

    padGrid.appendChild(cell);
  });

  calendarEl.hidden = true;
  playScreen.hidden = false;
}

function closePlayScreen() {
  stopAll();
  aura.hidden = true;
  playScreen.hidden = true;
  calendarEl.hidden = false;
  playScreen.classList.remove("near-back");
}

playCalendarButton.addEventListener("click", openPlayScreen);
playBackButton.addEventListener("click", closePlayScreen);
const BACK_ZONE = 70; // pixels around the Back button where the normal cursor returns

function isNearBack(x, y) {
  const rect = playBackButton.getBoundingClientRect();
  return (
    x > rect.left - BACK_ZONE &&
    x < rect.right + BACK_ZONE &&
    y > rect.top - BACK_ZONE &&
    y < rect.bottom + BACK_ZONE
  );
}

playScreen.addEventListener("pointermove", (e) => {
  if (isNearBack(e.clientX, e.clientY)) {
    aura.hidden = true;
    stopAll();
    playScreen.classList.add("near-back");
  } else {
    playScreen.classList.remove("near-back");
    updateAura(e.clientX, e.clientY);
  }
});
playScreen.addEventListener("pointerleave", stopAll);

let lastStripeMax = stripeMax();
window.addEventListener("resize", () => {
  const current = stripeMax();
  if (current !== lastStripeMax) {
    lastStripeMax = current;
    createCalendar();
  }
});
