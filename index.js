"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

/*global THREE, Coordinates, $, document, window, dat*/


var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = false;
var ground = false;

// Créer le premeir tissu avec la taille par défaut
function createFirstMaterial() {
    createMaterial(150);
}

// je suis obligé de refaire une fonction sinon marche pas
// je peux pas mettre directement effectController dans createMAterial sinon le premier se crée pas
function createNewMaterial() {
    // Je dois remove l'ancien objet et le récreer 
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    createMaterial(effectController.size);
}

// fonction pour créer un défaut c'est le seul truc que j'ai trouvé pour faire un défaut
function defaut() {
    var randomValue = Math.random();
    var defaut = 0;

    if (randomValue > 0.99) {
        defaut = 2 * Math.PI / 2;
    } else if (randomValue < 0.001) {
        defaut = -(2 * Math.PI / 2);
    }

    return defaut;
}


function createMaterial(size) {
    var curve, points, geometry, curveObject;

    // Première boulces imbirqués parallèles à l'axe X
    // Nous alternons le sens des courbes pour faire comme du tissu
    var reverse = false;
    for (var j = Math.PI / 2; j < size; j += Math.PI) {
        var arrayPoints = [];



        // Nous créeons un tableau de points de notre courbe
        for (var i = 0; i < size + 2; i++) {
            if (reverse) {
                arrayPoints.push(new THREE.Vector3(i, -0.5 * Math.sin(i), j/*+defaut()*/));
            } else {
                arrayPoints.push(new THREE.Vector3(i, 0.5 * Math.sin(i), j/*+defaut()*/));
            }
        }

        // Création de l'objet courbe
        curve = new THREE.CatmullRomCurve3(arrayPoints);

        // On crée la courbe à partir du points
        // je met 1000 pour la situation ou la taille est grande pour que les courbes soit des courbes pas des segments
        points = curve.getPoints(1000);
        geometry = new THREE.BufferGeometry().setFromPoints(points);

        // Le materiél métallique
        const material = new THREE.LineBasicMaterial({ color: 0x111111 });

        // On crée l'objet 3D de la courbe
        curveObject = new THREE.Line(geometry, material);

        scene.add(curveObject);
        // on reverse pour que la prochaine courbe soit tracé de manière inverse
        reverse = !reverse;
    }

    // Même chose qu'au dessus
    reverse = true;
    for (var j = Math.PI / 2; j < size; j += Math.PI) {
        var arrayPoints = [];

        for (var i = 0; i < size + 2; i++) {
            if (reverse) {
                arrayPoints.push(new THREE.Vector3(j, -0.5 * Math.sin(i), i));
            } else {
                arrayPoints.push(new THREE.Vector3(j, 0.5 * Math.sin(i), i));
            }
        }

        curve = new THREE.CatmullRomCurve3(arrayPoints);

        points = curve.getPoints(50);
        geometry = new THREE.BufferGeometry().setFromPoints(points);

        const material = new THREE.LineBasicMaterial({ color: 0x111111 });

        curveObject = new THREE.Line(geometry, material);

        scene.add(curveObject);
        reverse = !reverse;
    }
}





function init() {
    var canvasWidth = 846;
    var canvasHeight = 494;
    // For grading the window is fixed in size; here's general code:
    var canvasRatio = canvasWidth / canvasHeight;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);

    // CAMERA
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 1000);

    // CONTROLS
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.object.position.set(75, 125, 75);
    cameraControls.target = new THREE.Vector3(75, 0, 75);


    fillScene();
}

function addToDOM() {
    var container = document.getElementById('webGL');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild(renderer.domElement);
}

function fillScene() {
    // SCENE
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 3000, 6000);
    // LIGHTS
    var ambientLight = new THREE.AmbientLight(0x222222);
    var light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light.position.set(200, 400, 500);

    var light2 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    light2.position.set(-400, 200, -300);

    scene.add(ambientLight);
    scene.add(light);
    scene.add(light2);

    if (ground) {
        Coordinates.drawGround({ size: 1000 });
    }
    if (gridX) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01 });
    }
    if (gridY) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: "y" });
    }
    if (gridZ) {
        Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: "z" });
    }
    if (axes) {
        Coordinates.drawAllAxes({ axisLength: 300, axisRadius: 2, axisTess: 50 });
    }

    //
    createFirstMaterial();
}


function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    if (effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes) {
        gridX = effectController.newGridX;
        gridY = effectController.newGridY;
        gridZ = effectController.newGridZ;
        ground = effectController.newGround;
        axes = effectController.newAxes;

        fillScene();
    }
    renderer.render(scene, camera);

    // Virer ca si vous voulez bouger la camera à la souris
    if (!effectController.free) {
        cameraControls.object.position.set(75, effectController.height, 75);
    }

}

function setupGui() {

    effectController = {

        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: axes,
        size: 150,
        change: createNewMaterial,
        height: 125,
        free: false
    };

    var gui = new dat.GUI();
    gui.add(effectController, "newGridX").name("Show XZ grid");
    gui.add(effectController, "newGridY").name("Show YZ grid");
    gui.add(effectController, "newGridZ").name("Show XY grid");
    gui.add(effectController, "newGround").name("Show ground");
    gui.add(effectController, "newAxes").name("Show axes");

    // dimensions du tissu
    gui.add(effectController, "size", 150, 300, 1).name("Size");

    // Bouton pour appliquer les changements
    gui.add(effectController, "change").name("Change");

    // hauteur caméra
    gui.add(effectController, "height", 125, 300).name("Height Camera");

    // Camera libre ou pas
    gui.add(effectController, "free").name("Camera Libre");
}



try {
    init();
    setupGui();
    addToDOM();
    animate();
} catch (e) {
    var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    $('#container').append(errorReport + e);
}