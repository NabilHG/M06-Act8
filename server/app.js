const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/persona', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
        res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        let imageName = null;
        if (files['arxiu']) {
            const arxiu = files["arxiu"][0];
            const originalFilename = arxiu.originalFilename;
            const extension = originalFilename.match(/\.[^.]+$/);

            form.uploadDir = __dirname + '/data';
            let charactertoSave = JSON.parse(fields.characterInfo);
            const fileName = charactertoSave.name.replace(/ /g, '_');
            imageName = fileName + extension[0];
            fs.rename(arxiu.filepath, form.uploadDir + '/' + fileName + extension[0], async (err) => {
                if (err) {
                    res.statusCode = 400;
                    // res.end(JSON.stringify({ error: "no al guardar la imatge" })); return;
                }
            });
        }
        if (fields) {
            let charactertoSave = JSON.parse(fields.characterInfo);
            charactertoSave.img = imageName;

            const fileName = charactertoSave.name.replace(/ /g, '_');
            const directorioDestino = path.join(__dirname, 'persona');
            const filePath = path.join(directorioDestino, fileName + '.json');

            fs.writeFile(filePath, JSON.stringify(charactertoSave), async (err) => {
                if (err) {
                } else {
                    fs.readFile(filePath, async (err, data) => {
                        if (err) {
                        } else {
                            let json_llegit = JSON.parse(data);
                            // console.log(json_llegit)
                        }
                    });
                }
            });
        }
    });
});

app.get('/persona/:personaje', (req, res) => {
    let personaje = req.params.personaje;
    fs.readFile(__dirname + '/persona/' + personaje + '.json', async (err, data) => {
        if (err) {
            console.log("error al llegir l'arxiu");
        } else {
            let json_llegit = JSON.parse(data);
            res.statusCode = 200;

            res.json(json_llegit);
        }
    });
});

const server = app.listen(8001, () => {
    console.log("Servidor iniciat al port 8001");
});

let personajeAdivinar = {};
let personajesProbados = [];

function obtenerPersonajeAleatorio() {
    return new Promise((resolve, reject) => {
        const directorioPersonajes = path.join(__dirname, 'persona');
        fs.readdir(directorioPersonajes, (err, archivos) => {
            if (err) {
                console.log("Error al listar los archivos:", err);
                reject(err); // Rechazar la promesa si hay un error
                return;
            }
            const totalArchivos = archivos.length;
            if (totalArchivos > 0) {
                const indiceAleatorio = Math.floor(Math.random() * totalArchivos);
                const archivoSeleccionado = archivos[indiceAleatorio];
                const rutaArchivo = path.join(directorioPersonajes, archivoSeleccionado);
                fs.readFile(rutaArchivo, (err, data) => {
                    if (err) {
                        console.log("Error al leer el archivo:", err);
                        reject(err); // Rechazar la promesa si hay un error
                        return;
                    }
                    const personaje = JSON.parse(data);
                    personajeAdivinar = personaje;
                    resolve(personajeAdivinar); // Resolver la promesa con el personaje obtenido
                });
            } else {
                reject(new Error("No hay archivos en el directorio de personajes")); // Rechazar la promesa si no hay archivos
            }
        });
    });
}



app.post('/starwardle', bodyParser.json(), (req, res) => {
    obtenerPersonajeAleatorio()
        .then(personaje => {
            personajesProbados = [];
            res.json({ personajeAdivinar: personajeAdivinar });
            // Aquí puedes continuar con el resto del código que depende del personaje obtenido
        })
        .catch(error => {
            console.error("Error al obtener el personaje:", error);
            // Manejar el error aquí, si es necesario
        });

});


app.post('/compararPersonaje', bodyParser.json(), (req, res) => {
    let { nombre } = req.body;
    const nombreConGuionBajo = nombre.replace(/ /g, '_'); // Reemplazar espacios en blanco por guiones bajos
    if (!personajesProbados.includes(nombre.replace(/ /g, '_'))) {
        personajesProbados.push(nombreConGuionBajo)

    }
    // Si no hay personaje a adivinar, no hay comparación
    if (!personajeAdivinar || !personajeAdivinar.name) {
        return res.status(400).json({ error: "No hay personaje a adivinar" });
    }


    // Buscar un archivo con un nombre similar en el directorio
    const directorioPersonajes = path.join(__dirname, 'persona');
    fs.readdir(directorioPersonajes, (err, archivos) => {
        if (err) {
            return res.status(500).json({ error: "Error al listar los archivos" });
        }

        // Verificar si hay un archivo con un nombre similar
        const archivoSimilar = archivos.find(archivo => archivo.toLowerCase() === `${nombreConGuionBajo.toLowerCase()}.json`);

        if (!archivoSimilar) {
            // Si no se encontró un archivo similar, indicar que el personaje no existe
            return res.json({ resultado: "El personaje no existe" });
        }

        // Leer el archivo del personaje similar
        const rutaArchivoSimilar = path.join(directorioPersonajes, archivoSimilar);
        fs.readFile(rutaArchivoSimilar, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Error al leer el archivo" });
            }

            const personajeSimilar = JSON.parse(data);

            // Comparar cada atributo del personaje similar con el personaje a adivinar
            const comparaciones = {};
            for (const atributo in personajeAdivinar) {
                comparaciones[atributo] = personajeSimilar[atributo] === personajeAdivinar[atributo];
            }

            // Enviar el resultado de la comparación y los datos del personaje al cliente
            res.json({ datos: personajeSimilar, comparaciones });
        });
    });
});


app.post('/buscarPersonajes', bodyParser.json(), (req, res) => {
    const { name } = req.body; // Asumiendo que el campo de búsqueda se llama 'busqueda'
    const directorioPersonajes = path.join(__dirname, 'persona');
    fs.readdir(directorioPersonajes, (err, archivos) => {
        if (err) {
            return res.status(500).json({ error: "Error al listar los archivos" });
        }

        const resultadosBusqueda = [];

        let archivosProcesados = 0;
        archivos.forEach(archivo => {
            const nombreArchivoSinExtension = archivo.replace('.json', '');
            const rutaArchivo = path.join(directorioPersonajes, archivo);
            fs.readFile(rutaArchivo, (err, data) => {
                archivosProcesados++;
                if (!err) {
                    const personaje = JSON.parse(data);
                    // Aquí ajustas tu lógica de búsqueda según necesites, por ejemplo:
                    if (personaje.name && personaje.name.toLowerCase().includes(name.toLowerCase()) && !personajesProbados.includes(nombreArchivoSinExtension.replace(/ /g, '_'))) {
                        resultadosBusqueda.push(personaje);
                    }
                }

                // Si ya procesamos todos los archivos, respondemos
                if (archivosProcesados === archivos.length) {
                    console.log(resultadosBusqueda)
                    res.json(resultadosBusqueda);
                }
            });
        });

        // En caso de que no haya archivos
        if (archivos.length === 0) {
            res.json(resultadosBusqueda);
        }
    });
});
