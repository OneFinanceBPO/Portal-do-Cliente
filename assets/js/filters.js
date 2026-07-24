/* ── ONE FINANCE — Multi-Select Mês ── */
const MES_FILTER = (() => {
  const NOMES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  let _cb = null;

  /* Retorna null (= Todos) ou array de números [1..12] */
  function getSelected() {
    const todos = document.getElementById('chkTodos');
    if (!todos || todos.checked) return null;
    const checked = [...document.querySelectorAll('#mesDrop input[data-m]:checked')];
    return checked.length ? checked.map(c => +c.dataset.m) : null;
  }

  function _updateLabel() {
    const sel = getSelected();
    const lbl = document.getElementById('mesBtnLabel');
    if (!lbl) return;
    if (!sel) {
      lbl.textContent = 'Todos';
    } else if (sel.length === 1) {
      lbl.textContent = NOMES[sel[0]];
    } else {
      lbl.innerHTML = '<span class="mes-tag">' + sel.length + '</span>&nbsp;meses';
    }
  }

  function _onTodosChange() {
    const chk = document.getElementById('chkTodos');
    if (chk.checked) {
      document.querySelectorAll('#mesDrop input[data-m]').forEach(c => c.checked = false);
    } else {
      // Se nada individual marcado, força Todos de volta
      if (!document.querySelector('#mesDrop input[data-m]:checked')) chk.checked = true;
    }
    _updateLabel();
    if (_cb) _cb();
  }

  function _onMesChange() {
    const todos = document.getElementById('chkTodos');
    todos.checked = false;
    // Se ficou vazio, volta para Todos
    if (!document.querySelector('#mesDrop input[data-m]:checked')) {
      todos.checked = true;
    }
    _updateLabel();
    if (_cb) _cb();
  }

  function init(defaultMes, onChange) {
    _cb = onChange;
    const todosEl  = document.getElementById('chkTodos');
    const dropEl   = document.getElementById('mesDrop');
    const btnEl    = document.getElementById('mesBtn');
    if (!todosEl || !dropEl || !btnEl) return;

    todosEl.addEventListener('change', _onTodosChange);
    document.querySelectorAll('#mesDrop input[data-m]').forEach(c => {
      c.addEventListener('change', _onMesChange);
    });

    // Abre/fecha dropdown
    btnEl.addEventListener('click', e => {
      e.stopPropagation();
      dropEl.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#mesWrap')) dropEl.classList.remove('open');
    });

    // Estado inicial
    if (defaultMes === null || defaultMes === undefined) {
      todosEl.checked = true;
    } else {
      [].concat(defaultMes).forEach(m => {
        const c = document.querySelector('#mesDrop input[data-m="' + m + '"]');
        if (c) c.checked = true;
      });
      todosEl.checked = false;
    }
    _updateLabel();
  }

  /* Soma uma chave de um objeto de dados indexado por mês */
  function soma(dadosObj, chave, sel) {
    if (!sel) return (dadosObj['all'] || {})[chave] || 0;
    return sel.reduce((acc, m) => acc + ((dadosObj[m] || {})[chave] || 0), 0);
  }

  return { init, getSelected, soma };
})();
