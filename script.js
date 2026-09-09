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

let currentDate = new Date();

function createCalendar() {
  daysContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const previousMonthDays = new Date(year, month, 0).getDate();

  const monthName = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  monthYear.textContent = `${monthName[month]} ${year}`;

  // Days from the previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div");

    day.textContent = previousMonthDays - i;
    day.classList.add("other-month");

    daysContainer.appendChild(day);
  }

  // Days in the current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");

    day.textContent = i;

    const today = new Date();

    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add("today");
    }

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

createCalendar();
