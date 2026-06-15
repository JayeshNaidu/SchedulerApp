const { createElement: h, useState } = React;

const SERVICE_OPTIONS = [
  { value: "product-demo", label: "Product Demo" },
  { value: "technical-support", label: "Technical Support" },
  { value: "sales-consultation", label: "Sales Consultation" },
  { value: "onboarding-call", label: "Onboarding Call" }
];

function getDefaultAppointmentTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return toLocalDateTimeValue(now);
}

function toLocalDateTimeValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function createInitialForm() {
  return {
    name: "",
    email: "",
    appointmentTime: getDefaultAppointmentTime(),
    service: SERVICE_OPTIONS[0].value
  };
}

function AppointmentForm() {
  const [form, setForm] = useState(createInitialForm);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function submitAppointment(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedbackType("error");
        setFeedback(result.message ?? "Something went wrong.");
        return;
      }

      const appointment = result.appointment;
      const notification = result.notification;

      if (notification?.sent) {
        setFeedback(
          `Appointment created for ${appointment.name}. Calendar event and confirmation email triggered.`
        );
      } else {
        setFeedback(`Appointment created for ${appointment.name}.`);
      }

      setFeedbackType("success");
      setForm(createInitialForm());
    } catch (error) {
      setFeedbackType("error");
      setFeedback("Unable to reach the booking service right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return h(
    React.Fragment,
    null,
    h(
      "form",
      { className: "form-grid", onSubmit: submitAppointment },
      h(
        "label",
        null,
        "Name",
        h("input", {
          name: "name",
          placeholder: "Ava Patel",
          required: true,
          value: form.name,
          onChange: updateField
        })
      ),
      h(
        "label",
        null,
        "Email",
        h("input", {
          name: "email",
          type: "email",
          placeholder: "ava@example.com",
          required: true,
          value: form.email,
          onChange: updateField
        })
      ),
      h(
        "label",
        null,
        "Appointment Time",
        h("input", {
          name: "appointmentTime",
          type: "datetime-local",
          required: true,
          value: form.appointmentTime,
          onChange: updateField
        })
      ),
      h(
        "label",
        null,
        "Service",
        h(
          "select",
          {
            name: "service",
            required: true,
            value: form.service,
            onChange: updateField
          },
          SERVICE_OPTIONS.map((option) =>
            h("option", { key: option.value, value: option.value }, option.label)
          )
        )
      ),
      h(
        "div",
        { className: "actions" },
        h(
          "button",
          { type: "submit", disabled: isSubmitting },
          isSubmitting ? "Creating Appointment..." : "Create Appointment"
        )
      )
    ),
    feedback
      ? h(
          "p",
          { className: `status-message status-${feedbackType}`, role: "status" },
          feedback
        )
      : null
  );
}

const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(h(AppointmentForm));
