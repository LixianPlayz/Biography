const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let leaves = [];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function addLeaf() {
    leaves.push({
        x: -20,
        y: random(0, canvas.height * 0.7),
        size: random(5, 15),
        speed: random(0.5, 1.5),
        color: ['#a0522d','#556b2f','#6b8e23'][Math.floor(random(0,3))]
    });
}

function updateLeaves() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // Draw simple pixelated forest background
    ctx.fillStyle = '#2e4d3c';
    ctx.fillRect(0, canvas.height*0.6, canvas.width, canvas.height*0.4);

    for(let i = leaves.length-1; i >= 0; i--) {
        let leaf = leaves[i];
        ctx.fillStyle = leaf.color;
        ctx.fillRect(leaf.x, leaf.y, leaf.size, leaf.size);
        leaf.x += leaf.speed;
        if(leaf.x > canvas.width) leaves.splice(i, 1);
    }
}

function loop() {
    updateLeaves();
    requestAnimationFrame(loop);
}

loop();

// Spawn 1-2 leaves every 5 seconds
setInterval(()=>{
    const count = Math.floor(random(1,3));
    for(let i=0;i<count;i++) addLeaf();
},5000);

window.addEventListener('resize', ()=>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
