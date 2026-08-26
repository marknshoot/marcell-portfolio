import {
  Bone,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  TextureLoader,
  Uint16BufferAttribute,
  Vector3,
  WebGLRenderer,
} from "three";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 16;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;
const PAGE_COUNT = 8;
const OPEN_ANGLE = Math.PI / 3;
const CLOSED_ANGLE = Math.PI / 2;

const easingFactor = 0.55;
const easingFactorFold = 0.35;
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05;
const turningCurveStrength = 0.09;

const pageGeometry = new BoxGeometry(PAGE_WIDTH, PAGE_HEIGHT, PAGE_DEPTH, PAGE_SEGMENTS, 2);
pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

{
  const position = pageGeometry.attributes.position;
  const vertex = new Vector3();
  const skinIndexes = [];
  const skinWeights = [];
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;
    const skinIndex = Math.max(0, Math.min(PAGE_SEGMENTS - 1, Math.floor(x / SEGMENT_WIDTH)));
    const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }
  pageGeometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
  pageGeometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));
}

const cream = new Color("#f4eee3");
const navy = new Color("#1a2744");

function dampAngle(obj, key, target, lambda, dt) {
  let current = obj[key];
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  obj[key] += delta * (1 - Math.exp(-lambda * dt));
}

function makePageMesh(frontMat, backMat) {
  const bones = [];
  for (let i = 0; i <= PAGE_SEGMENTS; i++) {
    const bone = new Bone();
    bones.push(bone);
    bone.position.x = i === 0 ? 0 : SEGMENT_WIDTH;
    if (i > 0) bones[i - 1].add(bone);
  }
  const skeleton = new Skeleton(bones);
  const edge = new MeshStandardMaterial({ color: cream, roughness: 0.8 });
  const spine = new MeshStandardMaterial({ color: navy, roughness: 0.6 });
  const materials = [edge, spine, edge, edge, frontMat, backMat];
  const mesh = new SkinnedMesh(pageGeometry, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  mesh.add(skeleton.bones[0]);
  mesh.bind(skeleton);
  return mesh;
}

function linedPaper() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 704;
  const g = c.getContext("2d");
  g.fillStyle = "#f7f1e6";
  g.fillRect(0, 0, 512, 704);
  g.strokeStyle = "rgba(26,39,68,0.12)";
  g.lineWidth = 2;
  for (let y = 48; y < 680; y += 28) {
    g.beginPath();
    g.moveTo(28, y);
    g.lineTo(490, y);
    g.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function initBook(canvas) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.shadowMap.enabled = true;

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 40);
  camera.position.set(0, 1.15, 2.85);
  camera.lookAt(0, 0, 0);

  const hemi = new HemisphereLight("#fffaf3", "#8a8070", 1.1);
  scene.add(hemi);
  const dir = new DirectionalLight("#fff6ea", 2.2);
  dir.position.set(2.2, 5, 2.4);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024, 1024);
  scene.add(dir);

  const ground = new Mesh(new PlaneGeometry(20, 20), new ShadowMaterial({ opacity: 0.22 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.15;
  ground.receiveShadow = true;
  scene.add(ground);

  const book = new Group();
  book.rotation.x = -Math.PI / 4;
  book.rotation.y = -Math.PI / 2;
  scene.add(book);

  const paperMap = linedPaper();
  const loader = new TextureLoader();
  const leather = loader.load("assets/book/leather.jpg");
  leather.colorSpace = SRGBColorSpace;

  const coverFront = new MeshStandardMaterial({
    map: leather,
    roughness: 0.55,
    color: navy,
  });
  const coverBack = new MeshStandardMaterial({
    map: leather,
    roughness: 0.55,
    color: navy,
  });
  const paperMat = new MeshStandardMaterial({
    map: paperMap,
    roughness: 0.85,
    color: cream,
  });

  const pages = [];
  for (let i = 0; i < PAGE_COUNT; i++) {
    const front = i === 0 ? coverFront.clone() : paperMat.clone();
    const back = i === PAGE_COUNT - 1 ? coverBack.clone() : paperMat.clone();
    const mesh = makePageMesh(front, back);
    const group = new Group();
    group.add(mesh);
    mesh.position.z = -i * PAGE_DEPTH;
    group.rotation.y = CLOSED_ANGLE;
    book.add(group);
    pages.push({
      group,
      mesh,
      opened: false,
      lastOpened: false,
      turnedAt: 0,
    });
  }

  let delayedPage = 0;
  let targetPage = 0;
  let last = performance.now();

  function stepTowardTarget() {
    if (delayedPage === targetPage) return;
    delayedPage += targetPage > delayedPage ? 1 : -1;
    pages.forEach((p, i) => {
      if (p.opened !== delayedPage > i) {
        p.turnedAt = performance.now();
        p.lastOpened = p.opened;
        p.opened = delayedPage > i;
      }
    });
    if (delayedPage !== targetPage) window.setTimeout(stepTowardTarget, 140);
  }

  function setPage(next) {
    next = Math.max(0, Math.min(PAGE_COUNT, next));
    if (next === targetPage) return;
    targetPage = next;
    stepTowardTarget();
  }

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 640;
    const h = canvas.clientHeight || 420;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const bookClosed = delayedPage === 0 || delayedPage === PAGE_COUNT;

    pages.forEach((p, number) => {
      const mesh = p.mesh;
      let turningTime = Math.min(400, now - p.turnedAt) / 400;
      turningTime = Math.sin(turningTime * Math.PI);

      let targetRotation = p.opened ? -OPEN_ANGLE : OPEN_ANGLE;
      if (bookClosed) targetRotation = p.opened ? -CLOSED_ANGLE : CLOSED_ANGLE;
      else targetRotation += (number * 0.8 * Math.PI) / 180;

      const bones = mesh.skeleton.bones;
      for (let i = 0; i < bones.length; i++) {
        const target = i === 0 ? p.group : bones[i];
        const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
        const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
        const turningIntensity = Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
        let rotationAngle =
          insideCurveStrength * insideCurveIntensity * targetRotation -
          outsideCurveStrength * outsideCurveIntensity * targetRotation +
          turningCurveStrength * turningIntensity * targetRotation;
        let foldRotationAngle = Math.sign(targetRotation) * ((2 * Math.PI) / 180);
        if (bookClosed) {
          if (i === 0) {
            rotationAngle = targetRotation;
            foldRotationAngle = 0;
          } else {
            rotationAngle = 0;
            foldRotationAngle = 0;
          }
        }
        dampAngle(target.rotation, "y", rotationAngle, 14, dt);
        const foldIntensity =
          i > 8 ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime : 0;
        dampAngle(target.rotation, "x", foldRotationAngle * foldIntensity, easingFactorFold * 8, dt);
      }
      mesh.position.z = -number * PAGE_DEPTH + delayedPage * PAGE_DEPTH;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement || canvas);
  resize();
  requestAnimationFrame(tick);

  const STEP_PAGES = [0, 2, 4, 6, 0];

  return {
    setStep(step) {
      setPage(STEP_PAGES[step] ?? 0);
    },
  };
}
