const jobs = [
    {title:"Frontend Developer"},
    {title:"Backend Developer"},
    {title:"Graphic Designer"}
];

function loadJobs(){
    const list = document.getElementById("jobList");
    if(!list) return;

    jobs.forEach(job=>{
        list.innerHTML += `
        <div class="card">
            <h3>${job.title}</h3>
            <button>Apply</button>
        </div>`;
    });
}

window.onload = loadJobs;
