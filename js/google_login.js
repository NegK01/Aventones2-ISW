(function renderStoredAccounts() {
  const avatarPalette = [
    '#EF5350',
    '#AB47BC', 
    '#5C6BC0', 
    '#42A5F5', 
    '#26A69A', 
    '#66BB6A',
    '#FFCA28',
    '#FFA726', 
    '#8D6E63',
    '#29B6F6',
    '#7E57C2',
    '#EC407A',
  ];

  function colorForKey(key) {
    if (!key) return avatarPalette[0];
    let hash = 0;
    for (let i = 0; i < key.length; i += 1) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % avatarPalette.length;
    return avatarPalette[idx];
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
      if (!usuario || !usuario.id) return;

      const actualUser = {
        id: usuario.id,
        role: usuario.role,
      };
      sessionStorage.setItem('actualSession', JSON.stringify(actualUser));
      window.location.href = '/pages/rides-my_rides.html';
    });

    accountsContainer.appendChild(row);
  });
})();

