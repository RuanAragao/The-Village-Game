//Create the renderer
const app = new PIXI.Application({
    backgroundColor: 0x000000
});
document.body.appendChild(app.view);
app.view.style.display = "block";
app.view.style.margin = "auto";

// ***

const tileSize = 32;
const tileScale = 1;

let player;
let walls = [];
let speed = 4;
let keys = {};

const loaderTextStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: ['#ffffff', '#00ff99'], // gradient
    stroke: '#4a1850',
    strokeThickness: 5,
    dropShadow: true,
    dropShadowColor: '#000000',
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 6,
    dropShadowDistance: 6,
    wordWrap: true,
    wordWrapWidth: 440,
});

const loaderScreenContainer = new PIXI.Container();
const loaderScreenText = new PIXI.Text('0%', loaderTextStyle);
loaderScreenText.x = app.view.width / 2 - loaderScreenText.width / 2;
loaderScreenText.y = app.view.height / 2 - loaderScreenText.height / 2;
loaderScreenContainer.addChild(loaderScreenText);
app.stage.addChild(loaderScreenContainer);

app.loader.baseUrl = "images";
app.loader
    .add("tileset", "PathAndObjects.png")
    .add("json", "map.json");

app.loader.onProgress.add(loaderScreen);
app.loader.onComplete.add(render);
app.loader.onError.add(() => {});


let tileTexturesSet = [];
app.loader.load();


app.ticker.add(gameLoop);




// for (let row in chart) {
//     for (let column in chart) {
//         let tile = chart[row][column];
//         if (tile === "D") {
//             let wall = {
//                 x: tileSize * column,
//                 y: tileSize * row,
//                 width: tileSize,
//                 height: tileSize
//             };
//             walls.push(wall);
//         }
//     }
// }

let tileCollection = [];

function render() {
    const resources = app.loader.resources;
    
    loaderScreenContainer.visible = false;
    
    
    // Tile Textures
    let tileTextures = [];
    for (let i = 0; i < 16 * 16; i++) {
        let x = i % 16;
        let y = Math.floor(i / 16);
        tileTextures[i] = new PIXI.Texture(
            resources.tileset.texture,
            new PIXI.Rectangle(x * tileSize, y * tileSize, tileSize, tileSize)
        );
            
        tileTexturesSet.push(tileTextures[i]);
    }

    // **********
    const jsonMap = app.loader.resources.json.data;

    for (const layer in jsonMap.layers) {
        const layerNow = jsonMap.layers[layer];
        // console.log(layerNow);

        for (let column = 0; column < layerNow.height; column++) {
            for (let row = 0; row < layerNow.width; row++) {
                const tile = layerNow.data[row * layerNow.height + column];
                console.log(tile);
                
                let x = column * tileSize;
                let y = row * tileSize;
                
                const tileRender = new PIXI.Sprite(tileTextures[tile - 1]); // "-1" para compensar exportação do tild que não sei por qual motivo exporta com +1
                tileRender.anchor.set(0);
                tileRender.scale.set(tileScale);
                tileRender.x = x;
                tileRender.y = y;
                app.stage.addChild(tileRender);
            }
        }
    }
    // ****************


    // Bloc carac
    
    const bloc = {
        blank: {
            size: 32,
            texture: tileTextures[143],
            collision: false,
        },
        player: {
            size: 32,
            texture: tileTextures[215],
            collision: true,
        },
        solid: {
            size: 32,
            texture: tileTextures[1],
            collision: true,
        },
        ground: {
            size: 32,
            texture: tileTextures[17],
            collision: false,
        },
        ground2: {
            size: 32,
            collision: false,
            texture: {
                vertical: tileTextures[17],
                horizontal: tileTextures[4],
                curve: tileTextures[5],
            },
        },
        aqua: {
            size: 32,
            texture: tileTextures[3],
            collision: true,
        },
        grass: {
            size: 32,
            texture: tileTextures[4],
            collision: false,
        },
    };

    const A = bloc.blank;   // #ffffff
    const B = bloc.ground;
    const C = bloc.aqua;    // #33a5ff
    const D = bloc.solid;   // #b4b4b4

    const X = bloc.player;  // The player

    // Stages
    const stageChart = [
        [A,C,D,D,D,D,D,B,C,A],
        [A,C,D,B,B,B,D,B,C,A],
        [A,C,D,B,D,D,D,B,C,A],
        [A,C,D,B,B,B,B,B,C,A],
        [A,C,D,D,B,D,D,D,D,D],
        [A,C,C,C,B,C,C,C,C,A],
        [A,C,C,C,B,C,C,C,C,A],
        [A,C,C,C,B,C,C,C,C,A],
        [A,C,C,C,B,C,C,C,C,A],
        [A,C,C,C,B,C,C,C,C,A],
    ];

    // Tile data
    for (let row in stageChart) {
        for (let column in stageChart) {
            let tile = stageChart[row][column];
            // console.log(tile);
            if (tile.collision) {
                let wall = {
                    x: tileSize * column,
                    y: tileSize * row,
                    width: tileSize,
                    height: tileSize
                };
                walls.push(wall);
            }
        }
    }

    // Stage render
    // for (let row in stageChart) {
    //     for (let column in stageChart[row]) {
    //         let tile = stageChart[row][column];

    //         let x = column * tileSize;
    //         let y = row * tileSize;
            
    //         const tileRender = new PIXI.Sprite(tile.texture);
    //         tileRender.anchor.set(0);
    //         tileRender.scale.set(tileScale);
    //         tileRender.x = x;
    //         tileRender.y = y;
    //         app.stage.addChild(tileRender);
    //     }
    // }

    // ---------------------------------------------------------------------------

    // for (let row in map) {
    //     for (let column in map[row]) {
    //         let tile = map[row][column];

    //         let x = column * tileSize;
    //         let y = row * tileSize;
            
    //         const tileRender = new PIXI.Sprite(tileTextures[tile]);
    //         tileRender.anchor.set(0);
    //         tileRender.scale.set(tileScale);
    //         tileRender.x = x;
    //         tileRender.y = y;
    //         app.stage.addChild(tileRender);
    //     }
    // }

    // Player
    player = new PIXI.Sprite.from(X.texture);
    player.anchor.set(0);
    player.scale.set(tileScale);
    player.x = tileSize * 4;
    player.y = tileSize * 6;

    app.stage.addChild(player);

}

/**
 * 
 * @param {Object} a Object A
 * @param {Object} b Object B
 */
function rectsIntersect(a, b) {
    let aBox = a.getBounds();
    let bBox = b.getBounds();

    return  aBox.x + aBox.width > bBox.x &&
            aBox.x < bBox.x + bBox.width &&
            aBox.y + aBox.height > bBox.y &&
            aBox.y < bBox.y + bBox.height;
}

/**
 * Detect objects collision and adjust position
 * @param {Object} objA - player
 * @param {Object} objB - Walls
 */
function blockRectangle(objA, objB) {
    const distX = (objA.x + objA.width/2) - (objB.x + objB.width/2);
    const distY = (objA.y + objA.height/2) - (objB.y + objB.height/2);

    const sumWidth = (objA.width + objB.width) / 2;
    const sumHeight = (objA.height + objB.height) / 2;

    if (Math.abs(distX) < sumWidth && Math.abs(distY) < sumHeight) {
        const overlapX = sumWidth - Math.abs(distX);
        const overlapY = sumHeight - Math.abs(distY);

        if (overlapX > overlapY) {
            objA.y = distY > 0 ? objA.y + overlapY : objA.y - overlapY;
        } else {
            objA.x = distX > 0 ? objA.x + overlapX : objA.x - overlapX;
        }
    }
}

window.addEventListener("keydown", keyDown);
window.addEventListener("keyup", keyUp);

function keyDown(e) {
    // console.log(e.keyCode);
    keys[e.keyCode] = true;
}


function keyUp(e) {
    // console.log(e.keyCode);
    keys[e.keyCode] = false;
}

function gameLoop(delta) {

    // W
    if (keys["87"]) {
        player.y -= speed;
    }
    // A
    if (keys["65"]) {
        player.x -= speed;
    }
    // S
    if (keys["83"]) {
        player.y += speed;
    }
    // D
    if (keys["68"]) {
        player.x += speed;
    }

    for (let i in walls) {
        let wall = walls[i];
        blockRectangle(player, wall);
    }
}

function loaderScreen(e) {
    loaderScreenText.text = `${Math.floor(e.progress)}%`;
    loaderScreenText.x = app.view.width / 2 - loaderScreenText.width / 2;
}