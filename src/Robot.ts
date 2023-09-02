import { Color3, Mesh, MeshBuilder, Nullable, PointerEventTypes, RecastJSPlugin, Scalar, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import Recast from "recast-detour";
import Level from "./Level";
import Hero from "./Hero";

export default class Robot {
    scene: Scene;
    level: Level;
    player: Mesh;
    //AI
    navigationPlugin?: RecastJSPlugin;
    agents;
    robots;
    agentIndex;
    alien:Mesh;
    alienNav: Mesh;
    alienIndex;
    staticMesh;
    currentMesh?: Mesh;
    navKeyDown = false;
    navmeshParameters = {
        cs: 2,
        ch: 1,
        walkableSlopeAngle: 90,
        walkableHeight: 1.0,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12.,
        maxSimplificationError: 1.3,
        minRegionArea: 20,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
    };
    DebugMesh = false;
    flyHeight = 3.0;
    restDistance = 0.1;
    onMission = false;
    crowd;
    crowdAlien;
    agentParams = {
        radius: 0.1,
        height: 0.2,
        maxAcceleration: 4.0,
        maxSpeed: 5.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0
    };

    startingPoint: Vector3;
    pathLine;
    constructor(scene: Scene, level: Level, player: Hero) {
        this.scene = scene;
        this.level = level;

        this.player = player.mesh;
        this.staticMesh = level.staticMesh;
        this._loadRecast().then(() => {
            this._initCrowd(this.scene);
            this.initAlien(scene);
            this.level.navReady = true;
        }
        );
    }

    private async _loadRecast() {
        const recast = await Recast.bind(window)();
        this.navigationPlugin = new RecastJSPlugin(recast);

    }

    private buildRobot(scene: Scene): Nullable<Mesh> {
        var width = 0.50;
        var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);

        var head = MeshBuilder.CreateSphere("head", { diameter: 0.3 }, scene);
        head.position.y = 0.4;
        var arm = MeshBuilder.CreateCylinder("arm", { height: 1, diameter: 0.1, tessellation: 6, subdivisions: 1 }, scene);
        arm.position.y = 0.15;
        arm.rotation.z = Math.PI / 2;

        var pilot = Mesh.MergeMeshes([agentCube, head, arm], true);
        return pilot;
    }

    private buildAlien(scene:Scene) {
        const toMergeArray = [];
        const sphere1 = MeshBuilder.CreateSphere("sphere1", { segments: 12, diameter: 2 }, scene);
        sphere1.scaling = new Vector3(1, .75, 1);;
        // toMergeArray.push(sphere1);

        for (let alpha = 0; alpha < Math.PI * 2; alpha += Math.PI / 10) {
            const sphere0 = MeshBuilder.CreateSphere("sphere0", { segments: 8, diameter: 0.5 }, scene);
            
            sphere0.position.z = Math.cos(alpha) * 1.25;
            sphere0.position.x = Math.sin(alpha) * 1.25;
            toMergeArray.push(sphere0);
        }

        var merged = Mesh.MergeMeshes(toMergeArray, true);

        var alienMat = new StandardMaterial("alientMat", scene);
        alienMat.diffuseColor = new Color3(.8, .2, .2);
        sphere1.material = alienMat;

        var emissiveMat = new StandardMaterial("glow",scene);
        emissiveMat.emissiveColor = Color3.Teal();
        
        
        if(merged) 
        {
            merged.material = emissiveMat;
            // merged.isVisible = false;
            this.level.applyVarGL(merged);
            merged.parent = sphere1;
        }
        return sphere1;
    }

    getStartPoint(v: Vector3) {
        var origin = new Vector3(0, 0, 0);
        if (this.navigationPlugin) {
            // console.log("trying find startPoint");

            var sp = this.navigationPlugin.getRandomPointAround(v, 10);

            for (let i = 0; i < 5; i++) {
                if (JSON.stringify(sp) != JSON.stringify(origin)) break;
                console.log("orgin,try again");
                v.x = Scalar.RandomRange(-20, 20);
                v.z = Scalar.RandomRange(-20, 20);
                sp = this.navigationPlugin.getRandomPointAround(v, 10);
            }
            return sp;
        }
        return origin;
    }

    getRandomStartPoint() {
        var origin = new Vector3(0, 0, 0);
        var v = Vector3.Zero();
        v.y = 1;
        v.x = Scalar.RandomRange(-this.level.size/2,this.level.size/2);
        v.z = Scalar.RandomRange(-this.level.size/2,this.level.size/2);
        if (this.navigationPlugin) {
            // console.log("trying find startPoint");

            var sp = this.navigationPlugin.getRandomPointAround(v, 10);

            for (let i = 0; i < 5; i++) {
                if (JSON.stringify(sp) != JSON.stringify(origin)) break;
                console.log("orgin,try again");
                v.x = Scalar.RandomRange(-20, 20);
                v.z = Scalar.RandomRange(-20, 20);
                sp = this.navigationPlugin.getRandomPointAround(v, 10);
            }
            return sp;
        }
        return origin;
    }

    getNextRandomPointAround(v: Vector3) {
        var origin = new Vector3(0, 0, 0);
        if (this.navigationPlugin) {
            // console.log("trying find startPoint");

            var sp = this.navigationPlugin.getRandomPointAround(v, 10);

            for (let i = 0; i < 5; i++) {
                if (JSON.stringify(sp) != JSON.stringify(origin)) break;
                console.log("orgin,next alien move");
                v.x += Scalar.RandomRange(-50, 50);
                v.z += Scalar.RandomRange(-50, 50);
                sp = this.navigationPlugin.getRandomPointAround(v, 10);
            }
            return sp;
        }
        return origin;
    }



    initAlien(scene: Scene) {
        if (this.navigationPlugin) {
            this.crowdAlien = this.navigationPlugin.createCrowd(10, 0.1, scene);
            this.alienNav = MeshBuilder.CreateBox("alienNav", { size: 0.5, height: 0.5 }, scene);
            //set alien parent here
            this.alien = this.buildAlien(scene);
            this.alien.position.y = 5;
            this.alien.parent = this.alienNav;
            this.alienNav.isVisible = false;

            this.alien.animations.push(this.level.ani.Rotate);
            if(this.level.ani) scene.beginAnimation(this.alien, 0, 4 * this.level.ani.frameRate, true);
            // if(this.level.ani) scene.beginDirectAnimation(this.alien, [this.level.ani.Rotate,this.level.ani.Slide],0, 4 * this.level.ani.frameRate, true);
            this.level.shadowGenerator.getShadowMap()?.renderList?.push(this.alien);
            //transfrom alien to the start point
            var randomPos = this.getStartPoint(new Vector3(0, 1, 0));
            // var randomPos = this.getRandomStartPoint();
            this.alienNav.position = randomPos;
            console.log("Alien SP:", randomPos);
            var transform = new TransformNode("alien");
            this.alienIndex = this.crowdAlien.addAgent(randomPos, this.agentParams, transform);

            var nextMove = this.getNextRandomPointAround(this.alienNav.position);
            this.crowdAlien.agentGoto(this.alienIndex, this.navigationPlugin?.getClosestPoint(nextMove));

            setInterval(() => {

                nextMove = this.getNextRandomPointAround(this.alienNav.position);
                // console.log("move alien next:",nextMove);
                this.crowdAlien.agentGoto(this.alienIndex, this.navigationPlugin?.getClosestPoint(nextMove));
            }, 10000);
        }

    }

    private _initCrowd(scene: Scene) {
        // console.log("start initCrowd");
        if (this.staticMesh && this.navigationPlugin) {
            // console.log("start initCrowd");
            this.navigationPlugin.createNavMesh([this.staticMesh], this.navmeshParameters);
            if (this.DebugMesh) {
                var navmeshdebug = this.navigationPlugin.createDebugNavMesh(scene);
                navmeshdebug.position = new Vector3(0, 0.01, 0);

                var matdebug = new StandardMaterial('matdebug', scene);
                matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
                matdebug.alpha = 0.2;
                navmeshdebug.material = matdebug;
            }

            this.crowd = this.navigationPlugin.createCrowd(10, 0.1, scene);

            this.agents = [];
            this.robots = [];
            for (let i = 0; i < 1; i++) {
                var width = 0.50;
                var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
                var robot = this.buildRobot(scene);

                var targetCube = MeshBuilder.CreateBox("cube", { size: 0.2, height: 0.2 }, scene);
                var matAgent = new StandardMaterial('mat2', scene);
                var variation = Math.random();
                matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
                agentCube.material = matAgent;
                if (robot) {
                    robot.position.y = 1;
                    robot.parent = agentCube;
                    agentCube.isVisible = false;
                    targetCube.isVisible = false;
                    robot.material = matAgent;
                    this.level.shadowGenerator.getShadowMap()?.renderList?.push(robot);
                }
                // var randomPos = this.navigationPlugin.getRandomPointAround(new Vector3(0, 0.1, 0), 1);
                var randomPos = this.getStartPoint(new Vector3(0, 1, 0));
                console.log("Agent SP:", randomPos);
                var transform = new TransformNode("agent");
                //agentCube.parent = transform;
                var agentIndex = this.crowd.addAgent(randomPos, this.agentParams, transform);
                this.agentIndex = agentIndex;
                this.agents.push({ idx: agentIndex, trf: transform, mesh: agentCube, target: targetCube });
                this.robots.push(robot);
            }



            setInterval(() => {
                if (this.navigationPlugin && this.player) {
                    // console.log("reset distance:",this.restDistance);
                    var agents = this.crowd.getAgents();
                    // console.log("agents length:",agents.length);
                    if (!this.onMission) {
                        var i;
                        for (i = 0; i < agents.length; i++) {
                            this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(this.player.position));
                        }
                    }
                    else if (this.restDistance < 0.5) {
                        var i;
                        for (i = 0; i < agents.length; i++) {
                            this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(this.player.position));
                        }
                        this.onMission = false;
                    }
                }
            }, 3000);


            var getGroundPosition = function () {
                var pickinfo = scene.pick(scene.pointerX, scene.pointerY);
                if (pickinfo.hit) {
                    return pickinfo.pickedPoint;
                }

                return null;
            }

            var pointerDown = (mesh) => {
                if (this.level.navKeyDown) {
                    this.currentMesh = mesh;
                    this.startingPoint = getGroundPosition();
                    if (this.startingPoint) { // we need to disconnect camera from canvas
                        if (this.navigationPlugin) {
                            var agents = this.crowd.getAgents();
                            var i;
                            for (i = 0; i < agents.length; i++) {
                                var randomPos = this.navigationPlugin.getRandomPointAround(this.startingPoint, 1.0);
                                this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(this.startingPoint));
                            }
                            this.onMission = true;
                            var pathPoints = this.navigationPlugin.computePath(this.crowd.getAgentPosition(agents[0]), this.navigationPlugin.getClosestPoint(this.startingPoint));
                            this.pathLine = MeshBuilder.CreateDashedLines("ribbon", { points: pathPoints, updatable: true, instance: this.pathLine }, scene);
                        }
                    }
                }
            }

            scene.onPointerObservable.add((pointerInfo) => {
                switch (pointerInfo.type) {
                    case PointerEventTypes.POINTERDOWN:
                        if (pointerInfo.pickInfo && pointerInfo.pickInfo.hit) {
                            pointerDown(pointerInfo.pickInfo.pickedMesh)
                        }
                        break;
                }
            });

            scene.onBeforeRenderObservable.add(() => {
                var agentCount = this.agents.length;
                for (let i = 0; i < agentCount; i++) {
                    var ag = this.agents[i];
                    ag.mesh.position = this.crowd.getAgentPosition(ag.idx);
                    if (this.startingPoint) {
                        let restDistanceV = this.startingPoint.subtract(ag.mesh.position);
                        this.restDistance = restDistanceV.length();
                    }
                    let vel = this.crowd.getAgentVelocity(ag.idx);
                    this.crowd.getAgentNextTargetPathToRef(ag.idx, ag.target.position);
                    if (vel.length() > 0.2) {
                        vel.normalize();
                        var desiredRotation = Math.atan2(vel.x, vel.z);
                        ag.mesh.rotation.y = ag.mesh.rotation.y + (desiredRotation - ag.mesh.rotation.y) * 0.05;
                    }
                }
                this.alienNav.position = this.crowdAlien.getAgentPosition(this.alienIndex);
            });

        }
    }
}