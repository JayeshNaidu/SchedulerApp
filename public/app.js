const form = document.querySelector("#appointmentForm");

form.addEventListener("submit", submitAppointment);

setDefaultTime();

async function submitAppointment(event) {
  event.preventDefault();

  const payload = {
    name: document.querySelector("#name").value,
    email: document.querySelector("#email").value,
    appointmentTime: document.querySelector("#appointmentTime").value,
    service: document.querySelector("#service").value
  };

  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    window.alert(result.message ?? "Something went wrong.");
    return;
  }

  const appointment = result.appointment;
  const notification = result.notification;

  if (notification?.sent) {
    window.alert(`Appointment created for ${appointment.name}. Calendar event and confirmation email triggered.`);
  } else {
    window.alert(`Appointment created for ${appointment.name}.`);
  }

  form.reset();
  setDefaultTime();
}

function setDefaultTime() {
  const input = document.querySelector("#appointmentTime");
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  input.value = toLocalDateTimeValue(now);
}

function toLocalDateTimeValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
