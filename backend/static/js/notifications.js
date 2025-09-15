const socket = new WebSocket(`ws://${window.location.host}/ws/notifications/`);

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    const notificationArea = document.getElementById("notification-area");
    notificationArea.innerHTML += `<p><strong>${data.title}</strong>: ${data.message}</p>`;
};



const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)[1];
