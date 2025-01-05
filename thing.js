import * as THREE from 'three';

import TWEEN from 'three/addons/libs/tween.module.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

let camera, scene, renderer;
let controls;

const objects = [];
const targets = { table: [], sphere: [], helix: [], grid: [] };

await init();
animate();

function parse_csv_line(line) {
    let values = [];

    let start = 0;
    let end = 0;
    let in_string = false;
    for (let i = 0; i < line.length; i++) {
        switch (line[i]) {
            case '"':
                if (!in_string) {
                    start = i + 1
                } else {
                    end = i
                }
                in_string = !in_string;
                break;
            case ",":
                if (!in_string) {
                    values.push(line.substring(start, end));
                }
                break;
        }
    }

    values.push(line.substring(start, end));

    return values;
}

async function init() {
    const id = "1137tb280bZtOnqki3TssErXsvlkCDTJ2";
    const sheet_name = "Data Template.csv";
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;

    console.log(url);


    const csvText = await (await fetch(url)).text();

    const rows = csvText.split("\n");
    const headers = rows.shift().split(",");

    for (let i = 0; i < headers.length; i++) {
        headers[i] = headers[i].replaceAll('"', '');
    }

    console.log(parse_csv_line(rows[1]));


    const data = rows.map(row => {
        const values = parse_csv_line(row);

        let object = {};
        for (let i = 0; i < headers.length; i++) {
            object[headers[i]] = values[i];
        }

        return object;
    });

    // const data = rows.map(row => {
    //     const values = row.split(",");
    // })


    
    // const rows = csvText.split("\n").map(row => row.split(","));
    console.log(data);


    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table

    for (let i = 0; i < data.length; i++) {
        
        const element = document.createElement('div');
        element.className = 'element';
        element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

        const container = document.createElement("div");
        container.className = "container";
        element.appendChild(container)
        
        const row = document.createElement('div');
        row.className = "row"
        container.appendChild(row);

        const country = document.createElement('div');
        country.className = 'number';
        country.textContent = data[i].Country;
        row.appendChild(country);

        const number = document.createElement('div');
        number.className = 'number';
        number.textContent = i;
        row.appendChild(number);

        const symbol = document.createElement('img');
        symbol.src = data[i].Photo;
        symbol.className = 'picture';
        symbol.setAttribute("draggable", false);
        // symbol.textContent = data[i].Name;
        container.appendChild(symbol);

        const details = document.createElement('div');
        details.className = 'details';
        details.innerHTML = "<strong>" + data[i].Name + "</strong>" + '<br>' + data[i].Interest;
        container.appendChild(details);

        const objectCSS = new CSS3DObject(element);
        objectCSS.position.x = Math.random() * 4000 - 2000;
        objectCSS.position.y = Math.random() * 4000 - 2000;
        objectCSS.position.z = Math.random() * 4000 - 2000;
        scene.add(objectCSS);

        objects.push(objectCSS);

        //

        const gap = 20;
        const width = 150;
        const height = 200;
        const object = new THREE.Object3D();
        object.position.x = ((i % 20) * (gap + width)) - (20 * width + 19 * gap) / 2;
        object.position.y = - (Math.floor(i / 20) * (gap + height)) + (10 * height + 9 * gap) / 2;
        // console.log(i%20, object.position.x, object.position.y);

        targets.table.push(object);

    }

    // sphere

    const vector = new THREE.Vector3();

    for (let i = 0, l = objects.length; i < l; i++) {

        const phi = Math.acos(- 1 + (2 * i) / l);
        const theta = Math.sqrt(l * Math.PI) * phi;

        const object = new THREE.Object3D();

        object.position.setFromSphericalCoords(800, phi, theta);

        vector.copy(object.position).multiplyScalar(2);

        object.lookAt(vector);

        targets.sphere.push(object);

    }

    // helix

    for (let i = 0; i < objects.length / 2; i++) {

        const theta = i * 0.175 + Math.PI;
        const y = - (i * 32) + 1600;

        const object = new THREE.Object3D();

        object.position.setFromCylindricalCoords(900, theta, y);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);
    }

    for (let i = 0; i < objects.length / 2; i++) {

        const theta = i * 0.175 + 2 * Math.PI;
        const y = - (i * 32) + 1600;

        const object = new THREE.Object3D();

        object.position.setFromCylindricalCoords(900, theta, y);

        vector.x = object.position.x * 2;
        vector.y = object.position.y;
        vector.z = object.position.z * 2;

        object.lookAt(vector);

        targets.helix.push(object);
    }

    // grid

    let x = 0;
    for (let i = 0; i < objects.length; i++) {

        const object = new THREE.Object3D();
        if (i==198 || i==183) {
            x++;
        }

        object.position.x = ((i % 5) * 400) - 800;
        object.position.y = (- (Math.floor(i / 5) % 4) * 400) + 800;
        object.position.z = (Math.floor(i / 20)) * 500 - 4500;

        targets.grid.push(object);

    }

    console.log(objects.length);

    //

    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    //

    controls = new TrackballControls(camera, renderer.domElement);
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    const buttonTable = document.getElementById('table');
    buttonTable.addEventListener('click', function () {

        transform(targets.table, 2000);

    });

    const buttonSphere = document.getElementById('sphere');
    buttonSphere.addEventListener('click', function () {

        transform(targets.sphere, 2000);

    });

    const buttonHelix = document.getElementById('helix');
    buttonHelix.addEventListener('click', function () {

        transform(targets.helix, 2000);

    });

    const buttonGrid = document.getElementById('grid');
    buttonGrid.addEventListener('click', function () {

        transform(targets.grid, 2000);

    });

    transform(targets.table, 2000);

    //

    window.addEventListener('resize', onWindowResize);

}

function transform(targets, duration) {

    TWEEN.removeAll();

    for (let i = 0; i < objects.length; i++) {

        const object = objects[i];
        const target = targets[i];

        new TWEEN.Tween(object.position)
            .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.rotation)
            .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    }

    new TWEEN.Tween(this)
        .to({}, duration * 2)
        .onUpdate(render)
        .start();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    controls.update();

}

function render() {

    renderer.render(scene, camera);

}
