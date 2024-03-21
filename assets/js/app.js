const cl = console.log;

const addBtn = document.getElementById("addBtn");
const ourmodal = document.getElementById("ourmodal");
const backdrop = document.getElementById("backdrop");
const cancel = [...document.querySelectorAll(".cancel")];
const movieContainer = document.getElementById("movieContainer");
const titleControl = document.getElementById("title");
const imgSource = document.getElementById("imgSource");
const rating = document.getElementById("rating");
const formControl = document.getElementById("formControl");
const updateBtn = document.getElementById("updateBtn");
const addMovie = document.getElementById("addMovie");

let baseUrl = `https://movie-modal-2-default-rtdb.asia-southeast1.firebasedatabase.app`;
let postsUrl = `${baseUrl}/movies.json`;

const onAddMovieBtn = () => {
    ourmodal.classList.toggle("d-none");
    backdrop.classList.toggle("d-none")
}

const onDelete = (eve) => {
    let getId = eve.closest(".card").id;
    let deleteUrl = `${baseUrl}/movies/${getId}.json`;
    makeApiCall("DELETE", deleteUrl)
        .then(res => {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
              }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById(getId).remove();
                  Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                  });
                }
              });
        })
        .catch(err => cl(err))
}

const onEdit = (eve) => {

    let getId = eve.closest(".card").id;
    cl(getId)
    localStorage.setItem("getId", getId);
    let editUrl = `${baseUrl}/movies/${getId}.json`;
    makeApiCall("GET", editUrl)
        .then(res => {
            cl(res);
            titleControl.value = res.title;
            imgSource.value = res.path;
            rating.value = res.rating;
            onAddMovieBtn();
            addMovie.classList.add("d-none");
            updateBtn.classList.remove("d-none");
        })
        .catch(err => cl(err))
}


const makeApiCall = (methodName, apiUrl, msgBody = null) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(methodName, apiUrl);
        xhr.send(JSON.stringify(msgBody));
    
        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
                resolve(JSON.parse(xhr.response));
            }else{
                reject(`Something went wrong !!!`);
            }
        }
    })
}

const createMovie = (obj) => {
    let card = document.createElement("div");
    card.className = "card mt-4 movieCard";
    card.id = obj.id;
    card.innerHTML = `
                                <div class="card-header">
                                    <h4>${obj.title}</h4>
                                </div>
                                <div class="card-body cardBody p-0">
                                    <img class="p-0" src="${obj.path}" alt="movieImg">
                                </div>
                                <div class="card-footer d-flex justify-content-between">
                                    <button class="btn btn-primary" type="button" onclick="onEdit(this)">Edit</button>
                                    <button class="btn btn-danger" type="button" onclick="onDelete(this)">Delete</button>
                                </div>
                                
    `
    movieContainer.prepend(card);
}

const createCards = (arr) => {
    movieContainer.innerHTML = arr.map(obj => {
        return `
                    <div class="card mt-4 movieCard" id= ${obj.id}> 
                        <div class="card-header">
                            <h4>${obj.title}</h4>
                        </div>
                        <div class="card-body cardBody p-0">
                            <img class="p-0" src="${obj.path}" alt="movieImg">
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" type="button" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger" type="button" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div>
        `

    }).join(" ");

}

makeApiCall("GET", postsUrl)
	.then(res => {
		cl(res);
		let postsArr = [];
		let object = res;
        for (const key in object) {
            let obj = {...object[key], id : key};
            postsArr.push(obj);
            createCards(postsArr);
        }
	})
	.catch(err => cl(err))

let postDataInDB = (eve) => {
    eve.preventDefault();
    let obj = {
        title : titleControl.value,
        path : imgSource.value,
        rating : rating.value
    }
    makeApiCall("POST", postsUrl, obj)
        .then(res => {
            cl(res);
            obj.id = res.name;
            cl(obj)
            createMovie(obj);
            onAddMovieBtn();
            Swal.fire({
                title : "Movie added !!!",
                icon : `success`
            })
        })
        .catch(err => cl(err))
        .finally(()=>{
            formControl.reset();
        })
    
}

const onUpdateHandler = () => {
    let getId = localStorage.getItem("getId");
    let updateUrl = `${baseUrl}/movies/${getId}.json`;
    let obj = {
        title : titleControl.value,
        path : imgSource.value,
        rating : rating.value
    }
    makeApiCall("PATCH", updateUrl, obj)
        .then(res => {
            cl(res)
            let card = [...document.getElementById(getId).children];
            card[0].innerHTML = `<h4>${obj.title}</h4>`
            card[1].innerHTML = `<img src="${obj.path}" alt="movieImg">`
            onAddMovieBtn()
            updateBtn.classList.add("d-none");
            addMovie.classList.remove("d-none");
            Swal.fire({
                title : `Updated`,
                icon : `Success`
            })
        })
        .catch(err => cl(err))
}


cancel.forEach(ele => {
    ele.addEventListener("click", onAddMovieBtn);
})
addBtn.addEventListener("click", onAddMovieBtn);
formControl.addEventListener("submit", postDataInDB);
updateBtn.addEventListener("click", onUpdateHandler);