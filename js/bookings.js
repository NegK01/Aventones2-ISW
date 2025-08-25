(function () {
    if (document.getElementById('bookings-tbody')) {
        initBookings();
    }
})();

function getCurrentUser() {
    const currentSession = sessionStorage.getItem("currentSession");
    if (currentSession) {
        try {
            return JSON.parse(currentSession).user;
        } catch (e) {
            alert('Error al leer datos de currentSession');
            return null;
        }
    }
    return null;
}

function getAllRides() {
    const rides = localStorage.getItem('myRides');
    if (!rides) return [];

    try {
        const parsed = JSON.parse(rides);
        if (Array.isArray(parsed)) return parsed;
        return [];
    } catch (e) {
        console.warn('Error parseando myRides:', e);
        return [];
    }
}

function getAllUsers() {
    const allUsers = localStorage.getItem('usuarios');
    if (!allUsers) return [];

    try {
        return JSON.parse(allUsers);
    } catch (e) {
        console.warn('Error parseando usuarios:', e);
        return [];
    }
}

// Devuelve un arreglo de objetos { ride, userId, status }
function getRequestedRides() {
    const ridesLS = localStorage.getItem('requestedRides');
    if (!ridesLS) return [];

    try {
        const requestedObj = JSON.parse(ridesLS); // { userId: [ { rideId, status } ] }
        const allRides = getAllRides();
        const ridesToRender = [];

        for (const userId in requestedObj) {
            const userRequests = requestedObj[userId];
            userRequests.forEach(req => {
                const ride = allRides.find(r => r.id == req.rideId);
                if (ride) {
                    ridesToRender.push({
                        ride,
                        userId,
                        status: req.status || "pending"
                    });
                }
            });
        }

        return ridesToRender;
    } catch (e) {
        console.warn('Error parseando requestedRides:', e);
        return [];
    }
}

function updateRideStatus(userId, rideId, status) {
    const requestedObj = JSON.parse(localStorage.getItem("requestedRides")) || {};
    const userRequests = requestedObj[userId];

    if (!userRequests) return;

    const req = userRequests.find(r => r.rideId == rideId);
    if (req) req.status = status;

    localStorage.setItem("requestedRides", JSON.stringify(requestedObj));
}

function initBookings() {
    const tbody = document.getElementById('bookings-tbody');
    const requestedRides = getRequestedRides();
    const allUsers = getAllUsers();
    const currentUser = getCurrentUser();

    tbody.innerHTML = '';

    // Filtrar las solicitudes antes de iterar para mejorar la claridad
    const filteredRequests = requestedRides.filter(req => {
        const ride = req.ride;
        const status = req.status;
        if (currentUser.role === "driver") {
            // Drivers solo ven solicitudes pendientes de sus rides
            return status === "pending" && ride.owner == currentUser.id;
        } else {
            // Usuarios normales ven sus propias solicitudes
            return req.userId === currentUser.id;
        }
    });
    filteredRequests.forEach(req => {
        const ride = req.ride;
        const status = req.status;

        const driver = allUsers.find(d => d.id == ride.owner);
        const requesterName = allUsers.find(d => d.id == req.userId)?.firstName || 'Unknown User';
        const tr = document.createElement('tr');

        if (currentUser.role === "driver" && ride.owner == currentUser.id) {
            // Drivers ven solicitudes de sus rides pendientes
            tr.innerHTML = `
            <td>
                <div>
                    <img src="../assets/images/profile.png" alt="Driver ${requesterName}" />
                    ${requesterName || 'Unknown Driver'}
                </div>
            </td>
            <td>${ride.departureFrom} - ${ride.arriveTo}</td>
            <td>
                <button class="accept" data-user="${req.userId}" data-ride="${ride.id}">Accept</button>
                <button class="reject" data-user="${req.userId}" data-ride="${ride.id}">Reject</button>
            </td>
        `;
        } else if (currentUser.role !== "driver" && req.userId === currentUser.id) {
            // Usuarios normales ven sus pedidos y estado
            tr.innerHTML = `
            <td>
                <div>
                    <img src="../assets/images/profile.png" alt="Driver ${driver?.firstName}" />
                    ${driver?.firstName || 'Unknown Driver'}
                </div>
            </td>
            <td>${ride.departureFrom} - ${ride.arriveTo}</td>
            <td>${status}</td>
        `;
        } else {
            // No mostrar otras solicitudes
            return;
        }

        tbody.appendChild(tr);

        if (currentUser.role === "driver" && ride.owner == currentUser.id) {
            tr.querySelector(".accept").addEventListener("click", () => {
                updateRideStatus(req.userId, ride.id, "accepted");
                initBookings();
            });
            tr.querySelector(".reject").addEventListener("click", () => {
                updateRideStatus(req.userId, ride.id, "rejected");
                initBookings();
            });
        }
    });

}
