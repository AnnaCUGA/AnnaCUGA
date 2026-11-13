// Portafolio de Ana Cuevas
// Cambio de idioma (ES / EN) y año del pie de página.

(function () {
  'use strict';

  // El HTML está escrito en español; la versión en inglés de cada texto
  // vive en el atributo data-en del mismo elemento.
  var traducibles = document.querySelectorAll('[data-en]');
  var boton = document.getElementById('idioma');
  var CLAVE = 'portafolio-idioma';

  // Guarda el texto original en español para poder volver a él.
  traducibles.forEach(function (el) {
    el.dataset.es = el.tagName === 'META' ? el.content : el.innerHTML;
  });

  function aplicarIdioma(idioma) {
    traducibles.forEach(function (el) {
      var texto = el.dataset[idioma];
      if (el.tagName === 'META') {
        el.content = texto;
      } else {
        el.innerHTML = texto;
      }
    });

    document.documentElement.lang = idioma;

    // Marca el idioma activo en el botón.
    boton.querySelectorAll('[data-lang]').forEach(function (marca) {
      if (marca.dataset.lang === idioma) {
        marca.setAttribute('aria-current', 'true');
      } else {
        marca.removeAttribute('aria-current');
      }
    });
    boton.setAttribute('aria-label', idioma === 'es' ? 'Switch to English' : 'Cambiar a español');
  }

  function leerPreferencia() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (error) {
      return null;
    }
  }

  function guardarPreferencia(idioma) {
    try {
      localStorage.setItem(CLAVE, idioma);
    } catch (error) {
      // Sin almacenamiento disponible: el idioma solo dura esta visita.
    }
  }

  // Idioma inicial: el que eligió la persona antes o, si no, el del navegador.
  var guardado = leerPreferencia();
  var delNavegador = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  var actual = guardado === 'es' || guardado === 'en' ? guardado : delNavegador;

  if (actual !== 'es') {
    aplicarIdioma(actual);
  }

  boton.addEventListener('click', function () {
    actual = actual === 'es' ? 'en' : 'es';
    aplicarIdioma(actual);
    guardarPreferencia(actual);
  });

  document.getElementById('anio').textContent = new Date().getFullYear();
})();
