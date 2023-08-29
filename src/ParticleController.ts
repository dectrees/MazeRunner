import { AssetsManager, Nullable, Scene, ParticleSystem, Mesh, SolidParticleSystem, Scalar, Color3, MeshBuilder, Vector3 } from "@babylonjs/core";
import Level from "./Level";

export default class ParticleController {
    scene: Scene;
    //particle system
    ps: Nullable<ParticleSystem>;
    fireReady: boolean = false;

    //explosion
    sps: SolidParticleSystem;
    speed = .5;
    gravity = -0.05;
    boom = false;

    level:Level;


    constructor(scene: Scene, emitter: Mesh,level:Level) {
        this.scene = scene;
        this._loadParticleSystem(this.scene, emitter);
        this.level = level;
        this.scene.onBeforeRenderObservable.add(() => {
            this._updateSPS();
        });
    }

    private _updateSPS() {
        if (this.boom) {
            if (this.sps) {
                this.sps.setParticles();
            }

        }
    }
    

    private buildSPS(sps: SolidParticleSystem, y: number) {

        // recycle particles function
        //sets particles to an intial state
        const recycleParticle = (particle) => {
            particle.position.x = 0;
            particle.position.y = 0;
            particle.position.z = 0;
            particle.rotation.x = Scalar.RandomRange(-Math.PI, Math.PI);
            particle.rotation.y = Scalar.RandomRange(-Math.PI, Math.PI);
            particle.rotation.z = Scalar.RandomRange(-Math.PI, Math.PI);
            particle.color = new Color3(Math.random(), Math.random(), Math.random());
            particle.velocity.x = Scalar.RandomRange(-0.3 * this.speed, 0.3 * this.speed);
            particle.velocity.y = Scalar.RandomRange(0.001 * this.speed, this.speed);
            particle.velocity.z = Scalar.RandomRange(-0.3 * this.speed, 0.3 * this.speed);
        };

        //Initate by recycling through all particles
        sps.initParticles = () => {
            for (let p = 0; p < sps.nbParticles; p++) {
                recycleParticle(sps.particles[p])
            }
        }
        sps.updateParticle = (particle) => {
            if (particle.position.y < -y + .5) {
                // recycleParticle(particle);
                particle.velocity = Vector3.Zero();
                return;
            }
            particle.velocity.y += this.gravity;                  // apply gravity to y
            particle.position.addInPlace(particle.velocity); // update particle new position

            const direction = Math.sign(particle.idx % 2 - 0.5); //rotation direction +/- 1 depends on particle index in particles array           // rotation sign and new value
            particle.rotation.z += 0.01 * direction;
            particle.rotation.x += 0.005 * direction;
            particle.rotation.y += 0.008 * direction;
        }

        sps.initParticles();
        sps.setParticles();
    }

    doExplode(scene: Scene,bandit:Mesh) {
        this.sps = new SolidParticleSystem("SPS", scene);
        const tetra = MeshBuilder.CreatePolyhedron("tetra", { size: 0.2, type: 2 });
        this.sps.addShape(tetra, 10);
        tetra.dispose();

        var s = this.sps.buildMesh();
        s.position = bandit.position;
        this.buildSPS(this.sps, s.position.y);

        this.boom = true;
        bandit.dispose();
        setTimeout(() => {
            this.boom = false;
            this.sps.dispose();
            this.level.banditClone = true;
        }, 5000);
    }

    private _loadParticleSystem(scene: Scene, emitter: Mesh) {
        var myParticleSystem = null;
        const assetsManager = new AssetsManager(scene);
        // const particleTexture = assetsManager.addTextureTask("my particle texture", "https://models.babylonjs.com/Demos/particles/textures/dotParticle.png")
        const particleFile = assetsManager.addTextFileTask("my particle system", "/particleSystem.json");

        // load all tasks
        assetsManager.load();

        // after all tasks done, set up particle system
        assetsManager.onFinish = (tasks) => {
            // console.log("tasks successful", tasks);

            // prepare to parse particle system files
            const particleJSON = JSON.parse(particleFile.text);
            myParticleSystem = ParticleSystem.Parse(particleJSON, scene, "");

            // set particle texture
            // myParticleSystem.particleTexture = particleTexture.texture;

            // set emitter
            // myParticleSystem.emitter = sphere;
            myParticleSystem.emitter = emitter;
            // myParticleSystem.particleEmitterType = new SphereParticleEmitter();
            this.ps = myParticleSystem;
            this.fireReady = true;
        }

    }
}