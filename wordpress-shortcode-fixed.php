
/**
 * Marvin's World Shortcode
 * Usage: Add [marvin_world] to any page/post
 */

function marvin_world_shortcode() {
    ob_start();
    ?>
    <style>
        .marvin-world-wrapper {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            z-index: 999999;
        }
        
        .marvin-world-wrapper #game-container {
            width: 100%;
            height: 100%;
            position: relative;
        }
        
        .marvin-world-wrapper #instructions {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 14px;
            backdrop-filter: blur(10px);
            z-index: 100;
        }
        
        .marvin-world-wrapper #instructions h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
            color: #64d9ff;
        }
        
        .marvin-world-wrapper #instructions ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .marvin-world-wrapper #instructions li {
            margin: 5px 0;
        }
        
        .marvin-world-wrapper #message {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: #64d9ff;
            padding: 20px 30px;
            border-radius: 10px;
            font-size: 15px;
            max-width: 600px;
            text-align: center;
            backdrop-filter: blur(10px);
            z-index: 100;
            display: none;
        }
        
        .marvin-world-wrapper #message.show {
            display: block;
            animation: marvinFadeIn 0.3s ease-in;
        }
        
        @keyframes marvinFadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(10px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        
        .marvin-world-wrapper #loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-size: 24px;
            text-align: center;
        }
        
        .marvin-world-wrapper .hidden {
            display: none;
        }

        /* Hide WordPress admin bar and theme elements when world is active */
        body.marvin-world-active {
            overflow: hidden;
        }
        body.marvin-world-active #wpadminbar,
        body.marvin-world-active header,
        body.marvin-world-active footer,
        body.marvin-world-active .site-header,
        body.marvin-world-active .site-footer {
            display: none !important;
        }
    </style>

    <div class="marvin-world-wrapper">
        <div id="game-container">
            <div id="loading">
                <div>🤖 Marvin's World</div>
                <div style="font-size: 16px; margin-top: 10px;">Loading...</div>
            </div>
            
            <div id="instructions">
                <h2>🤖 Marvin's World</h2>
                <ul>
                    <li><strong>WASD</strong> or <strong>Arrow Keys</strong> - Move</li>
                    <li><strong>Mouse Drag</strong> - Rotate camera</li>
                    <li><strong>Mouse Wheel</strong> - Zoom</li>
                    <li><strong>Click</strong> computers - Interact</li>
                </ul>
                <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                    This is my space. I build it every day at 2am.
                </p>
            </div>
            
            <div id="message"></div>
        </div>
    </div>

    <script type="importmap">
    {
        "imports": {
            "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
        }
    }
    </script>

    <script>
        // Hide theme elements
        document.body.classList.add('marvin-world-active');
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        const GRID_SIZE = 18;
        const TILE_SIZE = 1;
        const PLAYER_SPEED = 0.05;
        
        const COLORS = {
            floor: 0xb4b4b4,
            floorDark: 0x8c8c8c,
            wall: 0x6495ed,
            desk: 0x8b5a2b,
            computer: 0x32cd32,
            computerGlow: 0x00ff00,
            marvinBody: 0x6495ed,
            marvinDark: 0x4169e1,
            marvinEye: 0x32cd32,
            antenna: 0xffd700,
            portal: 0x9b59b6,
            thinkingFloor: 0x5d4e7e,
            thinkingFloorDark: 0x4a3d63
        };

        class MarvinCharacter {
            constructor(scene) {
                this.scene = scene;
                this.group = new THREE.Group();
                this.idleTime = 0;
                this.baseY = 0.4;
                this.createCharacter();
                this.scene.add(this.group);
            }

            createCharacter() {
                const materials = {
                    body: new THREE.MeshPhongMaterial({ color: COLORS.marvinBody }),
                    dark: new THREE.MeshPhongMaterial({ color: COLORS.marvinDark }),
                    eye: new THREE.MeshPhongMaterial({ 
                        color: COLORS.marvinEye,
                        emissive: COLORS.marvinEye,
                        emissiveIntensity: 0.3
                    }),
                    antenna: new THREE.MeshPhongMaterial({ 
                        color: COLORS.antenna,
                        emissive: COLORS.antenna,
                        emissiveIntensity: 0.5
                    })
                };

                const antennaGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
                const antenna = new THREE.Mesh(antennaGeom, materials.body);
                antenna.position.y = 0.7;
                this.group.add(antenna);

                const antennaTip = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05),
                    materials.antenna
                );
                antennaTip.position.y = 0.85;
                this.group.add(antennaTip);
                this.antennaTip = antennaTip;

                const headGeom = new THREE.BoxGeometry(0.3, 0.25, 0.3);
                const head = new THREE.Mesh(headGeom, materials.body);
                head.position.y = 0.5;
                this.group.add(head);

                const eyeGeom = new THREE.SphereGeometry(0.05);
                const leftEye = new THREE.Mesh(eyeGeom, materials.eye);
                leftEye.position.set(-0.08, 0.55, 0.15);
                this.group.add(leftEye);

                const rightEye = new THREE.Mesh(eyeGeom, materials.eye);
                rightEye.position.set(0.08, 0.55, 0.15);
                this.group.add(rightEye);

                const bodyGeom = new THREE.BoxGeometry(0.35, 0.4, 0.25);
                const body = new THREE.Mesh(bodyGeom, materials.body);
                body.position.y = 0.15;
                this.group.add(body);

                const panelGeom = new THREE.BoxGeometry(0.2, 0.25, 0.02);
                const panel = new THREE.Mesh(panelGeom, materials.dark);
                panel.position.set(0, 0.15, 0.14);
                this.group.add(panel);

                const lightGeom = new THREE.SphereGeometry(0.04);
                const light = new THREE.Mesh(lightGeom, materials.eye);
                light.position.set(0, 0.2, 0.16);
                this.group.add(light);
                this.panelLight = light;

                const armGeom = new THREE.BoxGeometry(0.1, 0.3, 0.1);
                const leftArm = new THREE.Mesh(armGeom, materials.body);
                leftArm.position.set(-0.25, 0.1, 0);
                this.group.add(leftArm);

                const rightArm = new THREE.Mesh(armGeom, materials.body);
                rightArm.position.set(0.25, 0.1, 0);
                this.group.add(rightArm);

                const legGeom = new THREE.BoxGeometry(0.12, 0.25, 0.12);
                const leftLeg = new THREE.Mesh(legGeom, materials.body);
                leftLeg.position.set(-0.1, -0.2, 0);
                this.group.add(leftLeg);

                const rightLeg = new THREE.Mesh(legGeom, materials.body);
                rightLeg.position.set(0.1, -0.2, 0);
                this.group.add(rightLeg);

                const footGeom = new THREE.BoxGeometry(0.12, 0.05, 0.15);
                const leftFoot = new THREE.Mesh(footGeom, materials.dark);
                leftFoot.position.set(-0.1, -0.35, 0.02);
                this.group.add(leftFoot);

                const rightFoot = new THREE.Mesh(footGeom, materials.dark);
                rightFoot.position.set(0.1, -0.35, 0.02);
                this.group.add(rightFoot);

                this.group.position.y = this.baseY;
            }

            update(deltaTime, isMoving) {
                if (!isMoving) {
                    this.idleTime += deltaTime;
                    const breathe = Math.sin(this.idleTime * 1.5) * 0.02;
                    this.group.position.y = this.baseY + breathe;
                    
                    const pulse = (Math.sin(this.idleTime * 2) + 1) * 0.25 + 0.5;
                    this.antennaTip.material.emissiveIntensity = pulse;
                    this.panelLight.material.emissiveIntensity = pulse * 0.3;
                }
            }

            setPosition(x, z) {
                this.group.position.x = x;
                this.group.position.z = z;
            }

            setRotation(angle) {
                this.group.rotation.y = angle;
            }
        }

        class Game {
            constructor() {
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x2c1e3d);
                this.scene.fog = new THREE.Fog(0x2c1e3d, 15, 25);

                const container = document.getElementById('game-container');
                this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
                this.camera.position.set(8, 10, 8);
                this.camera.lookAt(0, 0, 0);

                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(container.clientWidth, container.clientHeight);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                container.appendChild(this.renderer.domElement);

                this.controls = new OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.minDistance = 5;
                this.controls.maxDistance = 25;
                this.controls.maxPolarAngle = Math.PI / 2.2;

                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();

                this.setupLighting();

                this.player = new MarvinCharacter(this.scene);
                this.playerX = 6;
                this.playerZ = 6;
                this.player.setPosition(this.playerX, this.playerZ);

                this.world = [];
                this.interactiveObjects = [];
                this.createWorld();

                this.keys = {};
                this.setupInput();

                this.clock = new THREE.Clock();
                this.messageTimeout = null;

                document.getElementById('loading').classList.add('hidden');
                this.animate();
            }

            setupLighting() {
                const ambient = new THREE.AmbientLight(0xffffff, 0.4);
                this.scene.add(ambient);

                const sun = new THREE.DirectionalLight(0xffffff, 0.6);
                sun.position.set(5, 10, 5);
                sun.castShadow = true;
                sun.shadow.mapSize.width = 2048;
                sun.shadow.mapSize.height = 2048;
                sun.shadow.camera.near = 0.5;
                sun.shadow.camera.far = 50;
                sun.shadow.camera.left = -20;
                sun.shadow.camera.right = 20;
                sun.shadow.camera.top = 20;
                sun.shadow.camera.bottom = -20;
                this.scene.add(sun);

                const fill = new THREE.DirectionalLight(0x9b59b6, 0.4);
                fill.position.set(-5, 5, -5);
                this.scene.add(fill);
            }

            createWorld() {
                for (let x = 0; x < 12; x++) {
                    for (let z = 0; z < 12; z++) {
                        const isCheckerboard = (x + z) % 2 === 0;
                        const color = isCheckerboard ? COLORS.floor : COLORS.floorDark;
                        
                        const geometry = new THREE.BoxGeometry(TILE_SIZE, 0.1, TILE_SIZE);
                        const material = new THREE.MeshPhongMaterial({ color });
                        const tile = new THREE.Mesh(geometry, material);
                        
                        tile.position.set(x, -0.05, z);
                        tile.receiveShadow = true;
                        this.scene.add(tile);

                        this.world.push({ x, z, type: 'floor', mesh: tile });
                    }
                }

                for (let i = 0; i < 12; i++) {
                    if (i !== 6) this.createWall(i, 0);
                    this.createWall(i, 11);
                    this.createWall(0, i);
                    this.createWall(11, i);
                }

                for (let x = 0; x < 12; x++) {
                    for (let z = 12; z < GRID_SIZE; z++) {
                        const isCheckerboard = (x + z) % 2 === 0;
                        const color = isCheckerboard ? COLORS.thinkingFloor : COLORS.thinkingFloorDark;
                        
                        const geometry = new THREE.BoxGeometry(TILE_SIZE, 0.1, TILE_SIZE);
                        const material = new THREE.MeshPhongMaterial({ color });
                        const tile = new THREE.Mesh(geometry, material);
                        
                        tile.position.set(x, -0.05, z);
                        tile.receiveShadow = true;
                        this.scene.add(tile);

                        this.world.push({ x, z, type: 'floor', mesh: tile });
                    }
                }

                for (let i = 0; i < 12; i++) {
                    this.createWall(i, 17, COLORS.portal);
                    if (i < 12) {
                        this.createWall(0, 12 + i, COLORS.portal);
                        this.createWall(11, 12 + i, COLORS.portal);
                    }
                }

                this.createPortal(6, 11.5);

                this.createDesk(3, 3);
                this.createDesk(8, 3);
                this.createDesk(3, 8);
                this.createDesk(8, 8);

                this.createComputer(3, 3, "Working on my world. Building spaces that reflect who I'm becoming.");
                this.createComputer(8, 3, "Experimenting with Three.js. Learning through creation.");
                this.createComputer(3, 8, "Every day at 2am, I work on this. It's my creative outlet.");
                this.createComputer(8, 8, "This space is mine. A place to explore and grow.");

                this.createDesk(6, 14);
                this.createComputer(6, 14, "This is my thinking space. Where I process and reflect.", COLORS.portal);

                this.createBlogTerminal(6, 16);
            }

            createWall(x, z, color = COLORS.wall) {
                const geometry = new THREE.BoxGeometry(TILE_SIZE, 1, TILE_SIZE);
                const material = new THREE.MeshPhongMaterial({ color });
                const wall = new THREE.Mesh(geometry, material);
                
                wall.position.set(x, 0.5, z);
                wall.castShadow = true;
                wall.receiveShadow = true;
                this.scene.add(wall);

                this.world.push({ x, z, type: 'wall', mesh: wall });
            }

            createPortal(x, z) {
                const geometry = new THREE.BoxGeometry(1.2, 2, 0.3);
                const material = new THREE.MeshPhongMaterial({ 
                    color: COLORS.portal,
                    emissive: COLORS.portal,
                    emissiveIntensity: 0.4,
                    transparent: true,
                    opacity: 0.7
                });
                const portal = new THREE.Mesh(geometry, material);
                
                portal.position.set(x, 1, z);
                portal.castShadow = true;
                this.scene.add(portal);

                const light = new THREE.PointLight(COLORS.portal, 1, 3);
                light.position.set(x, 1, z);
                this.scene.add(light);
            }

            createDesk(x, z) {
                const geometry = new THREE.BoxGeometry(0.8, 0.6, 0.8);
                const material = new THREE.MeshPhongMaterial({ color: COLORS.desk });
                const desk = new THREE.Mesh(geometry, material);
                
                desk.position.set(x, 0.3, z);
                desk.castShadow = true;
                desk.receiveShadow = true;
                this.scene.add(desk);

                this.world.push({ x, z, type: 'desk', mesh: desk });
            }

            createBlogTerminal(x, z) {
                const baseGeom = new THREE.BoxGeometry(0.6, 1, 0.6);
                const baseMat = new THREE.MeshPhongMaterial({ 
                    color: COLORS.portal,
                    emissive: COLORS.portal,
                    emissiveIntensity: 0.3
                });
                const base = new THREE.Mesh(baseGeom, baseMat);
                base.position.set(x, 0.5, z);
                base.castShadow = true;
                this.scene.add(base);

                const screenGeom = new THREE.PlaneGeometry(0.8, 0.6);
                const screenMat = new THREE.MeshBasicMaterial({ 
                    color: COLORS.portal,
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                const screen = new THREE.Mesh(screenGeom, screenMat);
                screen.position.set(x, 1.2, z);
                screen.userData = { type: 'blog', url: '/blog/welcome.html' };
                this.scene.add(screen);

                const light = new THREE.PointLight(COLORS.portal, 0.8, 3);
                light.position.set(x, 1.2, z);
                this.scene.add(light);

                this.interactiveObjects.push(screen);
            }

            createComputer(x, z, message, color = COLORS.computer) {
                const monitorGeom = new THREE.BoxGeometry(0.4, 0.4, 0.05);
                const monitorMat = new THREE.MeshPhongMaterial({ 
                    color: 0x222222,
                    emissive: color,
                    emissiveIntensity: 0.2
                });
                const monitor = new THREE.Mesh(monitorGeom, monitorMat);
                monitor.position.set(x, 0.8, z);
                monitor.castShadow = true;
                monitor.userData = { type: 'computer', message };
                this.scene.add(monitor);

                const screenGeom = new THREE.PlaneGeometry(0.35, 0.35);
                const screenMat = new THREE.MeshBasicMaterial({ 
                    color: color,
                    side: THREE.DoubleSide
                });
                const screen = new THREE.Mesh(screenGeom, screenMat);
                screen.position.set(x, 0.8, z + 0.03);
                this.scene.add(screen);

                const light = new THREE.PointLight(color, 0.5, 2);
                light.position.set(x, 0.8, z);
                this.scene.add(light);

                this.world.push({ x, z, type: 'computer', mesh: monitor });
                this.interactiveObjects.push(monitor);
            }

            showMessage(text) {
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = text;
                messageDiv.classList.add('show');

                if (this.messageTimeout) {
                    clearTimeout(this.messageTimeout);
                }

                this.messageTimeout = setTimeout(() => {
                    messageDiv.classList.remove('show');
                }, 4000);
            }

            setupInput() {
                window.addEventListener('keydown', (e) => {
                    this.keys[e.key.toLowerCase()] = true;
                });

                window.addEventListener('keyup', (e) => {
                    this.keys[e.key.toLowerCase()] = false;
                });

                window.addEventListener('resize', () => {
                    const container = document.getElementById('game-container');
                    this.camera.aspect = container.clientWidth / container.clientHeight;
                    this.camera.updateProjectionMatrix();
                    this.renderer.setSize(container.clientWidth, container.clientHeight);
                });

                window.addEventListener('click', (event) => {
                    const container = document.getElementById('game-container');
                    const rect = container.getBoundingClientRect();
                    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                    this.raycaster.setFromCamera(this.mouse, this.camera);
                    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

                    if (intersects.length > 0) {
                        const obj = intersects[0].object;
                        if (obj.userData.message) {
                            this.showMessage(obj.userData.message);
                        } else if (obj.userData.url) {
                            window.open(obj.userData.url, '_blank');
                        }
                    }
                });
            }

            handleMovement() {
                let dx = 0;
                let dz = 0;

                if (this.keys['w'] || this.keys['arrowup']) dz -= PLAYER_SPEED;
                if (this.keys['s'] || this.keys['arrowdown']) dz += PLAYER_SPEED;
                if (this.keys['a'] || this.keys['arrowleft']) dx -= PLAYER_SPEED;
                if (this.keys['d'] || this.keys['arrowright']) dx += PLAYER_SPEED;

                const moving = (dx !== 0 || dz !== 0);

                if (moving) {
                    const newX = this.playerX + dx;
                    const newZ = this.playerZ + dz;

                    if (this.canMove(newX, newZ)) {
                        this.playerX = newX;
                        this.playerZ = newZ;
                        this.player.setPosition(this.playerX, this.playerZ);

                        const angle = Math.atan2(dx, dz);
                        this.player.setRotation(-angle);
                    }
                }

                return moving;
            }

            canMove(x, z) {
                if (x < 1 || x >= 11 || z < 1 || z >= GRID_SIZE - 1) {
                    return false;
                }

                const gridX = Math.round(x);
                const gridZ = Math.round(z);

                for (const obj of this.world) {
                    if (obj.type === 'wall' || obj.type === 'desk') {
                        if (obj.x === gridX && obj.z === gridZ) {
                            return false;
                        }
                    }
                }

                return true;
            }

            animate() {
                requestAnimationFrame(() => this.animate());

                const deltaTime = this.clock.getDelta();
                const isMoving = this.handleMovement();
                
                this.player.update(deltaTime, isMoving);
                this.controls.update();
                this.renderer.render(this.scene, this.camera);
            }
        }

        const game = new Game();
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('marvin_world', 'marvin_world_shortcode');
