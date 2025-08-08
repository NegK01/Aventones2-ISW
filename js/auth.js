const form = document.querySelector('form');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('id').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!id || !password) {
        alert('Todos los campos son obligatorios.');
        return;
    }

    let usuarios = [];
    if (localStorage.getItem('usuarios')) {
        try {
            usuarios = JSON.parse(localStorage.getItem('usuarios'));
        } catch (e) {
            usuarios = [];
        }
    }

    const usuarioEncontrado = usuarios.find(u => u.id === id);
    if (!usuarioEncontrado) {
        alert('Usuario no encontrado.');
        return;
    }
    if (usuarioEncontrado.password !== password) {
        alert('Contraseña incorrecta.');
        return;
    }

    const actualUser = {
        id: usuarioEncontrado.id,
        role: usuarioEncontrado.role,
    }
    sessionStorage.setItem('actualSession', JSON.stringify(actualUser));
    window.location.href = '/pages/rides-my_rides.html';
});