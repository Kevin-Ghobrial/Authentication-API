document.addEventListener('DOMContentLoaded', async function () {
    const calendar = document.getElementById('calendar');

    if (!calendar) {
        console.error('Calendar element not found');
        return;
    }

    // ... (daysOfWeek and displaying days)

    // Display the dates for the current week
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);

        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = date.getDate();

        // Fetch user's schedule for the current date
        const response = await fetch(`/api/schedule?date=${date.toISOString()}`);
        const result = await response.json();

        // Display the user's schedule in the day element
        const schedule = result.schedule || 'No schedule available';
        dayElement.innerHTML += `<p>${schedule}</p>`;

        calendar.appendChild(dayElement);
    }
});

// Handle schedule form submission
const scheduleForm = document.getElementById('schedule-form');
scheduleForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(scheduleForm);
    const scheduleValue = formData.get('schedule');

    try {
        const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ schedule: scheduleValue }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        console.log(result.message);

        // Assuming you have a proper route to redirect to
        window.location.href = '/dashboard';
    } catch (error) {
        console.error('Error updating schedule:', error);
        // Handle the error or display a message to the user
    }
});
