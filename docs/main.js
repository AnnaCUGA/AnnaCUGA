// Portafolio de Ana Cuevas
// Idioma (ES / EN), demo del agente, texto que se escribe, contadores,
// aparición al hacer scroll, filtros de proyectos y menú móvil.

(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raiz = document.documentElement;

  /* ---------------------------------------------------------------
     Idioma
     El HTML está en español; el inglés vive en el atributo data-en.
  --------------------------------------------------------------- */
  var traducibles = document.querySelectorAll('[data-en]');
  var botonIdioma = document.getElementById('idioma');
  var CLAVE = 'portafolio-idioma';
  var idioma = 'es';

  var TEXTOS = {
    es: {
      frases: ['agentes de IA', 'flujos en n8n', 'modelos de machine learning', 'pipelines RAG'],
      pausar: 'Pausar',
      reanudar: 'Reanudar',
      copiado: 'Correo copiado al portapapeles.',
      noCopiado: 'No se pudo copiar; selecciona el correo y cópialo.',
      menu: 'Menú',
      cambiar: 'Switch to English'
    },
    en: {
      frases: ['AI agents', 'n8n workflows', 'machine learning models', 'RAG pipelines'],
      pausar: 'Pause',
      reanudar: 'Resume',
      copiado: 'Email copied to clipboard.',
      noCopiado: 'Could not copy; select the email and copy it.',
      menu: 'Menu',
      cambiar: 'Cambiar a español'
    }
  };

  traducibles.forEach(function (el) {
    el.dataset.es = el.tagName === 'META' ? el.content : el.innerHTML;
  });

  function aplicarIdioma(nuevo) {
    idioma = nuevo;
    traducibles.forEach(function (el) {
      var texto = el.dataset[nuevo];
      if (el.tagName === 'META') {
        el.content = texto;
      } else {
        el.innerHTML = texto;
      }
    });
    raiz.lang = nuevo;

    botonIdioma.querySelectorAll('[data-lang]').forEach(function (marca) {
      if (marca.dataset.lang === nuevo) {
        marca.setAttribute('aria-current', 'true');
      } else {
        marca.removeAttribute('aria-current');
      }
    });
    botonIdioma.setAttribute('aria-label', TEXTOS[nuevo].cambiar);
    document.getElementById('hamburguesa').setAttribute('aria-label', TEXTOS[nuevo].menu);

    actualizarBotonPausa();
    reiniciarEscritura();
  }

  function leerPreferencia() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (error) {
      return null;
    }
  }

  function guardarPreferencia(valor) {
    try {
      localStorage.setItem(CLAVE, valor);
    } catch (error) {
      // Sin almacenamiento disponible: el idioma solo dura esta visita.
    }
  }

  /* ---------------------------------------------------------------
     Texto que se escribe solo en el encabezado
  --------------------------------------------------------------- */
  var escribe = document.getElementById('escribe');
  var temporizadorEscritura = null;

  function reiniciarEscritura() {
    clearTimeout(temporizadorEscritura);
    var frases = TEXTOS[idioma].frases;

    if (sinMovimiento) {
      escribe.textContent = frases[0];
      return;
    }

    var indice = 0;
    var letras = frases[0].length;
    var borrando = true;
    escribe.textContent = frases[0];

    function paso() {
      var frase = frases[indice];
      if (borrando) {
        letras -= 1;
        escribe.textContent = frase.slice(0, letras);
        if (letras === 0) {
          borrando = false;
          indice = (indice + 1) % frases.length;
          temporizadorEscritura = setTimeout(paso, 350);
          return;
        }
        temporizadorEscritura = setTimeout(paso, 35);
      } else {
        letras += 1;
        escribe.textContent = frase.slice(0, letras);
        if (letras === frase.length) {
          borrando = true;
          temporizadorEscritura = setTimeout(paso, 2000);
          return;
        }
        temporizadorEscritura = setTimeout(paso, 70);
      }
    }

    temporizadorEscritura = setTimeout(paso, 2000);
  }

  /* ---------------------------------------------------------------
     Demo del agente: recorre los nodos del diagrama paso a paso
  --------------------------------------------------------------- */
  var PASOS = [
    { nodo: 'mensaje', cable: null },
    { nodo: 'agente', cable: 'entrada' },
    { nodo: 'vision', cable: 'vision' },
    { nodo: 'mysql', cable: 'mysql' },
    { nodo: 'llm', cable: 'llm' },
    { nodo: 'respuesta', cable: 'salida' }
  ];
  var renglones = document.querySelectorAll('#bitacora li');
  var botonPausa = document.getElementById('flujo-pausa');
  var pasoActual = -1;
  var enPausa = false;
  var temporizadorDemo = null;

  function nodo(nombre) {
    return document.querySelector('[data-nodo="' + nombre + '"]');
  }

  function cable(nombre) {
    return document.querySelector('[data-cable="' + nombre + '"]');
  }

  function limpiarDemo() {
    PASOS.forEach(function (paso, i) {
      nodo(paso.nodo).classList.remove('activo', 'hecho');
      if (paso.cable) {
        cable(paso.cable).classList.remove('activo');
      }
      renglones[i].classList.remove('activo', 'hecho');
    });
  }

  function mostrarPaso(indice) {
    PASOS.forEach(function (paso, i) {
      var elNodo = nodo(paso.nodo);
      elNodo.classList.toggle('activo', i === indice);
      elNodo.classList.toggle('hecho', i < indice);
      if (paso.cable) {
        cable(paso.cable).classList.toggle('activo', i === indice);
      }
      renglones[i].classList.toggle('activo', i === indice);
      renglones[i].classList.toggle('hecho', i < indice);
    });
  }

  function avanzarDemo() {
    pasoActual += 1;
    if (pasoActual >= PASOS.length) {
      // pausa breve con todo completado y vuelve a empezar
      pasoActual = -1;
      limpiarDemo();
      temporizadorDemo = setTimeout(avanzarDemo, 900);
      return;
    }
    mostrarPaso(pasoActual);
    var espera = pasoActual === PASOS.length - 1 ? 2400 : 1500;
    temporizadorDemo = setTimeout(avanzarDemo, espera);
  }

  function actualizarBotonPausa() {
    botonPausa.textContent = enPausa ? TEXTOS[idioma].reanudar : TEXTOS[idioma].pausar;
  }

  botonPausa.addEventListener('click', function () {
    enPausa = !enPausa;
    clearTimeout(temporizadorDemo);
    if (!enPausa) {
      avanzarDemo();
    }
    actualizarBotonPausa();
  });

  if (sinMovimiento) {
    // Sin animación: muestra el flujo completo y oculta el botón.
    mostrarPaso(PASOS.length);
    botonPausa.hidden = true;
  } else {
    temporizadorDemo = setTimeout(avanzarDemo, 800);
  }

  /* ---------------------------------------------------------------
     Contadores y aparición al hacer scroll
  --------------------------------------------------------------- */
  function formatear(valor, decimales) {
    return valor.toLocaleString('en-US', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
  }

  function contar(el) {
    if (el.dataset.contado) {
      return;
    }
    el.dataset.contado = 'si';
    var meta = parseFloat(el.dataset.cuenta);
    var decimales = parseInt(el.dataset.dec || '0', 10);
    if (sinMovimiento) {
      el.textContent = formatear(meta, decimales);
      return;
    }
    var inicio = null;
    var duracion = 1400;
    function cuadro(ahora) {
      if (inicio === null) {
        inicio = ahora;
      }
      var avance = Math.min((ahora - inicio) / duracion, 1);
      var suavizado = 1 - Math.pow(1 - avance, 3);
      el.textContent = formatear(meta * suavizado, decimales);
      if (avance < 1) {
        requestAnimationFrame(cuadro);
      }
    }
    requestAnimationFrame(cuadro);
  }

  var revelables = document.querySelectorAll('[data-revelar]');

  function revelar(el) {
    el.classList.add('visible');
    el.querySelectorAll('[data-cuenta]').forEach(contar);
  }

  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          revelar(entrada.target);
          observador.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revelables.forEach(function (el) {
      // escalona los elementos hermanos para que entren uno tras otro
      var hermanos = Array.prototype.filter.call(el.parentNode.children, function (h) {
        return h.hasAttribute('data-revelar');
      });
      el.style.setProperty('--retraso', (hermanos.indexOf(el) * 0.08) + 's');
      observador.observe(el);
    });
  } else {
    revelables.forEach(revelar);
  }

  /* ---------------------------------------------------------------
     Barra de progreso y sección activa en el menú
  --------------------------------------------------------------- */
  var barraProgreso = document.getElementById('progreso');
  var enlaces = document.querySelectorAll('.menu a');
  var secciones = Array.prototype.map.call(enlaces, function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  var pendiente = false;

  function alDesplazar() {
    pendiente = false;
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    var avance = alto > 0 ? window.scrollY / alto : 0;
    barraProgreso.style.transform = 'scaleX(' + avance + ')';

    var marca = window.innerHeight * 0.35;
    var activa = -1;
    secciones.forEach(function (seccion, i) {
      if (seccion.getBoundingClientRect().top <= marca) {
        activa = i;
      }
    });
    enlaces.forEach(function (a, i) {
      if (i === activa) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', function () {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(alDesplazar);
    }
  }, { passive: true });
  alDesplazar();

  /* ---------------------------------------------------------------
     Filtros de proyectos y foco de luz en las tarjetas
  --------------------------------------------------------------- */
  var filtros = document.querySelectorAll('.filtro');
  var proyectos = document.querySelectorAll('.proyecto');

  filtros.forEach(function (boton) {
    boton.addEventListener('click', function () {
      var elegido = boton.dataset.filtro;
      filtros.forEach(function (otro) {
        otro.setAttribute('aria-pressed', otro === boton ? 'true' : 'false');
      });
      proyectos.forEach(function (proyecto) {
        var categorias = proyecto.dataset.cat.split(' ');
        var mostrar = elegido === 'todos' || categorias.indexOf(elegido) !== -1;
        proyecto.hidden = !mostrar;
        if (mostrar) {
          revelar(proyecto);
        }
      });
    });
  });

  proyectos.forEach(function (proyecto) {
    proyecto.addEventListener('pointermove', function (evento) {
      var caja = proyecto.getBoundingClientRect();
      proyecto.style.setProperty('--mx', (evento.clientX - caja.left) + 'px');
      proyecto.style.setProperty('--my', (evento.clientY - caja.top) + 'px');
    });
  });

  /* ---------------------------------------------------------------
     Menú móvil
  --------------------------------------------------------------- */
  var hamburguesa = document.getElementById('hamburguesa');
  var menu = document.getElementById('menu');

  function cerrarMenu() {
    menu.classList.remove('abierto');
    hamburguesa.setAttribute('aria-expanded', 'false');
  }

  hamburguesa.addEventListener('click', function () {
    var abierto = menu.classList.toggle('abierto');
    hamburguesa.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  enlaces.forEach(function (a) {
    a.addEventListener('click', cerrarMenu);
  });

  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape') {
      cerrarMenu();
    }
  });

  /* ---------------------------------------------------------------
     Copiar correo
  --------------------------------------------------------------- */
  var aviso = document.getElementById('copiado');

  document.getElementById('copiar').addEventListener('click', function () {
    var correo = document.getElementById('correo').textContent;
    function listo(ok) {
      aviso.textContent = ok ? TEXTOS[idioma].copiado : TEXTOS[idioma].noCopiado;
      setTimeout(function () {
        aviso.textContent = '';
      }, 4000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(correo).then(function () {
        listo(true);
      }, function () {
        listo(false);
      });
    } else {
      listo(false);
    }
  });

  /* ---------------------------------------------------------------
     Arranque
  --------------------------------------------------------------- */
  var guardado = leerPreferencia();
  var delNavegador = (navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  var inicial = guardado === 'es' || guardado === 'en' ? guardado : delNavegador;

  if (inicial !== 'es') {
    aplicarIdioma(inicial);
  } else {
    reiniciarEscritura();
  }

  botonIdioma.addEventListener('click', function () {
    aplicarIdioma(idioma === 'es' ? 'en' : 'es');
    guardarPreferencia(idioma);
  });

  document.getElementById('anio').textContent = new Date().getFullYear();
})();
