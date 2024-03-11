
document.addEventListener('DOMContentLoaded', function() {
    getData(1)
    .then(function(data) {
        console.log(data);
        printData(data);
    })
    .catch(function(error) {
        console.error(error);
    });
});

let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");

prevBtn.addEventListener('click', function(){
    console.log("as");
    let num = (parseInt(nextBtn.getAttribute('data-page')) - 1);
    num = num == 0 ? 1 : num;
    prevBtn.setAttribute('data-page', num);
    nextBtn.setAttribute('data-page', num);
    getData(num)
    .then(function(data) {
        console.log(data);
        printData(data);
    })
    .catch(function(error) {
        console.error(error);
    });
});

nextBtn.addEventListener('click', function(){
    console.log("sa");
    let num = parseInt(nextBtn.getAttribute('data-page')) + 1;
    nextBtn.setAttribute('data-page', num);
    prevBtn.setAttribute('data-page', num);
    getData(num)
    .then(function(data) {
        console.log(data);
        printData(data);
    })
    .catch(function(error) {
        console.error(error);
    });
});


function getData(num) {
    return new Promise(function(resolve, reject) {
        let xmlHttp = new XMLHttpRequest();
        let urlDestino = "https://swapi.py4e.com/api/people/?page="+num;
        xmlHttp.open("GET", urlDestino, true);
        xmlHttp.onreadystatechange = function() {
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

// getData()
//     .then(function(data) {
//         console.log(data);
//         printData(data);
//     })
//     .catch(function(error) {
//         console.error(error);
//     });


// function printData(data){
//     const jsonData = JSON.parse(data);
//     const people = jsonData.results;
//     let infoDiv = document.getElementById("info");
    
//     infoDiv.innerHTML = ""; // Limpiamos el contenido previo del div

//     people.forEach(person => {
//         let personInfo = document.createElement("div");
//         personInfo.innerHTML = `
//             <p>Name: ${person.name}</p>
//             <p>Height: ${person.height}</p>
//             <p>Hair: ${person.hair_color}</p>
//             <p>Skin: ${person.skin_color}</p>
//             <p>Eyes: ${person.eye_color}</p>
//             <p>Birth Year: ${person.birth_year}</p>
//             <p>Gender: ${person.gender}</p>
//             <hr>
//         `;
//         infoDiv.appendChild(personInfo);
//     });
// }

function printData(data) {
    const jsonData = JSON.parse(data);
    const people = jsonData.results;
    let infoDiv = document.getElementById("info");

    infoDiv.innerHTML = ""; // Limpiamos el contenido previo del div

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
            <input type="file" class="fileInput">
            <button class="uploadButton">Upload</button>
            <hr>
        `;
        infoDiv.appendChild(personInfo);

        // Agregar listener para cada botón de carga
        let uploadButtons = personInfo.querySelectorAll(".uploadButton");
        uploadButtons.forEach(button => {
            button.addEventListener("click", function() {
                let fileInput = this.previousSibling; // Obtener el input de archivo asociado
                let file = fileInput.files[0]; // ERROR:  Cannot read properties of undefined (reading '0') 

                if (file) {
                    let formData = new FormData();
                    formData.append("photo", file);
                    // Agregar la información de la persona al FormData
                    formData.append("name", person.name);
                    formData.append("height", person.height);
                    formData.append("hair_color", person.hair_color);
                    formData.append("skin_color", person.skin_color);
                    formData.append("eye_color", person.eye_color);
                    formData.append("birth_year", person.birth_year);
                    formData.append("gender", person.gender);

                    fetch("/persona/", {
                        method: "POST",
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log("File uploaded successfully:", data);
                        // Aquí puedes manejar la respuesta del servidor si es necesario
                    })
                    .catch(error => {
                        console.error("Error uploading file:", error);
                    });
                } else {
                    console.error("No file selected.");
                }
            });
        });
    });
}

