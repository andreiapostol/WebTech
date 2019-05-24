fetch('http://localhost:3001/rankings/score_range/0/10')
    .then(response => response.json())
    .then(data => {
        data.forEach((entry, index) => {
            let tr = document.createElement("tr");
            let td1 = document.createElement("td");
            let td2 = document.createElement("td");
            let td3 = document.createElement("td");
            const name = document.createTextNode(entry.name);
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
// maps.reverse().forEach(map => {
//     let tr = document.createElement("tr");
//     let td1 = document.createElement("td");
//     let td2 = document.createElement("td");
//     let td3 = document.createElement("td");
//     td3.insertAdjacentHTML('beforeend', '<form><fieldset class="star-rating"><div class="star-rating__stars"><input class="star-rating__input" type="radio" name="rating" value="1" id="' + map.time.toString() + '-1" /><label class="star-rating__label" for=id="' + map.time.toString() + '-1 aria-label="One"></label><input class="star-rating__input" type="radio" name="rating" value="2" id="' + map.time.toString() + '-2" /><label class="star-rating__label" for="' + map.time.toString() + '-2" aria-label="Two"></label><input class="star-rating__input" type="radio" name="rating" value="3" id="' + map.time.toString() + '-3"/><label class="star-rating__label" for="' + map.time.toString() + '-3" aria-label="Three"></label>                <input class="star-rating__input" type="radio" name="rating" value="4" id="' + map.time.toString() + '-4" /><label class="star-rating__label" for="' + map.time.toString() + '-4" aria-label="Four"></label><input class="star-rating__input" type="radio" name="rating" value="5" id="' + map.time.toString() + '-5"/><label class="star-rating__label" for="' + map.time.toString() + '-5" aria-label="Five"></label></div></fieldset></form>');
//     td1.insertAdjacentHTML('beforeend', '<center><a href="./?seed=' + map.seed + '">' + map.seed + "</a></center>");
//     let time = document.createTextNode(map.time);
//     td2.appendChild(time);
//     tr.appendChild(td1);
//     tr.appendChild(td2);
//     tr.appendChild(td3);
//     let element = document.getElementsByTagName("tbody")[0];
//     element.appendChild(tr);
// })