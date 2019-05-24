fetch('http://localhost:3001/ranksRange?beginAt=0&endAt=10')
    .then(response => response.json())
    .then(data => {
        data.forEach((entry, index) => {
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            let td2 = document.createElement("td");
            let td3 = document.createElement("td");
            const name = document.createTextNode(entry.username);
            const id = document.createTextNode(index + 1);
            const score = document.createTextNode(entry.score);
            td1.appendChild(id);
            td2.appendChild(name);
            td3.appendChild(score);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            let element = document.getElementsByTagName("tbody")[0];
            element.appendChild(tr);
        })
    });