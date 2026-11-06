import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// One procedural scene. Animation is driven exclusively by the application's shared ticker.
export function initScene({canvas,reduced=false}={}) {
  if(reduced || !canvas)return null;
  let renderer;
  try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'})}catch{return null}
  const mobile=matchMedia('(max-width: 767px)').matches;
  const lite=mobile||(navigator.hardwareConcurrency||8)<=4||renderer.capabilities.maxTextures<8||renderer.capabilities.maxVertexTextures===0;
  renderer.setPixelRatio(lite?1:Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
  renderer.setClearColor(0x050b14,0);
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x050b14,.031);
  const camera=new THREE.PerspectiveCamera(37,innerWidth/innerHeight,.1,100);
  const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);
  const environmentTarget=pmrem.fromScene(environment,.04);scene.environment=environmentTarget.texture;
  environment.dispose();pmrem.dispose();
  const warm=new THREE.PointLight(0xe8d3a0,65,35,2);warm.position.set(-4,7,6);scene.add(warm);
  const rim=new THREE.PointLight(0x5ce1e6,85,35,2);rim.position.set(6,4,-3);scene.add(rim);
  const ambient=new THREE.HemisphereLight(0xd4e3f3,0x07111f,1.8);scene.add(ambient);
  const root=new THREE.Group();root.position.set(2.6,-1.4,-1);scene.add(root);
  const material=new THREE.MeshPhysicalMaterial({color:0x4d94ac,metalness:lite?.35:.08,roughness:lite?.28:.08,transmission:lite?0:.9,thickness:.6,ior:1.45,clearcoat:1,envMapIntensity:1.1,transparent:true,opacity:.9});
  const gold=new THREE.MeshPhysicalMaterial({color:0xd6b56a,metalness:1,roughness:.18,clearcoat:1,envMapIntensity:1.5});
  const capMaterial=new THREE.MeshStandardMaterial({color:0xd6b56a,metalness:.7,roughness:.2,emissive:0xc9a24d,emissiveIntensity:.7});
  const barGeo=new RoundedBoxGeometry(.49,1,.55,lite?2:4,.065);
  const capGeo=new RoundedBoxGeometry(.5,.045,.56,2,.018);
  const bars=[];
  for(let i=0;i<7;i++){
    const bar=new THREE.Mesh(barGeo,material);bar.position.x=(i-3)*.68;
    const cap=new THREE.Mesh(capGeo,capMaterial);cap.position.x=bar.position.x;
    root.add(bar,cap);bars.push({mesh:bar,cap,base:1+i*.39,height:.02});
  }
  // A real canvas texture supplies the R$ engraving; no downloaded model or texture.
  const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=256;
  const ctx=labelCanvas.getContext('2d');ctx.fillStyle='#c9a24d';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#f3dca4';ctx.lineWidth=5;ctx.beginPath();ctx.arc(128,128,108,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#6b4c13';ctx.font='600 90px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('R$',128,133);
  const coinTexture=new THREE.CanvasTexture(labelCanvas);coinTexture.colorSpace=THREE.SRGBColorSpace;
  const faceMaterial=new THREE.MeshPhysicalMaterial({map:coinTexture,color:0xe8d3a0,metalness:1,roughness:.22,clearcoat:1});
  const coinGeo=new THREE.CylinderGeometry(.43,.43,.085,lite?32:64,1);
  const coins=new THREE.Group();scene.add(coins);const coinList=[];
  for(let i=0;i<4;i++){const coin=new THREE.Mesh(coinGeo,[gold,faceMaterial,faceMaterial]);coin.rotation.x=Math.PI/2;coin.rotation.z=i*.5;coins.add(coin);coinList.push(coin)}
  const orbitGroup=new THREE.Group();scene.add(orbitGroup);
  const ringGeo=new THREE.TorusGeometry(3.8,.009,lite?4:8,lite?90:180);
  const ringMat=new THREE.MeshBasicMaterial({color:0x5ce1e6,transparent:true,opacity:.35});
  for(let i=0;i<2;i++){const ring=new THREE.Mesh(ringGeo,ringMat);ring.position.set(2.8,.5,-2);ring.rotation.set(.3+i*.6,.5+i*.8,-.3);orbitGroup.add(ring)}
  // The pinned method sequence switches to a four-ring tunnel.
  const tunnel=new THREE.Group();scene.add(tunnel);tunnel.visible=false;const tunnelRings=[];
  const tunnelGeo=new THREE.TorusGeometry(2.5,.014,6,120);
  for(let i=0;i<4;i++){const mat=new THREE.MeshBasicMaterial({color:0x244354,transparent:true,opacity:.35});const ring=new THREE.Mesh(tunnelGeo,mat);ring.position.set(0,1.6,5-i*5);tunnel.add(ring);tunnelRings.push(ring)}
  const count=lite?150:600,positions=new Float32Array(count*3),basePositions=new Float32Array(count*3);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*25;positions[i*3+1]=(Math.random()-.5)*15;positions[i*3+2]=(Math.random()-.5)*20;basePositions.set(positions.subarray(i*3,i*3+3),i*3)}
  const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x7ccbd3,size:lite?.025:.021,transparent:true,opacity:.43,depthWrite:false,sizeAttenuation:true}));scene.add(particles);
  const links=[];for(let i=0;i<45;i++){const j=(i+7)%45;const a=new THREE.Vector3().fromArray(positions,i*3),b=new THREE.Vector3().fromArray(positions,j*3);if(a.distanceTo(b)<5)links.push(...a.toArray(),...b.toArray())}
  const networkGeo=new THREE.BufferGeometry();networkGeo.setAttribute('position',new THREE.Float32BufferAttribute(links,3));
  const network=new THREE.LineSegments(networkGeo,new THREE.LineBasicMaterial({color:0x5ce1e6,transparent:true,opacity:.1}));scene.add(network);
  const grid=new THREE.GridHelper(35,38,0x2bc4d6,0x19414f);grid.position.y=-1.5;
  grid.material.transparent=true;grid.material.opacity=.1;grid.material.depthWrite=false;scene.add(grid);
  let composer=null,bloom=null;
  if(!lite){composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.35,.6,.85);composer.addPass(bloom);composer.addPass(new OutputPass())}
  const path=new THREE.CatmullRomCurve3([
    new THREE.Vector3(7,3.6,14),new THREE.Vector3(5,2.8,11),new THREE.Vector3(8,3.5,17),
    new THREE.Vector3(2,2.3,11),new THREE.Vector3(0,2,8),new THREE.Vector3(5,3.2,12),new THREE.Vector3(5,7,12)
  ]);
  camera.position.copy(path.getPoint(0));camera.lookAt(1.6,.7,0);
  const state={progress:0,section:'hero',local:0,methodProgress:0,visible:true,simulation:{current:1,optimized:.7}};
  const mouse=new THREE.Vector2(),dampedMouse=new THREE.Vector2();const target=new THREE.Vector3(1.6,.7,0),cameraPoint=new THREE.Vector3();
  let lost=false,destroyed=false,lastTime=0,startedAt=null,canvasVisible=true;
  const onPointer=e=>{mouse.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight*2-1))};
  addEventListener('pointermove',onPointer,{passive:true});
  function resize(){if(destroyed)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);composer?.setSize(innerWidth,innerHeight)}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(document.documentElement);resize();
  const visibilityObserver=new IntersectionObserver(entries=>canvasVisible=entries[0].isIntersecting);visibilityObserver.observe(canvas);
  const onLost=e=>{e.preventDefault();lost=true;document.documentElement.classList.add('scene-fallback')};
  const onRestored=()=>{lost=false;document.documentElement.classList.remove('scene-fallback');resize()};
  canvas.addEventListener('webglcontextlost',onLost);canvas.addEventListener('webglcontextrestored',onRestored);
  document.documentElement.classList.add('scene-ready');canvas.dataset.mode=lite?'lite':'full';
  function tick(time){
    if(destroyed||lost||document.hidden||!canvasVisible||!state.visible){lastTime=time;return}
    if(startedAt===null)startedAt=time;const elapsed=time-startedAt,delta=Math.min(Math.max(time-lastTime,0),.06)||.016;lastTime=time;
    const damp=1-Math.exp(-5*delta);dampedMouse.lerp(mouse,damp);path.getPoint(THREE.MathUtils.clamp(state.progress,0,1),cameraPoint);
    const method=state.section==='method';root.visible=!method;coins.visible=!method;orbitGroup.visible=!method;tunnel.visible=method;
    if(method){cameraPoint.set(Math.sin(state.methodProgress*Math.PI)*.35,1.6,11-state.methodProgress*17);target.set(0,1.6,-17);tunnelRings.forEach((ring,i)=>{const active=i<=Math.min(3,Math.floor(state.methodProgress*4));ring.material.color.set(active?0x5ce1e6:0x25404b);ring.material.opacity=active?.8:.2})}
    else{target.set(1.6,.7,-1);cameraPoint.x+=dampedMouse.x*.4;cameraPoint.y+=dampedMouse.y*.25}
    camera.position.lerp(cameraPoint,Math.min(1,damp*1.25));camera.lookAt(target);
    const spread=state.section==='services'?1.8:1;root.position.x=2.6+(state.section==='services'?1:0);root.rotation.y=Math.sin(elapsed*.12)*.09+dampedMouse.x*.08;
    material.opacity=state.section==='services'?.42:.9;
    bars.forEach((bar,i)=>{let desired=bar.base*Math.min(1,elapsed*.5);if(state.section==='simulator')desired=.45+(i%2===0?state.simulation.current:state.simulation.optimized)*3.2;bar.height=THREE.MathUtils.lerp(bar.height,desired,damp);bar.mesh.scale.y=Math.max(.02,bar.height);bar.mesh.position.y=bar.height/2;bar.mesh.position.x=(i-3)*.68*spread;bar.cap.position.set(bar.mesh.position.x,bar.height+.012,0)});
    orbitGroup.rotation.y=elapsed*.035;orbitGroup.rotation.z=Math.sin(elapsed*.1)*.045;
    const final=state.section==='final';coinList.forEach((coin,i)=>{const angle=elapsed*.2+i*Math.PI/2;const radius=final?1.2+Math.sin(elapsed*.2+i)*.3:3.9;coin.position.set(2.5+Math.cos(angle)*radius,(final?2:1.4)+Math.sin(angle*.7+i)*1.5,Math.sin(angle)*1.7-.5);coin.rotation.y=elapsed*.25+i;coin.rotation.z=Math.sin(elapsed*.24+i)*.16;coin.scale.setScalar(final?1.25:1)});
    const array=particleGeo.attributes.position.array;for(let i=0;i<count;i++)array[i*3+1]=((basePositions[i*3+1]+7.5+elapsed*.055)%15)-7.5;particleGeo.attributes.position.needsUpdate=true;particles.rotation.y=elapsed*.008;network.rotation.y=elapsed*.008;
    if(bloom)bloom.strength=THREE.MathUtils.lerp(bloom.strength,state.section==='about'?.45:.35,damp);
    if(composer)composer.render();else renderer.render(scene,camera);
  }
  function destroy(){if(destroyed)return;destroyed=true;resizeObserver.disconnect();visibilityObserver.disconnect();removeEventListener('pointermove',onPointer);canvas.removeEventListener('webglcontextlost',onLost);canvas.removeEventListener('webglcontextrestored',onRestored);const geometries=new Set(),materials=new Set();scene.traverse(obj=>{if(obj.geometry)geometries.add(obj.geometry);if(obj.material)(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(mat=>materials.add(mat))});geometries.forEach(geo=>geo.dispose());materials.forEach(mat=>mat.dispose());coinTexture.dispose();environmentTarget.dispose();composer?.passes.forEach(pass=>pass.dispose?.());composer?.dispose();renderer.dispose();document.documentElement.classList.remove('scene-ready')}
  return {tick,resize,destroy,mode:lite?'lite':'full',setState:patch=>Object.assign(state,patch),setSimulation:({current,optimized})=>{const max=Math.max(current,optimized,1);state.simulation={current:current/max,optimized:optimized/max}}};
}
