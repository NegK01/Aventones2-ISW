const form = document.querySelector('form');

function validarTexto(texto) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(texto.trim());
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarTelefono(telefono) {
    return /^\d{8,}$/.test(telefono.trim());
}

// maneja el registro de nuevos usuarios con validacion completa de datos
form.addEventListener('submit', function (e) {
    e.preventDefault();
    const firstName = document.getElementById('first_name-reg').value.trim();
    const lastName = document.getElementById('last_name-reg').value.trim();
    const id = document.getElementById('id-reg').value.trim();
    const birthday = document.getElementById('birthday-reg').value.trim();
    const email = document.getElementById('email-reg').value.trim();
    const password = document.getElementById('password-reg').value.trim();
    const passwordRep = document.getElementById('password_rep-reg').value.trim();
    const address = document.getElementById('address-reg').value.trim();
    const country = document.getElementById('country-reg').value.trim();
    const state = document.getElementById('state-reg').value.trim();
    const city = document.getElementById('city-reg').value.trim();
    const phone = document.getElementById('phone_number-reg').value.trim();

    const carBrand = document.getElementById('car_brand-reg')?.value.trim() || null;
    const carModel = document.getElementById('car_model-reg')?.value.trim() || null;
    const carYear = document.getElementById('car_year-reg')?.value.trim() || null;
    const licensePlate = document.getElementById('license_plate-reg')?.value.trim() || null;

    if (!firstName || !lastName || !id || !birthday || !email || !password || !passwordRep || !address || !country || !state || !city || !phone) {
        alert('Todos los campos son obligatorios.');
        return;
    }
    if (!validarTexto(firstName) || !validarTexto(lastName) || !validarTexto(state) || !validarTexto(city)) {
        alert('Nombre, apellido, estado y ciudad solo deben contener letras, espacios y tildes.');
        return;
    }
    if (!validarEmail(email)) {
        alert('Correo electrónico invalido.');
        return;
    }
    if (!validarTelefono(phone)) {
        alert('El numero de telefono debe contener solo numeros y al menos 8 digitos como minimo.');
        return;
    }
    if (password !== passwordRep) {
        alert('Las contraseñas no coinciden.');
        return;
    }

    if (carYear !== null || licensePlate !== null || carBrand !== null || carModel !== null) {
        if (!carYear || !licensePlate || !carBrand || !carModel) {
            alert('Todos los campos del vehículo son obligatorios para conductores.');
            return;
        }
    };

    let usuarios = [];
    if (localStorage.getItem('usuarios')) {
        try {
            usuarios = JSON.parse(localStorage.getItem('usuarios'));
        } catch (e) {
            usuarios = [];
        }
    }
    if (usuarios.some(u => u.id === id)) {
        alert('El id ya esta registrado.');
        return;
    }
    if (usuarios.some(u => u.email === email)) {
        alert('El correo electronico ya esta registrado.');
        return;
    }
    if (usuarios.some(u => u.phone === phone)) {
        alert('El numero de telefono ya esta registrado.');
        return;
    }
    const usuario = {
        firstName,
        lastName,
        id,
        birthday,
        email,
        password,
        address,
        country,
        state,
        city,
        phone,
    };

    if (carBrand !== null) {
        usuario.carYear = carYear;
        usuario.licensePlate = licensePlate;
        usuario.carBrand = carBrand;
        usuario.carModel = carModel;
        usuario.role = 'driver';
    } else {
        usuario.role = 'user';
    }

    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    window.location.href = '/index.html';
});