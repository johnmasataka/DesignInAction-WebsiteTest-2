import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
// import { parseTextToParameters } from './text.js';


// 图解数据流关系

// 用户输入 "蓝色再大一点"
// ↓
// 前端将 input 发送到后端 `/update-context`
// ↓
// 后端处理 input，生成 updatedPreferences（解析 + 更新用户偏好）
// ↓
// 后端将 updatedPreferences 返回前端，赋值给 updatedParameters
// ↓
// 前端将 updatedParameters 传递给 generateCubeScene 函数，并作为参数使用（变量名变为 parameters）
// ↓
// generateCubeScene 函数使用 parameters 创建 3D 模型
// ↓
// 用户看到蓝色、尺寸更大的立方体


// 绑定按钮点击事件
document.getElementById('generate').addEventListener('click', async () => {
    const userInput = document.getElementById('prompt').value;

    // 发送用户输入到后端
    const response = await fetch(`${API_BASE_URL}/update-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userInput, userId: 'default' }) // 假设单用户
    });

    // 获取后端返回的参数, updatedParameters 是从后端 fetch 请求的返回结果（即 response.json() 的值）
    const updatedParameters = await response.json();

    //print parameters on the website
    displayParameters(updatedParameters);

    // 使用返回的参数生成 3D 场景, 这个 updatedParameters 被作为参数传递给 generateCubeScene 函数。
    generateCubeScene(updatedParameters);
});

//print parameters on the website
function displayParameters(parameters) {
    const outputElement = document.getElementById('parameters-output');
    outputElement.innerHTML = `
    <pre>${JSON.stringify(parameters, null, 2)}</pre>
`;
}


// 生成 Three.js 场景, 在 generateCubeScene 函数中，parameters 变量实际上就是 updatedParameters 的引用。
function generateCubeScene(parameters) {
    // 显示参数的函数
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.innerHTML = ''; // 清空旧的场景

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    canvasContainer.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Person
    const person = createPerson(1.8);
    person.position.set(0, 0, 7.5);
    scene.add(person);

    // 创建几何体
    const shape = createShape(parameters);
    shape.position.set(0, parameters.height / 2 || 5, 0); // 根据高度调整位置
    scene.add(shape);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.update();

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function createPerson(height) {
    const bodyHeight = height * 0.83;
    const headHeight = height * 0.17;

    // body
    const bodyGeometry = new THREE.CylinderGeometry(0.55, 0.15, bodyHeight, 32);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xA8A8A8 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = bodyHeight / 6; // Elevate to the ground.

    // head
    const headGeometry = new THREE.SphereGeometry(headHeight / 1, 32, 32);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xA8A8A8 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = bodyHeight; // Put it on top of the body.

    // Combine body and head into a group
    const person = new THREE.Group();
    person.add(body);
    person.add(head);

    return person;
}

// 根据参数创建几何体
function createShape(params) {
    const { shape = 'cube', width = 10, height = 10, depth = 10, color = 0xA8A8A8 } = params;

    let geometry;
    switch (shape.toLowerCase()) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(width / 2, 32, 32);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(width / 2, width / 2, height, 32);
            break;
        default:
            geometry = new THREE.BoxGeometry(width, height, depth);
    }

    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.75,
    });

    return new THREE.Mesh(geometry, material);
}




// document.getElementById('generate').addEventListener('click', async () => {

//     const userInput = document.getElementById('prompt').value;

//     // 发送用户输入到后端
//     const response = await fetch(`${API_BASE_URL}/update-context`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ input: userInput, userId: 'default' }) // 假设单用户
//     });

//     const parameters = parseTextToParameters(userInput);    // text.js > JSON

//     generateCubeScene(parameters);    // Call function to generate a cube scene

// });

// // 3D
// function generateCubeScene(parameters) {
//     const canvasContainer = document.getElementById('canvas-container');
//     canvasContainer.innerHTML = '';
//     // Three.js scene
//     const scene = new THREE.Scene();
//     scene.background = new THREE.Color(0xeeeeee);

//     const camera = new THREE.PerspectiveCamera(75, canvasContainer.clientWidth / canvasContainer.clientHeight, 0.1, 1000); //(75, canvasContainer.clientWidth / 500, 0.1, 1000);
//     camera.position.set(15, 15, 15);
//     camera.lookAt(0, 0, 0);

//     const renderer = new THREE.WebGLRenderer();
//     renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
//     canvasContainer.appendChild(renderer.domElement);

//     const light = new THREE.PointLight(0xffffff, 1);
//     light.position.set(10, 20, 10);
//     scene.add(light);
//     const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
//     scene.add(ambientLight);

//     // Person
//     const person = createPerson(1.8);
//     person.position.set(0, 0, 7.5);
//     scene.add(person);

//     const cube = createCube(parameters);
//     cube.position.set(0, 5, 0);
//     scene.add(cube);

//     // OrbitControls
//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;
//     controls.dampingFactor = 0.05;
//     controls.update();

//     function animate() {
//         requestAnimationFrame(animate);
//         controls.update();
//         renderer.render(scene, camera);
//     }
//     animate();
// }

// function createPerson(height) {
//     const bodyHeight = height * 0.83;
//     const headHeight = height * 0.17;

//     // body
//     const bodyGeometry = new THREE.CylinderGeometry(0.55, 0.15, bodyHeight, 32);
//     const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xA8A8A8 });
//     const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
//     body.position.y = bodyHeight / 6; // Elevate to the ground.

//     // head
//     const headGeometry = new THREE.SphereGeometry(headHeight / 1, 32, 32);
//     const headMaterial = new THREE.MeshStandardMaterial({ color: 0xA8A8A8 });
//     const head = new THREE.Mesh(headGeometry, headMaterial);
//     head.position.y = bodyHeight; // Put it on top of the body.

//     // Combine body and head into a group
//     const person = new THREE.Group();
//     person.add(body);
//     person.add(head);

//     return person;
// }

// // cube
// function createCube(params) {
//     // Extract parameters: length, width, height, and color
//     const width = params.width || 10; // Default values
//     const height = params.height || 10;
//     const depth = params.depth || 10;
//     const color = params.color || 0xA8A8A8;

//     // Create Cube Geometry and Materials
//     const geometry = new THREE.BoxGeometry(width, height, depth);
//     const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), transparent: true, opacity: 0.75 });
//     return new THREE.Mesh(geometry, material);
// } 