## NEXSO SmartMap

###Descripción
---
SmartMap es una herramienta para visualizar, analizar y superponer datos geográficos. Los usuarios pueden elegir entre docenas de indicadores sociales, económicos y ambientales, extraídos de fuentes públicas de información, para crear mapas personalizados y detallados.

La información disponible en SmartMap se basa en los datos oficiales publicados por los organismos nacionales e internacionales a los que se hace referencia. La política adoptada para definir los límites administrativos no refleja ninguna posición oficial del Grupo del BID y del FOMIN.
Los resultados del análisis deben considerarse meramente indicativos y de cualquier forma no se deben utilizar referencias en situaciones críticas o de emergencias. El equipo de NEXSO SmartMap agradece cualquier comentario, observación o sugerencia con respecto a la información contenida en esta aplicación y sus funcionalidades.

### Arquitectura de aplicaciones
---
Smartmap es una aplicación modular del tipo MVC basadaa en Backbonejs y JQuery en el cliente y ESRI ArcGis del lado del servidor.

Cliente

- /js - aplicación principal
- /ja/component - Modulos de la aplicación
- /ja/component/smartmap-ui - Contenedor principal de la interfaz


Servidor

La aplicación consume servicio remoto de datos geográficos en un servidor público del BID. Para configurar el servicio, consulte /js/config/config.js

Advertencia:

> El servicio actual está temporalmente sin conexión.

Recuerda:

> Smartmap está diseñado para incorporarse en otras aplicaciones. Por lo tanto, se puede reutilizar por separado los módulos instanciados en smartmap-ui.

### Vamos más allá, hacer que sea de código abierto social
---
Razón por la que estamos abriendo el código fuente ....

### Requisitos de desarrollo
---

- NodeJS
- grunt-cli (Se necesita instalar globalmente see: https://github.com/gruntjs/grunt-cli#grunt-cli-)
- Sass CSS Importer ( $ gem install --pre sass-css-importer )
- Compass ($ gem install compass)
- Browser-Sync

###Comenzar ahora 
---

Navega hasta `cd js/components/smartmap-ui`:

- `npm install`
- `grunt init --force` (instala las depencias de Bower, se requiere parar el proceso para continuar, utiliza Ctrl +c. Se ejecuta el comando forzado por un bug que se debe resolver.)
- `grunt build`

Navega al directorio raiz de tu aplicación

- `npm install`
- `grunt init --force` (instala las depencias de Bower)
- `grunt build`

Abre una nueva terminal y ejecuta Browser Sync para cargar un servidor HTTP

- `browser-sync start --server --files "css/*.css"`

Voila !! Todo esta listo y corriendo.

Recuerda:

> Cada vez que necesite reconstruir completamente el proyecto ejecuta `grunt build` en el directorio smartmap-ui y una vez completado ejecuta `grunt build` en la raíz de la aplicación.

###Desarrollo
---

Durante la fase de desarrollo, se recomeinda ejecutar el observaodr de grunt para vigilar el directorio smartmap-ui y el raíz.
- `grunt watch` en el directorio raíz
- `grunt watch --force` en el directorio smartmap-ui (para evitar errores del tipo linting durante el desarrollo)
- en lugar de usar --force, también puede agregar `debug ': true` al archivo `smartmap-ui / .jshintrc`

Ejecutar aplicación

En el directorio raíz

### Análisis de calidad
---

El BID hizo una evaluación de calidad externa de este código con el fin de informar a la comunidad los problemas a resolver. Este código está clasificado como XXXX. Esto significa que requiere un trabajo adicional para que sea estable en un ambiente de producción.

### Cómo contribuir
---

Consulte el archivo de contribución (contribution) en este repositorio.

### Mejoras Identificadas
---

Identificamos varios puntos para mejorar Smartmap.

1. Cambiar el motor del mapa.
2. Corregir los errores de codigo.
3. Implementar el funcionalidades de Social Media
4. Implementar guardar mi mapa.
5. Actualizar bibliotecas y referencias.
6. Mejorar la documentación en el código.
7. Mejorar el rendimiento del código.



###Licencia
---

Licencia MIT

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software y de los archivos de documentación asociados (el "Software"), para utilizar el Software sin restricción, incluyendo sin limitación los derechos a usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar, y/o vender copias del Software, y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.
EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DEL COPYRIGHT SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, QUE SURJA DE O EN CONEXIÓN CON EL SOFTWARE O EL USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.

>Está no es una traducción oficial, favor referirse a la licencia original en ingles, https://opensource.org/licenses/MIT

### Autores
BID

- Jairo Anaya @jairoanaya

ESRI

- Josh Petterson @jpeterson

- Allison Sizer @Alison Sizer

Flipside

- Olaf Verman

- Ricardo Saavedra


Sinapsis Innovation

- Cristian Agudelo @ crstn210

### Otros enlaces

Http://server.arcgis.com/en/

Http://www.nexso.org/smartmap
