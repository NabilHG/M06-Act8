const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/persona/') {
        const form = new formidable.IncomingForm();
        let resposta = {}
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Error peticio' })); return;
            }
            if (fields) { //si s'han enviat parámetres
                resposta["parametres"] = [fields["param1"], fields["param2"]]
            }
            if (files) {//si s'han enviat arxius
                const arxiu = files["arxiu"][0];
                const fileName = arxiu.originalFilename;
                form.uploadDir = __dirname + '/arxius';
                fs.rename(arxiu.filepath, form.uploadDir + '/' + fileName, async (err) => {
                    if (err) {
                        res.statusCode = 400;
                        res.end(JSON.stringify({ error: "no al guardar la imatge" })); return;
                    }
                    resposta["imatge"] = form.uploadDir + '/' + fileName
                    res.statusCode = 200;
                    res.end(JSON.stringify(resposta));
                });
            } else {
                res.statusCode = 200;
                res.end(JSON.stringify(resposta));
            }
        });
    } else { res.statusCode = 404; res.end(JSON.stringify({ error: 'Ruta no encontrada' })); }
});