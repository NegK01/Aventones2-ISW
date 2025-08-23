(function () {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'driver' && !document.getElementById("ride-details")) {
        alert("Esta pagina es solo para conductores");
        window.location.href = '/pages/home-search_rides.html';
        return;
    }

    if (document.getElementById("tbody")) {
        initMyRides(currentUser);
    } else if (document.getElementById("create-ride")) {
        initNewRide(currentUser);
    } else if (document.getElementById("ride-details")) {
        initRideDetails();
    } else if (document.getElementById("edit-ride")) {
        initEditRide();
    }
})();

function getCurrentUser() {
    var currentSession = sessionStorage.getItem("currentSession");
    if (currentSession) {
        try {
            return JSON.parse(currentSession).user;
        } catch (e) {
            alert("Error al leer datos de currentSession");
            return null;
        }
    }
    return null;
}

function initMyRides(currentUser) {
    const tbody = document.getElementById("tbody");

    tbody.innerHTML = "";

    const allRides = JSON.parse(localStorage.getItem('myRides')) || [];
    const myRides = allRides.filter(r => r.owner === currentUser.id);

    myRides.forEach((ride) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>
                <a href="/pages/rides-ride_details.html?rideId=${ride.id}">${ride.departureFrom}</a>
            </td>
            <td>${ride.arriveTo}</td>
            <td>${ride.seats}</td>
            <td>${ride.make} ${ride.model} ${ride.year}</td>
            <td>$${ride.fee}</td>
            <td>
                <a href="/pages/rides-edit_ride.html?rideId=${ride.id}">Edit</a> | 
                <a href="#" class="delete-ride" data-id="${ride.id}">Delete</a>
            </td>
        `;

        tbody.appendChild(tr);

        const deleteLink = tr.querySelector('.delete-ride');
        deleteLink.addEventListener('click', (ev) => {
            ev.preventDefault();
            const rideId = deleteLink.dataset.id;

            const updated = myRides.filter(r => String(r.id) !== rideId);
            localStorage.setItem('myRides', JSON.stringify(updated));

            tr.remove();
        });
    });


    const newRideBtn = document.getElementById('new-ride');
    newRideBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = "/pages/rides-new_ride.html";
    });
}

function initNewRide(currentUser) {
    if (currentUser.carBrand) {
        document.getElementById("make").value = currentUser.carBrand;
        document.getElementById("make").disabled = true;
    }
    if (currentUser.carModel) {
        document.getElementById("model").value = currentUser.carModel;
        document.getElementById("model").disabled = true;
    }
    if (currentUser.carYear) {
        document.getElementById("year").value = currentUser.carYear;
        document.getElementById("year").disabled = true;
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const departureFrom = document.getElementById('departure-from').value.trim();
        const arriveTo = document.getElementById('arrive-to').value.trim();

        const checkedDays = []; // dias selecionados
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                checkedDays.push(checkboxes[i].value);
            }
        }

        const time = document.getElementById('time').value.trim();
        const seats = document.getElementById('seats').value.trim();
        const fee = document.getElementById('fee').value.trim();
        const make = document.getElementById('make').value.trim();
        const model = document.getElementById('model').value.trim();
        const year = document.getElementById('year').value.trim();

        if (!departureFrom || !arriveTo || !time || !seats || !fee || !make || !model || !year) {
            alert("Todos los campos son obligatorios.");
            return;
        }
        if (departureFrom === arriveTo) {
            alert("Los lugares de salida y llegada no pueden ser iguales.");
            return;
        }
        if (checkedDays.length === 0) {
            alert("Por favor, seleccione al menos un día.");
            return;
        }

        if (!time) {
            alert("Por favor, seleccione una hora.");
            return;
        }
        if (seats <= 0) {
            alert("El número de asientos debe ser mayor que cero.");
            return;
        }
        if (fee < 0) {
            alert("La tarifa no puede ser negativa.");
            return;
        }

        const myRides = JSON.parse(localStorage.getItem('myRides')) || [];
        const newRide = {
            owner: currentUser.id,
            id: myRides.length,
            departureFrom,
            arriveTo,
            days: checkedDays,
            time,
            seats,
            fee,
            make,
            model,
            year
        };
        myRides.push(newRide);
        localStorage.setItem('myRides', JSON.stringify(myRides));
        window.location.href = "/pages/rides-my_rides.html";
    });

    const cancelRideBtn = document.getElementById('cancel-ride');
    if (cancelRideBtn) {
        cancelRideBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = "/pages/rides-my_rides.html";
        });
    }
}

function initRideDetails() {
    const { ride } = searchSelectedRide();
    if (!ride) return;

    const departure = document.getElementById("departure");
    const arrival = document.getElementById("arrival");
    if (departure) departure.textContent = ride.departureFrom;
    if (arrival) arrival.textContent = ride.arriveTo;

    // poner check en los dias seleccionados
    if (Array.isArray(ride.days)) {
        ride.days.forEach(day => {
            const check = document.querySelector(`[type="checkbox"][value="${day}"]`);
            if (check) check.checked = true;
        });
    }
}

function initEditRide() {
    const { ride, inputs } = searchSelectedRide();
    if (!ride) {
        alert("Ride no encontrado");
        window.location.href = '/pages/rides-my_rides.html';
        return;
    }

    /* Los 2 elementos que no estan en searchSelectedRIde */
    const departure = document.getElementById("departure-from");
    const arrival = document.getElementById("arrive-to");
    if (departure) departure.value = ride.departureFrom;
    if (arrival) arrival.value = ride.arriveTo;

    if (Array.isArray(ride.days)) {
        ride.days.forEach(day => {
            const check = document.querySelector(`[type="checkbox"][value="${day}"]`);
            if (check) check.checked = true;
        });
    }

    const form = document.getElementById('edit-ride');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const departureFrom = departure.value.trim();
            const arriveTo = arrival.value.trim();
            const time = inputs.time.value.trim();
            const seats = inputs.seats.value.trim();
            const fee = inputs.fee.value.trim();
            const make = inputs.make.value.trim();
            const model = inputs.model.value.trim();
            const year = inputs.year.value.trim();

            const checkedDays = [];
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => { if (cb.checked) checkedDays.push(cb.value); });

            if (!departureFrom || !arriveTo || !time || !seats || !fee || !make || !model || !year) {
                alert("Todos los campos son obligatorios.");
                return;
            }
            if (departureFrom === arriveTo) {
                alert("Los lugares de salida y llegada no pueden ser iguales.");
                return;
            }
            if (checkedDays.length === 0) {
                alert("Seleccione al menos un día.");
                return;
            }
            if (seats <= 0) {
                alert("El número de asientos debe ser mayor que cero.");
                return;
            }
            if (fee < 0) {
                alert("La tarifa no puede ser negativa.");
                return;
            }

            const myRides = JSON.parse(localStorage.getItem('myRides')) || [];
            const index = myRides.findIndex(r => String(r.id) === String(ride.id));
            if (index === -1) {
                alert('Ride no encontrado al intentar guardar.');
                return;
            }

            myRides[index] = {
                ...myRides[index],
                departureFrom,
                arriveTo,
                days: checkedDays,
                time,
                seats,
                fee,
                make,
                model,
                year
            };

            localStorage.setItem('myRides', JSON.stringify(myRides));
            window.location.href = '/pages/rides-my_rides.html';
        });
    }
}

function searchSelectedRide() {
    let params = new URLSearchParams(window.location.search);
    let rideId = params.get("rideId");

    let myRides = JSON.parse(localStorage.getItem("myRides")) || [];

    let ride = myRides.find(r => r.id == rideId);

    const departure = document.getElementById("departure-from");
    const arrival = document.getElementById("arrive-to");
    const time = document.getElementById("time");
    const seats = document.getElementById("seats");
    const fee = document.getElementById("fee");
    const make = document.getElementById("make");
    const model = document.getElementById("model");
    const year = document.getElementById("year");

    if (ride) {
        if (departure) departure.value = ride.departureFrom;
        if (arrival) arrival.value = ride.arriveTo;
        if (time) time.value = ride.time;
        if (seats) seats.value = ride.seats;
        if (fee) fee.value = ride.fee;
        if (make) make.value = ride.make;
        if (model) model.value = ride.model;
        if (year) year.value = ride.year;

        return {
            ride,
            inputs: { departure, arrival, time, seats, fee, make, model, year }
            // faltan 2 campos mas pero son distintos, asi que se manejan aparte
        };
    } else {
        console.log("Ride no encontrado");
        return null;
    }
}
