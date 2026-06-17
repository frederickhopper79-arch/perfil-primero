# Guía Técnica y de Negocios Definitiva.docx

Ruta original: `C:\Users\fabia\OneDrive\Escritorio\Perfil Primero\Guía Técnica y de Negocios Definitiva.docx`

Guía técnica y de negocios definitiva. Este documento contiene desde el modelo estratégico para tus inversionistas hasta la arquitectura de código lista para que tu programador empiece a construir la plataforma hoy mismo.

DOCUMENTO DE ESPECIFICACIONES COMPLETO: TINDER LABORAL IA

PARTE 1: MODELO DE NEGOCIOS (Lean Canvas Estratégico)

Este es el esqueleto comercial de la plataforma. Úsalo para estructurar la propuesta comercial.

+------------------------------------+------------------------------------+------------------------------------+

| 1. PROBLEMAS                       | 4. SOLUCIÓN                        | 3. PROPUESTA DE VALOR ÚNICA        |

|                                    |                                    |                                    |

| [Postulantes]: Pérdida de tiempo   | [Agente Autónomo]: La IA busca     | "El primer Tinder Laboral          |

| en portales tradicionales ("hoyos  | trabajo por el candidato en        | Autónomo que trabaja en segundo    |

| negros"). Negociaciones forzosas   | segundo plano 24/7.                | plano, garantizando transparencia  |

| de sueldo al final del proceso.    |                                    | económica y eliminando intermedi-  |

|                                    | [Filtro de Reclutador]: Panel      | arios costosos para la empresa."   |

| [Empresas]: Altos costos de        | B2B que entrega una lista corta    |                                    |

| headhunting externo. Saturación de | de perfiles idénticos ya filtrados | ---------------------------------- |

| CVs basura y filas en las oficinas.| por Match Semántico y Económico.   | 7. VENTAJAS INJUSTAS (Foso)        |

|                                    |                                    | Algoritmo de IA de Google vigilando|

| 2. SEGMENTOS DE CLIENTES           | 8. MÉTRICAS CLAVE                  | la intención de chat y el umbral   |

|                                    | - Costo de Adquisición (CAC)       | económico estricto imposible de    |

| - B2C: Postulantes que buscan      | - Tasa de Conversión a Pago        | evadir.                            |

|   optimizar tiempo y salario.      | - % de Matches Exitosos            |                                    |

| - B2B: Empresas con reclutadores   | - Tiempo promedio de contratación  | 9. CANALES                         |

|   internos que buscan ahorrar.     |                                    | LinkedIn Ads, SEO técnico de       |

|                                    |                                    | empleo, alianzas con universidades.|

+------------------------------------+------------------------------------+------------------------------------+

| 5. ESTRUCTURA DE COSTOS                                                 | 6. FLUJOS DE INGRESO               |

| - Consumo de APIs de Inteligencia Artificial (Google Gemini).           | - SaaS B2C: Suscripción mensual del|

| - Servidores en la nube (AWS / Google Cloud) con Base Vectorial.        |   postulante por 30 días de        |

| - Infraestructura de WebSockets y pasarelas de pago.                    |   visibilidad activa.              |

|                                                                         | - Transaccional B2B: Pago fijo de  |

|                                                                         |   la empresa al liberar el contacto.|

+------------------------------------+------------------------------------+------------------------------------+

PARTE 2: ARQUITECTURA DE DATOS

Mi desarrollador (chatgpt) necesitará este esquema en PostgreSQL para manejar los estados de pago de ambos lados, guardar la ficha estructurada de la IA y el control del chat seguro.

sql

-- 1. Perfiles de Postulantes con Control de Suscripción Mensual (30 días)

CREATE TABLE postulantes_perfiles (

id SERIAL PRIMARY KEY,

usuario_id INT UNIQUE NOT NULL,

sueldo_minimo_requerido NUMERIC(10,2) NOT NULL,

ficha_estructurada_json JSONB,               -- Almacena el parsing hecho por Gemini

perfil_activo BOOLEAN DEFAULT FALSE,          -- Solo TRUE si pagó su mes

fecha_pago_suscripcion TIMESTAMP NULL,

fecha_expiracion_suscripcion TIMESTAMP NULL,  -- Fecha Pago + 30 días

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 2. Requerimientos Activos de las Empresas

CREATE TABLE empresa_requerimientos (

id SERIAL PRIMARY KEY,

empresa_id INT NOT NULL,

descripcion_puesto TEXT NOT NULL,

sueldo_maximo_presupuesto NUMERIC(10,2) NOT NULL,

fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- 3. Control de Entrevistas, Bloqueo de IA y Registro de Notas Privadas

CREATE TABLE salas_entrevistas (

id SERIAL PRIMARY KEY,

requerimiento_id INT REFERENCES empresa_requerimientos(id),

postulante_id INT REFERENCES postulantes_perfiles(id),

score_match_porcentaje NUMERIC(5,2),

contacto_liberado_b2b BOOLEAN DEFAULT FALSE, -- Cambia a TRUE cuando la empresa paga en el chat

notas_privadas_reclutador TEXT DEFAULT '',    -- Desbloqueable post-pago

fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

Usa el código con precaución.

PARTE 3: CÓDIGO DEL BACKEND (Python + Google GenAI)

Este es el script central del servidor. Utiliza la librería oficial avanzada de Google para realizar las tres funciones científicas esenciales:

Hacer el Parsing inteligente del PDF del candidato.

Calcular el Score de Match Semántico-Económico para cruzarlos (Filtro Tinder).

Vigilar el chat en tiempo real para detectar si la empresa intenta pedir el contacto y gatillar el cobro.

Para ejecutar este código, el desarrollador debe instalar:

bash

pip install google-genai pypdf pydantic

Usa el código con precaución.

python

import os

import math

from pypdf import PdfReader

from google import genai

from google.ai import types

from pydantic import BaseModel, Field

from typing import List

# ==========================================

# CONFIGURACIÓN DE ESQUEMAS DE IA

# ==========================================

class ExperienciaLaboral(BaseModel):

cargo: str

empresa: str

duracion: str

logros: List[str]

class FichaPostulanteSchema(BaseModel):

resumen_profesional: str = Field(description="Extracto corto del perfil profesional")

habilidades_tecnicas: List[str] = Field(description="Tecnologías o herramientas duras")

habilidades_blandas: List[str] = Field(description="Competencias interpersonales")

experiencia: List[ExperienciaLaboral]

educacion: List[str]

# ==========================================

# MOTOR CENTRAL DE INTELIGENCIA ARTIFICIAL

# ==========================================

class MotorIAREclutamiento:

def __init__(self):

# Inicializa el cliente oficial de Google GenAI

# Requiere la variable de entorno: GEMINI_API_KEY

self.client = genai.Client()

def parser_cv_pdf(self, ruta_pdf: str) -> FichaPostulanteSchema:

"""

Paso 1: Extrae texto bruto del PDF del postulante y lo transforma

en una ficha técnica JSON limpia y estandarizada mediante Gemini.

"""

lector = PdfReader(ruta_pdf)

texto_bruto = "".join([pagina.extract_text() or "" for pagina in lector.pages])

instrucciones = "Analiza el texto de este CV y estructúralo estrictamente en el formato JSON requerido."

response = self.client.models.generate_content(

model='gemini-2.5-flash',

contents=f"Currículum:\n{texto_bruto}",

config=types.GenerateContentConfig(

system_instruction=instrucciones,

response_mime_type="application/json",

response_schema=FichaPostulanteSchema,

temperature=0.1

),

)

return response.text

def calcular_match_tinder(self, requ_empresa: str, ficha_post: str, sueldo_min_post: float, sueldo_max_emp: float) -> float:

"""

Paso 2: Filtro Tinder. Aplica umbral económico estricto.

Si pasa, calcula la distancia matemática vectorial (Match Semántico).

"""

# Hard Filter Económico: Evita pérdidas de tiempo y negociaciones forzosas

if sueldo_max_emp < sueldo_min_post:

return 0.0  # Match Automáticamente descartado por presupuesto bajo

# Cálculo Vectorial (Embeddings) de Google

res_emp = self.client.models.compute_embeddings(model='text-embedding-004', contents=requ_empresa)

res_post = self.client.models.compute_embeddings(model='text-embedding-004', contents=ficha_post)

v_emp, v_post = res_emp.embeddings.values, res_post.embeddings.values

# Similitud de Coseno

dot_product = sum(p * q for p, q in zip(v_emp, v_post))

mag_emp = math.sqrt(sum(p**2 for p in v_emp))

mag_post = math.sqrt(sum(q**2 for q in v_post))

if not mag_emp or not mag_post: return 0.0

return round((dot_product / (mag_emp * mag_post)) * 100, 1)

def vigilar_chat_intencion_pago(self, historial_mensajes: str) -> bool:

"""

Paso 3: Monitorea el texto del chat en tiempo real.

Retorna True si detecta intenciones explícitas o implícitas de intercambio de datos.

"""

instrucciones = (

"Analiza la conversación de chat entre una empresa y un postulante. "

"Tu único objetivo es responder TRUE si la empresa solicita datos de contacto "

"(teléfono, WhatsApp, email, redes) o si el postulante intenta darlos. "

"Si no hay intenciones de saltarse la plataforma para coordinar por fuera, responde FALSE."

)

response = self.client.models.generate_content(

model='gemini-2.5-flash',

contents=f"Historial de chat:\n{historial_mensajes}",

config=types.GenerateContentConfig(

system_instruction=instrucciones,

temperature=0.0 # Determinismo puro

),

)

return "TRUE" in response.text.upper()

# --- Zona de Pruebas del Desarrollador ---

if __name__ == "__main__":

motor = MotorIAREclutamiento()

print("🤖 Motor de Inteligencia Artificial Iniciado Correctamente.")

Usa el código con precaución.

PARTE 4: INTERFAZ DE USUARIO (Frontend Bloqueo de Chat)

Este código (HTML5 + Tailwind CSS + JavaScript) simula la sala de entrevistas interactiva. Cuando el sistema detecta que se pide el contacto, congela la pantalla de la empresa, muestra la ventana de cobro y, tras simular el pago, libera los datos y el bloc de apuntes privados.

Guarda este código en un archivo llamado entrevista.html y ejecútalo directamente en cualquier navegador:

html

<!DOCTYPE html>

<html lang="es">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Sala de Entrevista Segura - IA Guardian</title>

<script src="https://tailwindcss.com"></script>

</head>

<body class="bg-gray-100 h-screen flex flex-col justify-between font-sans antialiased">

<!-- Encabezado de Navegación -->

<header class="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">

<div class="flex items-center gap-3">

<span class="p-2 bg-blue-600 text-white rounded-lg font-bold text-sm">🤖 IA</span>

<div>

<h2 class="text-sm font-bold text-gray-800">Sala de Comunicación Blindada</h2>

<p class="text-xs text-green-600 font-medium">● Conversación supervisada de manera científica</p>

</div>

</div>

<div class="text-right">

<span class="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">Candidato ID: #A-7842</span>

</div>

</header>

<!-- Área de Trabajo Principal Split View -->

<main class="flex-1 flex overflow-hidden relative">

<!-- LADO IZQUIERDO: El Chat de la Entrevista -->

<section class="w-full md:w-2/3 flex flex-col justify-between bg-white border-r">

<!-- Contenedor de Mensajes -->

<div id="chat-box" class="p-6 overflow-y-auto space-y-4 flex-1 text-sm">

<div class="flex justify-start">

<div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-md">

Hola, vi que tuvimos un Match del 96%. Me interesa mucho tu perfil como Desarrollador Backend.

</div>

</div>

<div class="flex justify-end">

<div class="bg-blue-600 text-white p-3 rounded-lg max-w-md">

Muchas gracias. Sí, revisé que su presupuesto cubre mis pretensiones de renta mínima sin problemas. Me especializo en Python y bases vectoriales.

</div>

</div>

</div>

<!-- Entrada de Texto de la Empresa -->

<div class="p-4 border-t bg-gray-50 flex gap-2">

<input id="chat-input" type="text" placeholder="Escribe tu mensaje al postulante..." class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700">

<button onclick="enviarMensaje()" class="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition">Enviar</button>

</div>

</section>

<!-- LADO DERECHO: Panel de Apuntes Bloqueado -->

<section class="hidden md:flex md:w-1/3 bg-gray-50 p-6 flex-col justify-between">

<div>

<h3 class="font-bold text-gray-900 mb-2">📒 Apuntes del Reclutador</h3>

<p class="text-xs text-gray-500 mb-4">Este bloque de texto es persistente y exclusivo para tu organización interna.</p>

<!-- Textarea que se habilitará post pago -->

<textarea id="bloc-apuntes" disabled placeholder="🔒 Realiza el pago por los datos de contacto para habilitar tus anotaciones de la reunión..." class="w-full h-64 p-3 bg-gray-200 border rounded-lg text-sm text-gray-400 cursor-not-allowed resize-none focus:outline-none"></textarea>

</div>

<div id="datos-contacto-candidato" class="p-4 bg-gray-200 text-center rounded-xl border border-dashed border-gray-400 text-gray-500 text-xs font-mono">

[DATOS DE CONTACTO OCULTOS HASTA EL PAGO]

</div>

</section>

<!-- PANTALLA DE BLOQUEO DE PAGO EMERGENTE (MODAL POPUP AUTOMÁTICO) -->

<div id="modal-pago" class="hidden absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex justify-center items-center p-4">

<div class="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl border border-gray-100 space-y-6">

<div class="mx-auto w-16 h-16 bg-blue-100 text-blue-600 flex justify-center items-center rounded-full text-2xl">💰</div>

<div>

<h3 class="text-xl font-bold text-gray-900">IA Custodio: Intención de Contacto Detectada</h3>

<p class="text-sm text-gray-500 mt-2">Para ver la información directa del postulante, continuar el chat y habilitar tus anotaciones, procesa el pago del lead calificado.</p>

</div>

<div class="bg-gray-50 p-3 rounded-lg border flex justify-between items-center text-sm">

<span class="text-gray-600 font-medium">Tarifa única de contacto:</span>

<span class="font-mono font-bold text-gray-900">$25.000 CLP</span>

</div>

<button onclick="simularPagoExitoso()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">

Pagar y Desbloquear Datos Ahora

</button>

</div>

</div>

</main>

<!-- LOGICA INTERACTIVA EN JAVASCRIPT -->

<script>

function enviarMensaje() {

const input = document.getElementById('chat-input');

const chatBox = document.getElementById('chat-box');

if (input.value.trim() === '') return;

// 1. Agregar el texto de la empresa al chat visual

const msgDiv = document.createElement('div');

msgDiv.className = 'flex justify-start';

msgDiv.innerHTML = `<div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-md font-bold">${input.value}</div>`;

chatBox.appendChild(msgDiv);

chatBox.scrollTop = chatBox.scrollHeight;

// 2. Simular el detonador de la Inteligencia de Google

// Si el texto de la empresa incluye palabras de datos directos, se gatilla el congelamiento inmediato

const texto = input.value.toLowerCase();

if (texto.includes('whatsapp') || texto.includes('teléfono') || texto.includes('correo') || texto.includes('llámame') || texto.includes('mail')) {

setTimeout(() => {

document.getElementById('modal-pago').classList.remove('hidden');

}, 800);

}

input.value = '';

}

function simularPagoExitoso() {

// Escondemos la ventana de pago

document.getElementById('modal-pago').classList.add('hidden');

// Desbloqueamos el bloc de notas privado para el reclutador

const bloc = document.getElementById('bloc-apuntes');

bloc.disabled = false;

bloc.className = "w-full h-64 p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-800 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none";

bloc.placeholder = "Escribe aquí tus apuntes privados de la entrevista...";

bloc.focus();

// Mostramos los datos de contacto liberados de la base de datos

const contactoBox = document.getElementById('datos-contacto-candidato');

contactoBox.className = "p-4 bg-green-50 text-left rounded-xl border border-green-300 text-green-900 text-xs space-y-1 shadow-sm animate-pulse";

contactoBox.innerHTML = `

<div class="font-bold text-sm">✅ Datos Liberados:</div>

<div>📱 Teléfono: +56 9 8765 4321</div>

<div>📧 Email: carlos.dev@email.com</div>

`;

}

</script>

</body>

</html>

Usa el código con precaución.

Con esta entrega tienes empaquetado el 100% de la lógica funcional, el modelo financiero, el diseño de la base de datos relacional, el script de la IA de Google y la maqueta visual interactiva.
