const maps = JSON.parse(localStorage.getItem("recentMaps"));
maps.reverse().forEach(map => {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    let td2 = document.createElement("td");
    let td3 = document.createElement("td");
    td3.insertAdjacentHTML('beforeend', '<fieldset class="star-rating"><div class="star-rating__stars"><input class="star-rating__input" type="radio" name="rating" value="1" id="rating-1" /><label class="star-rating__label" for="rating-1" aria-label="One"></label><input class="star-rating__input" type="radio" name="rating" value="2" id="rating-2" /><label class="star-rating__label" for="rating-2" aria-label="Two"></label><input class="star-rating__input" type="radio" name="rating" value="3" id="rating-3" /><label class="star-rating__label" for="rating-3" aria-label="Three"></label>                <input class="star-rating__input" type="radio" name="rating" value="4" id="rating-4" /><label class="star-rating__label" for="rating-4" aria-label="Four"></label><input class="star-rating__input" type="radio" name="rating" value="5" id="rating-5" /><label class="star-rating__label" for="rating-5" aria-label="Five"></label></div></fieldset>');
    td1.insertAdjacentHTML('beforeend', '<center><a href="./?seed=' + map.seed + '">' + map.seed + "</a></center>");
    let time = document.createTextNode(map.time);
    td2.appendChild(time);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    let element = document.getElementsByTagName("tbody")[0];
    element.appendChild(tr);
})