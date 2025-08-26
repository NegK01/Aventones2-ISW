(function renderStoredAccounts() {
  const avatarPalette = [
    '#EF5350', //0
    '#AB47BC', //1
    '#5C6BC0', //2
    '#42A5F5', //3
    '#26A69A', //4
    '#66BB6A', //5
    '#FFCA28', //6
    '#FFA726', //7
    '#8D6E63', //8
    '#29B6F6', //9
    '#7E57C2', //10 = 1234
    '#EC407A', //11
  ];

// calcula un color de avatar basado en un texto clave usando hash simple
  function colorForKey(key) {//1234
    if (!key) return avatarPalette[0];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) { //4 ciclos    
      hash = (hash << 5) - hash + key.charCodeAt(i); //(0*31 = 0 + 49 [1 ASCII]) 49 = 0011 0001 | (49*31 = 1519 + 50) 1569 = 0011 0010 |      (1569*31 = 48639 + 51) 48690 = 0011 0010 | (48690*31 = 1509390 + 52) 1509442 = 1011 10000 1000 0100 0010
      hash |= 0; //49 = 00000000 00000000 00000000 00110001 | 1569 = 00000000 00000000 00000110 00100001 | 48690 = 00000000000000001011111000110010 | 1509442 = 00000000 00010111 00001000 01000010
    }
    const idx = Math.abs(hash) % avatarPalette.length; // 9
    return avatarPalette[idx]; //#7E57C2
  }
  const accountsContainer = document.getElementById('accounts-list');
  if (!accountsContainer) {
    return;
  }

  let usuarios = [];
  const stored = localStorage.getItem('usuarios');
  if (stored) {
    try {
      usuarios = JSON.parse(stored);
      if (!Array.isArray(usuarios)) usuarios = [];
    } catch (e) {
      usuarios = [];
    }
  }

  if (usuarios.length === 0) {
    return;
  }

  accountsContainer.innerHTML = '';

  // crea los elementos visuales para mostrar cada cuenta de usuario almacenada
  usuarios.forEach((usuario, index) => {
    const displayName = [usuario.firstName, usuario.lastName].filter(Boolean).join(' ').trim() || usuario.email || usuario.id;
    const email = usuario.email || '';
    const avatarLetter = (displayName || 'U').trim().charAt(0).toUpperCase();

    const row = document.createElement('a');
    row.href = '#';
    row.className = 'account-row';
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Cuenta ${displayName}`);

    const avatar = document.createElement('div');
    avatar.className = 'avatar';

    const colorKey = usuario.id || usuario.email || displayName;
    avatar.style.backgroundColor = index === 0 ? '#689f38' : colorForKey(colorKey);
    const span = document.createElement('span');
    span.textContent = avatarLetter;
    avatar.appendChild(span);

    const info = document.createElement('div');
    info.className = 'account-info';
    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = displayName;
    info.appendChild(nameEl);
    if (email) {
      const emailEl = document.createElement('div');
      emailEl.className = 'email';
      emailEl.textContent = email;
      info.appendChild(emailEl);
    }

    row.appendChild(avatar);
    row.appendChild(info);

    row.addEventListener('click', function (e) {
      e.preventDefault();
      if (!usuario) return;

      const currentUser = {
        user: usuario,
      };
      sessionStorage.setItem('currentSession', JSON.stringify(currentUser));
      window.location.href = '/pages/rides-my_rides.html';
    });

    accountsContainer.appendChild(row);
  });
})();

