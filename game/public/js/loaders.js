export function imageLoader(url){
    return new Promise(resolve => {
        const image = new Image();
        image.addEventListener('load', ()=>{
            resolve(image);
        });
        image.src = url;
    })
}

export function mapLoader(name){
    return fetch(`./maps/${name}.json`).then(result => result.json());
}