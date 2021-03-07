"use strict"; // good practice - see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

/*global THREE, Coordinates, $, document, window, dat*/


var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = false;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = false;




function createCloth() {
    var curve, points, geometry, curveObject;

    // POUR AUGMENTER LA TAILLE DU TISSU, CHANGER LE 30 DANS TOUTES LES BOUCLES
    var reverse = false;
    for (var j = Math.PI/2; j < 30; j+=2*Math.PI/2) {
        var arrayPoints = [];

        for (var i = 0; i < 32; i++) {
            if (reverse) {
                arrayPoints.push(new THREE.Vector3(i, -0.5*Math.sin(i), j));
            } else {
                arrayPoints.push(new THREE.Vector3(i, 0.5*Math.sin(i), j));
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

    reverse = true;
    for (var j = Math.PI/2; j < 30; j+=2*Math.PI/2) {
        var arrayPoints = [];

        for (var i = 0; i < 32; i++) {
            if (reverse) {
                arrayPoints.push(new THREE.Vector3(j, -0.5*Math.sin(i), i));
            } else {
                arrayPoints.push(new THREE.Vector3(j, 0.5*Math.sin(i), i));
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
    cameraControls.object.position.set(15, 50, 15);
    cameraControls.target = new THREE.Vector3(15, 0, 15);




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
    createCloth();
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
}

function setupGui() {

    effectController = {

        newGridX: gridX,
        newGridY: gridY,
        newGridZ: gridZ,
        newGround: ground,
        newAxes: axes
    };

    var gui = new dat.GUI();
    gui.add(effectController, "newGridX").name("Show XZ grid");
    gui.add(effectController, "newGridY").name("Show YZ grid");
    gui.add(effectController, "newGridZ").name("Show XY grid");
    gui.add(effectController, "newGround").name("Show ground");
    gui.add(effectController, "newAxes").name("Show axes");
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