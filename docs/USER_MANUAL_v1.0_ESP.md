# Manual de Usuario (Español)

## Resumen
La biblioteca de Mongo-Filter-Object-Parser permite recibir una cadena de texto siguiendo una sintaxis definida y convertirla a un objeto bson que puede ser utilizado como filtro de búsqueda en un ODM de MongoDB como Mongoose o en un gestor como MongoDB Compass.

La biblioteca contiene 3 clases de búsqueda principales, cada una de ellas requiere de diferentes argumentos de entrada y devolverán una respuesta diferente. Ésta biblioteca está integrada dentro de [RegulonDB-HT](https://regulondb-datasets.ccg.unam.mx/#/) y próximamente en RegulonDB 12. Para comprobar su funcionamiento puede hacer uso de los enlaces correspondientes.

---

## Search

La función de búsqueda aplica para todos los campos del texto que hayan sido definidos previamente en un indice (index) en la colección, para este caso lo enviado será utilizado como parámetro de búsqueda. No es necesario agregar paréntesis para indicar que argumentos se separan de otros. 

### Casos de uso soportados

- Obtiene todos los documentos que contengan una o más palabras en los campos de texto que fueron definidos en el indice de texto.
- Soporta el uso de Operadores Lógicos como AND, OR y NOT.
- Puede usar más de una palabra como un solo argumento de búsqueda.

### Casos no soportados

- Solo obtener resultados donde la búsqueda es exacta.
- Uso de subcadenas como argumento.
- Definir búsquedas más complejas con el uso de paréntesis u otra sintaxis.
- Realizar búsquedas en un campo en específico.

### Sintaxis 

Solo es necesario envíar una cadena de texto con todos los argumentos y operadores separados por un espacio como:

> (NOT) Value AND|OR|NOT value

En un proyecto propio deberá definirse de la siguiente forma si usamos el ejemplo de enviar la palabra "proteína:

```javascript
import { searchFilter } from 'mongodb-filter-object-parser';

filtro_busqueda = searchFilter("proteína")
return resultados = collection.find(filtro_busqueda);
```

Se creará el filtro con el parámetro "proteína" de las siguiente manera: 

```javascript
{"$text":{"$search":"proteína"}}
```

También puedes encadenar varios argumentos usando los operadores lógicos AND, OR y NOT simplemente agregándolos en el string que va como valor de *search*.

```javascript
import { searchFilter } from 'mongodb-filter-object-parser';

filtro_busqueda = searchFilter("proteina AND gen")
return resultados = collection.find(filtro_busqueda);
```

El anterior regresaría un filtro con 2 argumentos, y siguiendo la sintaxis aceptada por Mongo en búsquedas de Texto sería así:

```javascript
{"$text":{"$search":" \"proteina\" \"gen\""}}
```

Nota: Puedes utilizar múltiples palabras como un solo término de búsqueda utilizando comillas dobles ("palabras a buscar") o comillas simples ('palabras a buscar') en ambos caos deberán estar escapeadas como en el siguiente ejemplo:

```javascript
import { searchFilter } from 'mongodb-filter-object-parser';

filtro_busqueda = searchFilter("proteínas complejas")
return resultados = collection.find(filtro_busqueda);
```

Eso retorna un filtro como:

```javascript
{"$text":{"$search":"\"proteínas complejas\""}}
```

En está función se usan cuantos parámetros como se deseen simplemente hay que separarlos por sus respectivos operadores lógicos, ésta función no es utilizada en RegulonDB.

---

## textSearch

La función de textSearch permite hacer búsquedas de texto en los campos que sean definidos por el usuario desde la función correspondiente, ésta función no requiere de la creación ni modificación de un indice (index) de propiedades de tipo texto, y permite solo añadir y quitar campos desde la llamada de la función.

Está función está implementada en los servicios de GraphQL de RegulonDB de tipo "getBy" cuando se usa el parámetro de entrada "search" así como del parámetro de properties. Los properties son los campos por los que realizará la búsqueda que se coloqué en search y si bien desde el desarrollo ya se definieron los campos más recurrentes de búsqueda por default, estos se pueden modificar.

### Casos de uso soportados

- Utiliza una expresión regular para obtener todos los documentos que hacen un match exacto con la búsqueda
- Obtiene todos los documentos que contiene una palabra, subpalabra o más de una palabra de los campos definidos.
- Soporta el uso de Operadores Lógicos como AND, OR y NOT.
- Puede usar más de una palabra como un solo argumento de búsqueda.

### Casos no soportados

- Control de lógica avanzada de consulta con el uso de separación por paréntesis.
- Hacer la consulta en solamente un campo especifico del documento.
- Usar un index predefinido de propiedades tipo texto en la colección.

### Sintaxis

Solo es necesario envíar una cadena de texto con todos los argumentos y operadores separados por un espacio como:

> (NOT) Value AND|OR|NOT value

Utilizando un ejemplo:

> azul AND alto

Devolviendo un filtro de la siguiente forma: 

```json
{ 
    "$and": [
        { 
            "$or": [
                { "object.color": /alto\b/i }, 
                { "object.height": /alto\b/i } 
            ] 
        }, 
        { 
            "$or": [
                { "object.color": /azul\b/i }, 
                { "object.height": /azul\b/i } 
            ]  
        } 
    ] 
}
```

### Opciones de configuración

##### properties

La función de textSearch requiere de un argumento que indique los campos por los que se realizará la búsqueda, este debe ser un arreglo de cadenas con todos los campos definidos dada su propio modelo de colección.

##### fullMatchOnly

Le indica a la funcuón si la búsqueda solo regresará resultados donde la coincidencia sea completamente exacto, por default las búsquedas permiten devolver subcadenas encontradas, es decir este valor es "False"

Ejemplos utilizables en el Playground de RegulonDB GraphQL API:

```json
{
	getRegulonBy(search: "agaR or araC"){
		data{
		_id
		transcriptionFactor{
			name
			encodedFrom{
			genes{
				name
			}
			operon{
				name
			}
			}
		}
		}
	}
  }
```

Nota: Puedes utilizar múltiples palabras como un solo término de búsqueda utilizando comillas dobles ("palabras a buscar") o comillas simples ('palabras a buscar') en ambos caos deberán estar escapeadas como en el siguiente ejemplo:

```json
{
	getRegulonBy(search: "agaR or \"araC arabinose\""){
		data{
		_id
		transcriptionFactor{
			name
			encodedFrom{
			genes{
				name
			}
			operon{
				name
			}
			}
		}
		}
	}
  }
```
---

### advancedSearch

La función de búsqueda avanza permite la definición de consultas más complejas para obtener resultados de la Base de datos.

### Casos de uso soportados

- Obtiene los documentos que contienen el valor definido en el campo solicitado.
- Permite un mayor control de niveles de profundidad de la consulta como un árbol de búsqueda binario.
- Soporta el uso de Operadores Lógicos como AND, OR y NOT.
- El argumento de búsqueda siempre es case insentive (no importa si es con mayúsculas o minúsculas).
- queries con rangos númericos (enteros o decimales).

### Casos no soportados

- Queries que requieran búsqueda por rango de fechas.currently.

### Sintaxis

La sintaxis de la cadena debe seguir el siguiente orden:

>(not) (Value[Field]) or|and|not Value[Field]

Ejemplo: 

> ((Green[Color] or Blue[Color]) or Red[Color]) and Medium[Size]

Para este caso la sintaxis si requiere de más exactitud especificando tanto el valor como el campo donde se quiere encontrar (encerrado en corchetes), asimismo, cada vez que se quiera añadir un nuevo parámetro, se debe encerrar el anterior estado de la cadena entre paréntesis, por ejemplo:

*Primera búsqueda:*

```json
advancedSearch:"reverse[geneInfo.strand]"
```

Con esto se le indicaría al query que muestre los documentos que en su campo geneInfo.strand tengan el valor exacto reverse. Asimismo se pueden agregar más parámetros usando los operadores lógicos.

*Segunda búsqueda:*

```json
advancedSearch:"(not forward[geneInfo.strand]) and G67[geneInfo.name]"
```

En la anterior, se añadió un nuevo parámetro de búsqueda con un AND, para eso la cadena que se tenía antes de añadir el nuevo parámetro debe ser colocada entre paréntesis (y cada vez que se necesite añadir más argumentos de búsqueda). *Tercera búsqueda:*

```json
advancedSearch:"((not forward[geneInfo.strand]) and G67[geneInfo.name]) not RDBECOLIGN04398[geneInfo.id]"
```

Usándolo en un query de GraphQL: 

```json
query{
  getGenesBy(advancedSearch:"((not forward[geneInfo.strand]) and G67[geneInfo.name]) not RDBECOLIGN04398[geneInfo.id]")
  {
    geneInfo{
      name
      id
      strand
      leftEndPosition
      rightEndPosition
    }
    products{
      name
      regulatorId
    }
  }
}
```

Ésta ultima búsqueda genería un filtro como éste:

```json
{
  "$and": [
    {
      "geneInfo.id": {
        "$not": {/RDBECOLIGN04398/i}
      }
    },
    {
      "$and": [
        {
          "geneInfo.name": {/G67/i}
        },
        {
          "$and": [
            {
              "geneInfo.strand": {
                "$not": {/forward/i}
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Finalmente también se pueden agregar valores de búsqueda compuestos por 2 o más palabras, también usando comillas escapeadas pero ésta vez especificando el campo:

```json
advancedSearch:"\"3-hydroxy acid dehydrogenase\"[products.name]"
```

### **Notas:** 

- Todas las búsquedas son hechas con case insensitive, por lo que no importa si se envía una combinación de mayúsculas y minúsculas. 

- En el caso de advancedSearch, el módulo no mete como string el valor a buscar, para tener una función parecida al *Likes* de mysql, con esto no es necesario conocer el valor completamente exacto para hacer match.