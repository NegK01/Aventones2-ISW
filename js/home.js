if (document.getElementById('search-rides-tbody')) {
    initSearchRides();
} else if (document.getElementById('edit-profile-form')) {
    initEditProfile();
} else if (document.getElementById('config-form')) {
    initConfiguration();
}

function getCurrentUser() {
    var currentSession = sessionStorage.getItem("currentSession");
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

function initSearchRides() {
    const tbody = document.getElementById('search-rides-tbody');
    const drivers = getAllDrivers();
    const form = document.querySelector('.search-form');

    cargarRides(getAllRides(), tbody);

    // Evento para filtrar busqueda
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const from = document.getElementById('from').value;
        const to = document.getElementById('to').value;
        const selectedDays = getSelectedDays();
        const rides = getAllRides();

        const filteredRides = rides.filter(function (ride) {
            const matchFrom = from ? ride.departureFrom === from : true;
            const matchTo = to ? ride.arriveTo === to : true;
            const matchDays = ride.days ? ride.days.some(day => selectedDays.includes(day)) : true;
            return matchFrom && matchTo && matchDays;
        });

        cargarRides(filteredRides, tbody);
    });
}

// Obtener los días seleccionados por checkbox
function getSelectedDays() {
    const checkboxes = document.querySelectorAll('.check-inputs input[type="checkbox"]');
    const days = [];
    checkboxes.forEach(function (cb) {
        if (cb.checked) {
            days.push(cb.value);
        }
    });
    return days;
}

function cargarRides(rides, tbody) {
    tbody.innerHTML = '';
    const drivers = getAllDrivers();

    rides.forEach(function (ride) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div>
                    <img src="../assets/images/profile.png" alt="Profile ${ride.owner}"/> ${drivers.find(d => d.id === ride.owner)?.firstName || 'Unknown Driver'}
                </div>
            </td>
            <td>
                <a href="/pages/rides-ride_details.html?rideId=${ride.id}">${ride.departureFrom}</a>
            </td>
            <td>${ride.arriveTo}</td>
            <td>${ride.seats}</td>
            <td>${ride.make} ${ride.model} ${ride.year}</td>
            <td>$${ride.fee}</td>
            <td>
                <a href="#" class="request-ride" data-id="${ride.id}">Request</a>
            </td>
        `;
        tbody.appendChild(tr);

        // Evento para solicitar ride
        const requestLink = tr.querySelector('.request-ride');
        requestLink.addEventListener('click', (ev) => {
            ev.preventDefault();
            const rideId = requestLink.dataset.id;

            const currentUser = getCurrentUser();
            if (currentUser.id === ride.owner) {
                alert('No puede solicitar su propio ride');
                return;
            }

            // usamos el objeto con id de usuarios como llaves
            const requestedRides = JSON.parse(localStorage.getItem('requestedRides')) || {};

            // si no existe el arreglo del usuario, lo creamos
            if (!requestedRides[currentUser.id]) {
                requestedRides[currentUser.id] = [];
            }

            // evitar duplicados
            const alreadyRequested = requestedRides[currentUser.id].some(r => r.rideId == rideId);
            if (alreadyRequested) {
                alert('Ya solicitaste este ride');
                return;
            }

            // agregar el ride al array del usuario con estado pending
            requestedRides[currentUser.id].push({ rideId: rideId, status: 'pending' });

            localStorage.setItem('requestedRides', JSON.stringify(requestedRides));
            alert('Ride solicitado exitosamente');
        });
    });
};

function getAllRides() {
    const rides = localStorage.getItem('myRides');
    if (!rides) return [];

    try {
        const ride = JSON.parse(rides);
        console.log(ride);
        if (Array.isArray(ride)) return ride;
        return [];
    } catch (e) {
        console.warn('Error parseando myRides:', e);
        return [];
    }
}

function getAllDrivers() {
    const allUsers = localStorage.getItem('usuarios');
    if (!allUsers) return [];

    try {
        const users = JSON.parse(allUsers);
        const drivers = users.filter(d => d.role === "driver");
        console.log(drivers);
        return drivers;
    } catch (e) {
        console.warn('Error parseando conductores:', e);
        return [];
    }
}

function initEditProfile() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const firstNameInput = document.getElementById('first_name-reg');
    const lastNameInput = document.getElementById('last_name-reg');
    const idInput = document.getElementById('id-reg');
    const birthdayInput = document.getElementById('birthday-reg');
    const emailInput = document.getElementById('email-reg');
    const addressInput = document.getElementById('address-reg');
    const countryInput = document.getElementById('country-reg');
    const stateInput = document.getElementById('state-reg');
    const cityInput = document.getElementById('city-reg');
    const phoneNumberInput = document.getElementById('phone_number-reg');

    firstNameInput.value = currentUser.firstName || '';
    lastNameInput.value = currentUser.lastName || '';
    emailInput.value = currentUser.email || '';
    idInput.value = currentUser.id || '';
    idInput.disabled = true;
    birthdayInput.value = currentUser.birthday || '';
    addressInput.value = currentUser.address || '';
    countryInput.value = currentUser.country || '';
    stateInput.value = currentUser.state || '';
    cityInput.value = currentUser.city || '';
    phoneNumberInput.value = currentUser.phone || '';

    const form = document.getElementById('edit-profile-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!firstNameInput.value || !lastNameInput.value || !idInput.value || !birthdayInput.value || !emailInput.value || !addressInput.value || !countryInput.value || !stateInput.value || !cityInput.value || !phoneNumberInput.value) {
            alert('Todos los campos son obligatorios.');
            return;
        }
        if (!validarTexto(firstNameInput.value) || !validarTexto(lastNameInput.value) || !validarTexto(stateInput.value) || !validarTexto(cityInput.value)) {
            alert('Nombre, apellido, estado y ciudad solo deben contener letras, espacios y tildes.');
            return;
        }
        if (!validarEmail(emailInput.value)) {
            alert('Correo electrónico invalido.');
            return;
        }
        if (!validarTelefono(phoneNumberInput.value)) {
            alert('El numero de telefono debe contener solo numeros y al menos 8 digitos como minimo.');
            return;
        }

        const updatedUser = {
            firstName: firstNameInput.value.trim() || '',
            lastName: lastNameInput.value.trim() || '',
            birthday: birthdayInput.value.trim() || '',
            email: emailInput.value.trim() || '',
            address: addressInput.value.trim() || '',
            country: countryInput.value.trim() || '',
            state: stateInput.value.trim() || '',
            city: cityInput.value.trim() || '',
            phone: phoneNumberInput.value.trim() || ''
        };
        updateUserProfile(updatedUser);
    });
}

function updateUserProfile(updatedUser) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert("No se encontró el usuario en sesión.");
        return;
    }

    // Buscar índice del usuario actual
    const index = usuarios.findIndex(u => u.id === currentUser.id);
    if (index === -1) {
        alert("No se encontró el usuario en la base de datos.");
        return;
    }

    // Mantener datos que no cambian
    updatedUser.id = currentUser.id;
    updatedUser.password = currentUser.password; // si no lo editas aquí
    updatedUser.role = currentUser.role; // mantener rol (user o driver)
    if (currentUser.role === "driver") {
        updatedUser.carBrand = currentUser.carBrand;
        updatedUser.carModel = currentUser.carModel;
        updatedUser.carYear = currentUser.carYear;
        updatedUser.licensePlate = currentUser.licensePlate;
    }

    // Reemplazar usuario en el array
    usuarios[index] = updatedUser;

    // Guardar en localStorage
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    // Actualizar sesión actual
    sessionStorage.setItem("currentSession", JSON.stringify({ user: updatedUser }));

    alert("Perfil actualizado con éxito");
    window.location.reload();
}


function validarTexto(texto) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto.trim());
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarTelefono(telefono) {
    return /^\d{8,}$/.test(telefono.trim());
}

function initConfiguration() {
    const currentUser = getCurrentUser();
    const publicNameInput = document.getElementById('public_name');
    const publicBioInput = document.getElementById('public_bio');
    const form = document.getElementById('config-form');

    if (publicNameInput) {
        publicNameInput.value = currentUser.firstName || '';
    }

    if (publicBioInput) {
        publicBioInput.value = currentUser.publicBio || '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (publicNameInput) {
            currentUser.firstName = publicNameInput.value.trim();
        }
        if (publicBioInput) {
            currentUser.publicBio = publicBioInput.value.trim();
        }

        // Actualizar en la lista de usuarios
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const index = usuarios.findIndex(u => u.id === currentUser.id);
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...currentUser };
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
        }

        // Actualizar sesión actual
        sessionStorage.setItem("currentSession", JSON.stringify({ user: currentUser }));

        alert("Datos actualizados correctamente");
    });
}


