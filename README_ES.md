# Secure Docs Tagger Extension

Esta extensión de Chrome permite identificar y visualizar el nivel de confidencialidad de un documento de Google Docs, junto con una justificación detallada que explica por qué se clasifica de esa manera. Para lograrlo, utilizamos la API de Google Docs para extraer el contenido del documento, y empleamos APIs de inteligencia artificial integradas en Chrome para realizar la clasificación.

Primero, es necesario configurar OAuth en Google Cloud para habilitar el acceso al contenido de los documentos de Google Docs. Esto permitirá que la extensión pueda autenticar y autorizar las solicitudes de manera segura.

## Configuración de OAuth en Google Cloud

### 1. Crear un Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el selector de proyectos en la parte superior
3. Clic en "Nuevo Proyecto"
   - Nombre: "Secure Docs Tagger" (o el que prefieras)
   - Clic en "Crear"

### 2. Habilitar la API de Google Docs

1. En el menú lateral, ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Docs API"
3. Clic en "Google Docs API"
4. Clic en "Habilitar"

### 3. Configurar la Pantalla de Consentimiento

1. Ve a "APIs y servicios" > "Pantalla de consentimiento de OAuth"
2. Selecciona "Externo" como tipo de usuario
3. Clic en "Crear"
4. Completa la información requerida:
   - Nombre de la app: "Secure Docs Tagger"
   - Correo electrónico de soporte: [tu correo]
   - Correos electrónicos de contacto del desarrollador: [tu correo]
5. Clic en "Guardar y continuar"
6. En la sección de "Scopes":
   - Clic en "Añadir o quitar scopes"
   - Selecciona `https://www.googleapis.com/auth/documents.readonly`
7. Clic en "Guardar y continuar"
8. En "Usuarios de prueba":
   - Clic en "Añadir usuarios"
   - Añade tu correo electrónico
   - Clic en "Guardar y continuar"

### 4. Crear Credenciales OAuth

1. Ve a "APIs y servicios" > "Credenciales"
2. Clic en "Crear credenciales" > "ID de cliente de OAuth"
3. Selecciona "Extensión de Chrome" como tipo
4. Completa la información:
   - Nombre: "Secure Docs Tagger"
   - ID de la aplicación de Chrome: [ID de tu extensión]

### 5. Obtener el ID de la Extensión

1. Abre Chrome y ve a `chrome://extensions/`
2. Activa el "Modo desarrollador" (esquina superior derecha)
3. Clic en "Cargar descomprimida"
4. Selecciona la carpeta `chrome-extension`
5. Copia el ID que aparece debajo del nombre de la extensión

### 6. Configurar las Credenciales OAuth

1. Vuelve a Google Cloud Console
2. En la página de creación de credenciales:
   - Pega el ID de la extensión que copiaste
3. Clic en "Crear"
4. Copia el ID de cliente (Client ID) generado

### 7. Configurar la Extensión

1. Abre el archivo `manifest.json`
2. Reemplaza el valor de `client_id` con el ID que copiaste:
   ```json
   "oauth2": {
       "client_id": "YOUR-CLIENT-ID.apps.googleusercontent.com",
       "scopes": [
           "https://www.googleapis.com/auth/documents.readonly"
       ]
   }
   ```

## Configurar Google Chrome para Activar las APIs de AI integradas.

Para activar las APIs de AI integradas, tenemos que habilitar los siguientes flags.

1. chrome://flags/#prompt-api-for-gemini-nano -> Enabled
2. chrome://flags/#writer-api-for-gemini-nano -> Enabled
3. chrome://flags/#summarization-api-for-gemini-nano -> Enabled
4. chrome://flags/#rewriter-api-for-gemini-nano -> Enabled
5. chrome://flags/#language-detection-api -> Enabled
6. chrome://flags/#translation-api -> Enabled
7. chrome://flags/#optimization-guide-on-device-model -> Enabled BypassPerfRequirement

## Uso de la Extensión

1. Abre un documento de Google Docs
2. Haz clic en el icono de la extensión para abrir el panel lateral
3. La primera vez, autoriza la extensión cuando se solicite
4. El contenido del documento se mostrará en el panel
5. Usa el botón "Update Classification" para actualizar la clasificación.

## Solución de Problemas

### Error 401 (No autorizado)
- Verifica que el Client ID esté correctamente configurado
- Asegúrate de haber autorizado la aplicación
- Intenta recargar la extensión

### No se muestra el contenido
- Verifica que estés en un documento de Google Docs
- Comprueba que la API de Google Docs esté habilitada
- Revisa la consola de desarrollador para ver errores

### Otros Problemas
- Asegúrate de que tu correo esté en la lista de usuarios de prueba
- Verifica que todos los permisos necesarios estén configurados
- Intenta desinstalar y volver a instalar la extensión 
