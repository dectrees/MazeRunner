import { Color3, Mesh, MeshBuilder, Nullable, PointerEventTypes, RecastJSPlugin, Scene, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import Recast from "recast-detour";
import Level from "./Level";
import Hero from "./Hero";

export default class Robot {
    scene:Scene;
    level:Level;
    player:Mesh;
    //AI
    navigationPlugin?: RecastJSPlugin;
    agents;
    staticMesh;
    currentMesh?: Mesh;
    navKeyDown = false;
    navmeshParameters = {
        cs: 1,
        ch: 1,
        walkableSlopeAngle: 90,
        walkableHeight: 1.0,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12.,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
    };
    DebugMesh = true;
    flyHeight = 3.0;
    restDistance = 0.1;
    onMission = false;
    crowd;
    agentParams = {
        radius: 0.1,
        height: 0.2,
        maxAcceleration: 4.0,
        maxSpeed: 2.0,
        collisionQueryRange: 0.5,
        pathOptimizationRange: 0.0,
        separationWeight: 1.0
    };

    startingPoint:Vector3;
    pathLine;
    constructor(scene:Scene,level:Level,player:Hero) {
        this.scene = scene;
        this.level = level;

        this.player = player.mesh;
        this.staticMesh = level.staticMesh;
        this._loadRecast().then(() => {
            this._initCrowd(this.scene);
            this.level.navReady = true;
        }
        );
    }

    private async _loadRecast() {
        const recast = await Recast.bind(window)();
        this.navigationPlugin = new RecastJSPlugin(recast);
        
    }

    private buildRobot(scene:Scene): Nullable<Mesh>
    {
        var width = 0.50;
        var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
        var head = MeshBuilder.CreateSphere("head", { diameter: 0.3 }, scene);
        head.position.y = 0.4;
        var arm = MeshBuilder.CreateCylinder("arm", { height: 1, diameter: 0.1, tessellation: 6, subdivisions: 1 }, scene);
        arm.position.y = 0.15;
        arm.rotation.z = Math.PI/2;

        var pilot = Mesh.MergeMeshes([agentCube, head, arm], true);
        return pilot;
    }

    getStartPoint(v:Vector3)
    {
        if(this.navigationPlugin)
        {
            // console.log("trying find startPoint");
            return this.navigationPlugin.getRandomPointAround(v, 10)
        }
        return null;
    }

    private _initCrowd(scene: Scene) {
        // console.log("start initCrowd");
        if (this.staticMesh && this.navigationPlugin) {
            // console.log("start initCrowd");
            this.navigationPlugin.createNavMesh([this.staticMesh], this.navmeshParameters);
            if(this.DebugMesh)
            {
                var navmeshdebug = this.navigationPlugin.createDebugNavMesh(scene);
                navmeshdebug.position = new Vector3(0, 0.01, 0);
    
                var matdebug = new StandardMaterial('matdebug', scene);
                matdebug.diffuseColor = new Color3(0.1, 0.2, 1);
                matdebug.alpha = 0.2;
                navmeshdebug.material = matdebug;
            }

            this.crowd = this.navigationPlugin.createCrowd(10, 0.1, scene);

            this.agents = [];
            for (let i = 0; i < 1; i++) {
                var width = 0.50;
                var agentCube = MeshBuilder.CreateBox("cube", { size: width, height: width }, scene);
                var robot = this.buildRobot(scene);

                var targetCube = MeshBuilder.CreateBox("cube", { size: 0.2, height: 0.2 }, scene);
                var matAgent = new StandardMaterial('mat2', scene);
                var variation = Math.random();
                matAgent.diffuseColor = new Color3(0.4 + variation * 0.6, 0.3, 1.0 - variation * 0.3);
                agentCube.material = matAgent;
                if(robot)
                {
                    robot.position.y = 1;
                    robot.parent = agentCube;
                    agentCube.isVisible = false;
                    targetCube.isVisible = true;
                    robot.material = matAgent;
                    this.level.shadowGenerator.getShadowMap()?.renderList?.push(robot);
                }
                var randomPos = this.navigationPlugin.getRandomPointAround(new Vector3(0, 0.1, 0), 1);
                var transform = new TransformNode("agent");
                //agentCube.parent = transform;
                var agentIndex = this.crowd.addAgent(randomPos, this.agentParams, transform);
                this.agents.push({ idx: agentIndex, trf: transform, mesh: agentCube, target: targetCube });
            }

            // setInterval(()=>{
            //     if (this.navigationPlugin &&this.player) {
            //         // console.log("reset distance:",this.restDistance);
            //         var agents = this.crowd.getAgents();
            //         if(!this.onMission)
            //         { 
            //             var i;
            //             for (i = 0; i < agents.length; i++) {
            //                 this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(this.player.position));
            //             }
            //         }
            //         else if(this.restDistance < 0.5)
            //         {
            //             var i;
            //             for (i = 0; i < agents.length; i++) {
            //                 this.crowd.agentGoto(agents[i], this.navigationPlugin.getClosestPoint(this.player.position));
            //             }
            //             this.onMission = false;
            //         }
            //     }
            // },3000);

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
                    if(this.startingPoint)
                    {
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
            });

        }
    }
}