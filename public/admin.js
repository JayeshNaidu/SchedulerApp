const refreshButton = document.querySelector("#refreshButton");
const emptyState = document.querySelector("#emptyState");
const appointmentsTable = document.querySelector("#appointmentsTable");
const appointmentsBody = document.querySelector("#appointmentsBody");

refreshButton.addEventListener("click", loadAppointments);

loadAppointments();

async function loadAppointments() {
  emptyState.textContent = "Loading appointments...";
  emptyState.hidden = false;
  appointmentsTable.hidden = true;

  const response = await fetch("/api/appointments");
  const result = await response.json();
  const items = result.items ?? [];

  appointmentsBody.innerHTML = "";

  if (!items.length) {
    emptyState.textContent = "No appointments found yet.";
    return;
  }

  for (const item of items) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name ?? ""}</td>
      <td>${item.email ?? ""}</td>
      <td>${item.service ?? ""}</td>
      <td>${formatDate(item.appointmentTime)}</td>
      <td>${formatDate(item.createdAt)}</td>
    `;
    appointmentsBody.append(row);
  }

  emptyState.hidden = true;
  appointmentsTable.hidden = false;
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("en-US");
}
