
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
});

nextBtn.addEventListener('click', function(){
    console.log("sa");
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


function printData(data){
    const jsonData = JSON.parse(data);
        const people = jsonData.results;
        
        people.forEach(person => {
            console.log("Name:", person.name);
            console.log("Height:", person.height);
            console.log("Hair:", person.hair_color);
            console.log("Skin:", person.skin_color);
            console.log("Eyes:", person.eye_color);
            console.log("Birth Year:", person.birth_year);
            console.log("Gender:", person.gender);
            console.log("---------------------------");
        });
}