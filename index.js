
document.addEventListener('DOMContentLoaded', function () {
    getData(1)
        .then(function (data) {
            printData(data);
        })
        .catch(function (error) {
            console.error(error);
        });
});

let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");

prevBtn.addEventListener('click', function () {
    let num = (parseInt(nextBtn.getAttribute('data-page')) - 1);
    num = num == 0 ? 1 : num;
    prevBtn.setAttribute('data-page', num);
    nextBtn.setAttribute('data-page', num);
    getData(num)
        .then(function (data) {
            printData(data);
        })
        .catch(function (error) {
            console.error(error);
        });
});

nextBtn.addEventListener('click', function () {

    let num = parseInt(nextBtn.getAttribute('data-page')) + 1;
    nextBtn.setAttribute('data-page', num);
    prevBtn.setAttribute('data-page', num);
    getData(num)
        .then(function (data) {
            printData(data);
        })
        .catch(function (error) {
            console.error(error);
        });
});




function getData(num=null) {
    return new Promise(function (resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        let urlDestino = "https://swapi.py4e.com/api/people/?page=" + num;

        xmlHttp.open("GET", urlDestino, true);
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4) {
                if (xmlHttp.status == 200) {
                    resolve(xmlHttp.responseText);
                } else {
                    reject(new Error("Request failed with status: " + xmlHttp.status));
                }
            }
        };
        xmlHttp.send(null);
    });
}


function printData(data) {
    const jsonData = JSON.parse(data);
    const people = jsonData.results;
    let infoDiv = document.getElementById("info");

    infoDiv.innerHTML = "";

    people.forEach(person => {
        let personInfo = document.createElement("div");
        personInfo.innerHTML = `
            <p>Name: ${person.name}</p>
            <p>Height: ${person.height}</p>
            <p>Hair: ${person.hair_color}</p>
            <p>Skin: ${person.skin_color}</p>
            <p>Eyes: ${person.eye_color}</p>
            <p>Birth Year: ${person.birth_year}</p>
            <p>Gender: ${person.gender}</p>
            <hr>
        `;
        infoDiv.appendChild(personInfo);

        let inputFile = document.createElement("input");
        let uploadButton = document.createElement("button");
        uploadButton.textContent = "Upload"
        inputFile.type = "file";
        personInfo.appendChild(inputFile);
        personInfo.appendChild(uploadButton);
        const characterInfo = {
            name: person.name,
            height: person.height,
            hair_color: person.hair_color,
            skin_color: person.skin_color,
            eye_color: person.eye_color,
            birth_year: person.birth_year,
            gender: person.gender,
        }
        uploadButton.addEventListener("click", (e) => {
            e.preventDefault()

            let form = new FormData();
            form.append('characterInfo', JSON.stringify(characterInfo))
            form.append("file", inputFile.files[0]);

            fetch("http://localhost:8001/persona", {
                method: "POST",
                body: form
            })
                .then(
                    (resp) => {
                        resp.json().then(
                            (respJSON) => {
                            }
                        )
                    }
                )
        })
        personInfo.addEventListener('click', (e) => {
            const fileName = characterInfo.name.replace(/ /g, '_');
            if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
                fetch("http://localhost:8001/persona/" + fileName, {
                    method: "GET",
                }).then((resp) => {
                    resp.json().then(
                        (respJSON) => {

                            const overlay = document.createElement('div');
                            overlay.setAttribute("style", "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); z-index: 999;");

                            const div = document.createElement('div');
                            div.setAttribute("style", "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); z-index: 1000;");
                            div.innerHTML = `
                                <h2>${respJSON.name} Info</h2>
                                <p><strong>Name:</strong> ${respJSON.name}</p>
                                <p><strong>Height:</strong> ${respJSON.height} cm</p>
                                <p><strong>Hair:</strong> ${respJSON.hair_color}</p>
                                <p><strong>Skin:</strong> ${respJSON.skin_color}</p>
                                <p><strong>Eyes:</strong> ${respJSON.eye_color}</p>
                                <p><strong>Birth Year:</strong> ${respJSON.birth_year}</p>
                                <p><strong>Genre:</strong> ${respJSON.gender}</p>
                                ${respJSON.img ? `<img src="./server/data/${respJSON.img}" alt="Img ${respJSON.name}" style="width:70%; height: 300px">` : ''}
                            `;

                            overlay.appendChild(div);

                            document.body.appendChild(overlay);

                            overlay.addEventListener('click', (event) => {
                                if (event.target === overlay) {
                                    document.body.removeChild(overlay);
                                }
                            });

                            div.addEventListener('click', (event) => {
                                event.stopPropagation();
                            });
                        }
                    )
                })
                    .catch(error => {
                    });

            }
        });
    });
}


document.getElementById("startBtn").addEventListener("click", () => {
    document.getElementById("optionsCharacters").innerHTML = "";
    document.getElementById("comparationCharacters").innerHTML = "";
    document.getElementById("starwadleInput").value = "";
    document.getElementById("starwadleInput").style.display = "block";
    document.getElementById("checkBtn").style.display = "block";
    let wordle = document.getElementById("interactWordle");
    wordle.classList.remove('d-none');
    wordle.classList.add('d-flex');
    let guess = document.getElementById("characterToGuessText");
    guess.classList.remove('d-none');
    guess.classList.add('d-block');

    let start = true
    fetch("http://localhost:8001/starwardle", {
        method: "POST",
        body: start
    })
        .then(
            (resp) => {
                resp.json().then(
                    (respJSON) => {
                        document.getElementById("characterToGuess").innerHTML = "";
                        document.getElementById("characterToGuess").style.border = "1px solid black";
                        document.getElementById("characterToGuess").style.width = "40%";
                        document.getElementById("characterToGuess").style.marginTop = "10px";

                        let i = 0;
                        const keys = Object.keys(respJSON.personajeAdivinar);
                        const intervalId = setInterval(() => {
                            if (i < keys.length) {
                                const atributo = keys[i];
                                if (atributo != "name" && atributo != "img") {
                                    const p = document.createElement("p");
                                    p.textContent = `${atributo}: ${respJSON.personajeAdivinar[atributo]}`;
                                    document.getElementById("characterToGuess").appendChild(p); 
                                }
                                i++;

                            } else {
                                clearInterval(intervalId); 
                            }
                        }, 50);
                    }
                )
            }
        )
})

document.getElementById("checkBtn").addEventListener("click", () => {
    const name = document.getElementById("starwadleInput").value;

    fetch("http://localhost:8001/compararPersonaje", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombre: name })
    })
        .then(resp => {
            resp.json().then(respJSON => {
                let div = document.createElement("div");
                div.style.width = "40%";
                div.style.display = "inline-block";
                div.style.marginTop = "10px";
                div.style.marginLeft = "5px";
                document.getElementById("comparationCharacters").prepend(div);

                let i = 0;
                let adivinado = true;
                const keys = Object.keys(respJSON.datos);
                const intervalId = setInterval(() => {
                    if (i < keys.length && keys[i] != "img") {
                        const atributo = keys[i];
                        const p = document.createElement("p");
                        const valor = respJSON.datos[atributo];
                        if (adivinado && !respJSON.comparaciones[atributo]) {
                            adivinado = false;
                        }
                        const comparacion = respJSON.comparaciones[atributo];

                        p.textContent = `${atributo}: ${valor}`;
                        p.style.color = comparacion ? "green" : "red";

                        if (comparacion) {
                            p.classList.add("green");
                        } else {
                            p.classList.add("red");
                        }

                        div.appendChild(p);
                        i++;
                    } else {
                        if (adivinado) {
                            document.getElementById("starwadleInput").style.display = "none";
                            let textWin = document.getElementById("youWin");
                            textWin.classList.remove('d-none');
                            textWin.classList.add('d-block');
                            if(respJSON.datos["img"]){
                                let winnerImg = document.getElementById("winnerImg");
                                winnerImg.style.display = "block";
                                winnerImg.style.width = "20%";
                                winnerImg.style.height = "300px";
                                winnerImg.setAttribute("src", "./server/data/" + respJSON.datos["img"]);

                            } else {
                                let noImgText = document.getElementById("noImgText");
                                noImgText.innerHTML = "<b>No image found</b>";
                                noImgText.style.display = "block";
                            }
                            div.style.border = "1px solid green";
                        } else {
                            div.style.border = "1px solid red";
                        }
                        clearInterval(intervalId); 
                    }
                }, 50); 

                document.getElementById("starwadleInput").value = "";
                document.getElementById("optionsCharacters").innerHTML = "";
            });
        });
});




document.getElementById("starwadleInput").addEventListener("keyup", (e) => {
    if(document.getElementById("starwadleInput").value == "") {
        document.getElementById("checkBtn").setAttribute("disabled", true);
    }    let name = document.getElementById("starwadleInput").value;
    fetch("http://localhost:8001/buscarPersonajes", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json', 
        },
        body: JSON.stringify({ name: name }) 
    })
        .then(resp => resp.json())
        .then(respJSON => {
            document.getElementById("optionsCharacters").innerHTML = "";
            for (let i = 0; i < respJSON.length; i++) {
                let div = document.createElement("div")
                div.classList.add("characterOption");

                div.addEventListener("click", () => {
                    document.getElementById("checkBtn").removeAttribute("disabled")

                    document.getElementById("starwadleInput").value = respJSON[i].name;
                    document.getElementById("optionsCharacters").innerHTML = "";

                })
                if (respJSON[i].img) {
                    let img = document.createElement("img");
                    img.src = `./server/data/${respJSON[i].img}`;
                    img.alt = `Imagen de ${respJSON[i].name}`;
                    img.style.maxWidth = "100px"; 
                    div.appendChild(img);
                }
                let p = document.createElement("p");
                p.textContent = respJSON[i].name;
                div.append(p)

                document.getElementById("optionsCharacters").append(div);
                document.getElementById("optionsCharacters").style.border = "1px solid black";
            }
          
        })
        .catch(error => {
        });
});