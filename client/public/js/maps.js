const maps = JSON.parse(localStorage.getItem("recentMaps"));
maps.forEach(map => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let seed = document.createTextNode(map.seed);
    let time = document.createTextNode(map.time);
    td1.appendChild(seed);
    td2.appendChild(time);
    tr.appendChild(td1);
    tr.appendChild(td2);
    let element = document.getElementsByTagName("tbody")[0];
    element.appendChild(tr);
})