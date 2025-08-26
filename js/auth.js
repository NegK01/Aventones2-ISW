const form = document.querySelector('form');

const googleLoginBtn = document.getElementById('google-login');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/pages/login-google.html';
    });
}

// maneja el proceso de autenticacion del usuario en el formulario de login
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

    const currentUser = {
        user: usuarioEncontrado,
    };
    sessionStorage.setItem('currentSession', JSON.stringify(currentUser));
    window.location.href = '/pages/rides-my_rides.html';
});