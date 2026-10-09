// ============================================
// CONFIGURACIÓN
// ============================================
//     REEMPLAZA ESTA API KEY CON LA TUYA
const API_KEY = '4d4250db8a25cdc64c8f2177b65b3130';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ============================================
// REFERENCIAS AL DOM
// ============================================
const formulario = document.getElementById('formulario');
const inputCiudad = document.getElementById('inputCiudad');
const resultado = document.getElementById('resultado');
const estado = document.getElementById('estado');

// ============================================
// FUNCIÓN PRINCIPAL: CONSULTAR CLIMA
// ============================================
async function consultarClima(ciudad)
           {guardarEnHistorial(ciudad)
    // Mostrar estado de carga
    estado.textContent = '       Consultando el clima...';
    resultado.classList.remove('visible');

    try {
        // Codificar la ciudad para la URL
        const ciudadCodificada = encodeURIComponent(ciudad);

        // Construir la URL con parámetros
        const url = `${API_URL}?q=${ciudadCodificada}&appid=${API_KEY}&units=metric&lang=es`;

        // Hacer la petición
        const respuesta = await fetch(url);

        // Verificar si la respuesta fue exitosa
        if (!respuesta.ok) {
            if (respuesta.status === 404) {
                throw new Error('Ciudad no encontrada');
            } else if (respuesta.status === 401) {
                throw new Error('API Key inválida');
            } else {
                throw new Error('Error en la petición: ' + respuesta.status);
            }
        }

        // Convertir a JSON
        const datos = await respuesta.json();

        // Mostrar los datos
        mostrarClima(datos);
        estado.textContent = '✅ Datos actualizados correctamente.';

    } catch (error) {
        console.error('Error:', error);
        estado.textContent = `❌ ${error.message}. Intenta con otra ciudad.`;
        resultado.classList.remove('visible');
    }
}

// ============================================
// FUNCIÓN: MOSTRAR EL CLIMA EN EL DOM
// ============================================
function mostrarClima(datos) {
    // Extraer datos del objeto JSON anidado
    const ciudad = datos.name;
    const pais = datos.sys.country;
    const temperatura = Math.round(datos.main.temp);
    const sensacion = Math.round(datos.main.feels_like);
    const humedad = datos.main.humidity;
    const presion = datos.main.pressure;
    const viento = datos.wind.speed;
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;
    const iconoUrl = `https://openweathermap.org/img/wn/${icono}@2x.png`;

    // Construir el HTML del resultado
    resultado.innerHTML = `
        <div class="ciudad">${ciudad}</div>
        <div class="pais">${pais}</div>
        <img src="${iconoUrl}" alt="${descripcion}" class="icono-clima">
        <div class="temperatura">${temperatura}°C</div>
        <div class="descripcion">${descripcion}</div>
        <div class="detalles">
            <div class="detalle">
                <div class="etiqueta">Sensación</div>
                <div class="valor">${sensacion}°C</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Humedad</div>
                <div class="valor">${humedad}%</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Presión</div>
                <div class="valor">${presion} hPa</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Viento</div>
                <div class="valor">${viento} m/s</div>
            </div>
        </div>
    `;

    // Mostrar el resultado
    resultado.classList.add('visible');

    // Cambiar el fondo según el clima
    cambiarFondoSegunClima(datos.weather[0].main);
}

// ============================================
// FUNCIÓN: CAMBIAR FONDO SEGÚN EL CLIMA
// ============================================
function cambiarFondoSegunClima(clima) {
    // Remover clases anteriores
    document.body.classList.remove('clima-soleado', 'clima-nublado', 'clima-lluvioso', 'clima-nieve');

    // Agregar la clase según el clima
    const climaLower = clima.toLowerCase();

    if (climaLower.includes('clear')) {
        document.body.classList.add('clima-soleado');
    } else if (climaLower.includes('cloud')) {
        document.body.classList.add('clima-nublado');
    } else if (climaLower.includes('rain') || climaLower.includes('drizzle') || climaLower.includes('thunderstorm')) {
        document.body.classList.add('clima-lluvioso');
    } else if (climaLower.includes('snow')) {
        document.body.classList.add('clima-nieve');
    }
}

// ============================================
// EVENTO DEL FORMULARIO
// ============================================
formulario.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar que la página se recargue

    const ciudad = inputCiudad.value.trim();

    if (!ciudad) {
        estado.textContent = 'Escribe el nombre de una ciudad.';
        return;
    }

    consultarClima(ciudad);
});

// ============================================
// MENSAJE INICIAL
// ============================================
estado.textContent = 'Escribe una ciudad y presiona "Consultar".';

// ============================================
// CONSULTAR CLIMA AL CARGAR (opcional)
// ============================================
// consultarClima('Mexico City');

const btnUbicacion = document.getElementById('btnUbicacion');

btnUbicacion.addEventListener('click', function () {
  estado.textContent = 'Obteniendo tu ubicación...';

  navigator.geolocation.getCurrentPosition(
    async function (posicion) {
      const lat = posicion.coords.latitude;
      const lon = posicion.coords.longitude;

      estado.textContent = 'Ubicación encontrada ✅';

      const respuesta = await fetch(
        `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );

      if (!respuesta.ok) throw new Error('No se pudo cargar el clima');

      const datos = await respuesta.json();

      resultado.innerHTML = `
        <h3>${datos.name}</h3>
        <p class="temperatura">${Math.round(datos.main.temp)}°C</p>
        <p>${datos.weather[0].description}</p>
        <p>Humedad: ${datos.main.humidity}%</p>
      `;
      resultado.classList.add('visible');
      estado.textContent = '';
    },
    function () {
      estado.textContent = 'No se pudo obtener la ubicación ❌';
    }
  );
});

const API_URL_PRONOSTICO = 'https://api.openweathermap.org/data/2.5/forecast';
const btnPronostico = document.getElementById('btnPronostico');
const cajaPronostico = document.getElementById('pronostico');

btnPronostico.addEventListener('click', async () => {
  const ciudad = inputCiudad.value.trim();
  if (!ciudad) {
    estado.textContent = 'Escribe una ciudad primero';
    return;
  }

  estado.textContent = 'Cargando pronóstico...';
  
  try {
    const res = await fetch(
      `${API_URL_PRONOSTICO}?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`
    );
    if (!res.ok) throw new Error('Ciudad no encontrada');
    
    const datos = await res.json();
    cajaPronostico.innerHTML = '';

    // Tomamos un dato por día (cada 8 elementos = 24h)
    for (let i = 0; i < datos.list.length; i += 8) {
      const dia = datos.list[i];
      const fecha = new Date(dia.dt_txt).toLocaleDateString('es-MX', {
        weekday: 'long', day: 'numeric', month: 'short'
      });
      
      cajaPronostico.innerHTML += `
        <div class="dia">
          <strong>${fecha}</strong><br>
          ${Math.round(dia.main.temp)}°C — ${dia.weather[0].description}
        </div>
      `;
    }
    
    estado.textContent = '';
  } catch (err) {
    estado.textContent = 'Error: ' + err.message;
  }
});
const cajaHistorial = document.getElementById('historial');
let historial = JSON.parse(localStorage.getItem('historial')) || [];

// Mostrar historial al cargar
mostrarHistorial();

function guardarEnHistorial(ciudad) {
  if (!ciudad) return;
  
  // Quitar si ya existe y agregar al inicio
  historial = historial.filter(c => c !== ciudad);
  historial.unshift(ciudad);
  
  // Solo guardar últimas 5
  if (historial.length > 5) historial.pop();
  
  localStorage.setItem('historial', JSON.stringify(historial));
  mostrarHistorial();
}

function mostrarHistorial() {
  cajaHistorial.innerHTML = '';
  historial.forEach(ciudad => {
    const btn = document.createElement('button');
    btn.textContent = ciudad;
    btn.onclick = () => {
      inputCiudad.value = ciudad;
      formulario.dispatchEvent(new Event('submit'));
    };
    cajaHistorial.appendChild(btn);
  });
}
const btnTema = document.getElementById('btnTema');

btnTema.addEventListener('click', function () {
  document.body.classList.toggle('claro');
});

const btnCompartir = document.getElementById('btnCompartir');

btnCompartir.addEventListener('click', function () {
  // Toma los datos que se muestran en pantalla
  const ciudad = document.querySelector('.resultado h3')?.textContent || 'tu ciudad';
  const temp = document.querySelector('.temperatura')?.textContent || '??°C';

  // Crea el mensaje y abre WhatsApp (usa acento grave `` ` ``)
  const mensaje = `El clima en ${ciudad} es de ${temp}\n👉 Mira la app: https://santiagocruzluisyandel-lang.github.io/Clima---app/`;
  const enlace = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;

  window.open(enlace, '_blank');
});