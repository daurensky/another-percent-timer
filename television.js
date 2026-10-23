import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from './vendor/CSS3DRenderer.js';
import { FontLoader } from './vendor/FontLoader.js';
import { TextGeometry } from './vendor/TextGeometry.js';

export async function createTelevision() {
 const stage=document.querySelector('#stage'), screen=document.querySelector('#screen');
 const scene=new THREE.Scene(), uiScene=new THREE.Scene();
 const camera=new THREE.PerspectiveCamera(33,innerWidth/innerHeight,.1,100);camera.position.set(0,.5,15);
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
 document.querySelector('#webgl').append(renderer.domElement);
 const css=new CSS3DRenderer();document.querySelector('#interface').append(css.domElement);
 const assembly=new THREE.Group(),uiAssembly=new THREE.Group();scene.add(assembly);uiScene.add(uiAssembly);
 const shell=new THREE.MeshStandardMaterial({color:0xb77a35,metalness:.25,roughness:.36});
 const trim=new THREE.MeshStandardMaterial({color:0xd49d52,metalness:.27,roughness:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x30251d,metalness:.38,roughness:.55});
 const chrome=new THREE.MeshStandardMaterial({color:0xc3b7a0,metalness:.83,roughness:.24});
 const black=new THREE.MeshStandardMaterial({color:0x1a1a15,roughness:.8});
 function roundedShape(w,h,r){const x=-w/2,y=-h/2,s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
 function block(w,h,d,r,mat,x=0,y=0,z=0,bevel=.06){const geometry=new THREE.ExtrudeGeometry(roundedShape(w,h,r),{depth:d,bevelEnabled:true,bevelSegments:5,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});geometry.translate(0,0,-d/2);const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;assembly.add(mesh);return mesh;}
 // Deep, softly rounded ochre housing and the moulded lid seam.
 block(5.05,4.65,1.55,.48,shell,0,0,-.24,.13);
 block(5.1,.24,1.64,.1,trim,0,2.05,-.23,.06);
 block(4.2,.14,1.15,.06,dark,0,2.36,-.4,.04);
 // Carry handle set back from the face.
 block(3.7,.16,.18,.07,trim,0,2.52,-.64,.05);
 for(const x of [-1.74,1.74])block(.18,.33,.2,.07,shell,x,2.38,-.64,.04);
 // The CRT surround nests into the front shell like the supplied reference.
 block(4.65,3.7,.44,.95,trim,0,-.4,.68,.16);
 block(4.12,3.23,.16,.78,dark,0,-.4,.98,.06);
 block(4.0,3.1,.08,.74,chrome,0,-.4,1.09,.035);
 block(3.87,2.98,.06,.70,black,0,-.4,1.14,.035);
 const surface=new CSS3DObject(screen);surface.scale.setScalar(.0048);surface.position.set(0,-.4,1.205);uiAssembly.add(surface);
 // Tuning dial, three mechanical keys, and perforated speaker grille.
 const dial=new THREE.Mesh(new THREE.CylinderGeometry(.31,.34,.19,48),dark);dial.rotation.x=Math.PI/2;dial.position.set(-2,1.62,.82);assembly.add(dial);
 const dialInner=new THREE.Mesh(new THREE.CylinderGeometry(.235,.235,.22,32),chrome);dialInner.rotation.x=Math.PI/2;dialInner.position.set(-2,1.62,.86);assembly.add(dialInner);
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;block(.022,.047,.035,.005,dark,-2+Math.sin(a)*.245,1.62+Math.cos(a)*.245,1,.002);}
 block(.025,.15,.02,.005,dark,-2,1.7,1.005,.002);
 for(let i=0;i<3;i++)block(.15,.24,.12,.025,i===0?new THREE.MeshStandardMaterial({color:0x85965b,roughness:.4}):chrome,-1.46+i*.19,1.65,.77,.02);
 block(1.37,.62,.06,.16,dark,1.55,1.64,.69,.04);
 for(let row=0;row<6;row++)for(let col=0;col<16;col++){
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.025,6,4),trim);dot.scale.z=.35;dot.position.set(.95+col*.076+(row%2)*.025,1.44+row*.075,.75);assembly.add(dot);
 }
 // Right-hand swivel bracket and weighted pedestal.
 const handleCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(2.45,.75,-.05),new THREE.Vector3(2.94,.65,-.05),new THREE.Vector3(3,-1.45,-.05),new THREE.Vector3(2.5,-2.05,.05),new THREE.Vector3(1.7,-2.2,.05)]);
 const handle=new THREE.Mesh(new THREE.TubeGeometry(handleCurve,36,.13,12,false),trim);handle.castShadow=true;assembly.add(handle);
 const pivot=new THREE.Mesh(new THREE.SphereGeometry(.24,24,16),trim);pivot.position.set(2.65,.65,.05);assembly.add(pivot);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.92,1.08,.38,64),dark);neck.position.set(0,-2.4,-.1);assembly.add(neck);
 const foot=new THREE.Mesh(new THREE.CylinderGeometry(1.57,1.8,.34,80),trim);foot.position.set(0,-2.66,-.1);foot.castShadow=true;foot.receiveShadow=true;assembly.add(foot);
 const baseRim=new THREE.Mesh(new THREE.TorusGeometry(1.62,.095,12,80),shell);baseRim.rotation.x=Math.PI/2;baseRim.position.set(0,-2.78,-.1);assembly.add(baseRim);
 // Raised, extruded lettering on a matching enamel signboard.
 const signY=3.35;
 for(const x of [-1.65,1.65])block(.065,1.06,.09,.02,dark,x,2.85,-.4,.01);
 block(5.6,1.05,.24,.15,shell,0,signY,-.16,.07);
 block(5.35,.85,.08,.11,new THREE.MeshStandardMaterial({color:0x26332a,roughness:.38,metalness:.3}),0,signY,.01,.035);
 const typeMaterial=new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xa8752a,emissiveIntensity:.25,roughness:.3,metalness:.25});
 const fontData=await fetch('./vendor/sign-font.json').then(r=>{if(!r.ok)throw new Error('Sign font unavailable');return r.json();});
 const font=new FontLoader().parse(fontData),letters=new THREE.Group();assembly.add(letters);
 function setSign(setup){
  while(letters.children.length){const child=letters.children[0];letters.remove(child);child.geometry.dispose();}
  const rows=setup?['ANOTHER','PERCENT TIMER']:['ДО КОНЦА ДНЯ','ОСТАЛОСЬ'];
  rows.forEach((text,index)=>{
   const geometry=new TextGeometry(text,{font,size:.28,depth:.045,curveSegments:6,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:2});
   geometry.computeBoundingBox();const box=geometry.boundingBox;const width=box.max.x-box.min.x;
   geometry.translate(-(box.max.x+box.min.x)/2,0,0);
   const mesh=new THREE.Mesh(geometry,typeMaterial);const scale=Math.min(1,4.95/width);mesh.scale.setScalar(scale);mesh.position.set(0,signY+(index===0?.09:-.25),.11);mesh.castShadow=true;letters.add(mesh);
  });
 }
 setSign(document.body.classList.contains('setting-up'));
 document.addEventListener('timer-mode',e=>setSign(e.detail.setup));
 // Small cast-metal maker's badge.
 const badgeCanvas=document.createElement('canvas');badgeCanvas.width=512;badgeCanvas.height=128;const ctx=badgeCanvas.getContext('2d');ctx.fillStyle='#e7d8b4';ctx.font='italic bold 72px Georgia';ctx.textAlign='center';ctx.fillText('Another',256,88);
 const badge=new THREE.Mesh(new THREE.PlaneGeometry(1.15,.29),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(badgeCanvas),transparent:true,metalness:.3,roughness:.4}));badge.position.set(-.15,1.65,.76);assembly.add(badge);
 scene.add(new THREE.HemisphereLight(0xf4eedb,0x151e15,2.6));
 const key=new THREE.DirectionalLight(0xffdeb0,4.5);key.position.set(-4,7,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.03;scene.add(key);
 const fill=new THREE.DirectionalLight(0xb7d3c1,2);fill.position.set(4,2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xf2a14a,3);rim.position.set(3,4,-4);scene.add(rim);
 const screenLight=new THREE.PointLight(0xc4e1a1,1.2,4);screenLight.position.set(0,-.3,2);assembly.add(screenLight);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.38}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.94;ground.receiveShadow=true;scene.add(ground);
 const target={x:.04,y:-.14}, reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();const vertical=8.3/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));const horizontal=7.1/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);camera.position.z=Math.max(vertical,horizontal);camera.position.y=.55;renderer.setSize(w,h);css.setSize(w,h);}
 resize();addEventListener('resize',resize);
 if(!reduced){addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;target.y=-.14+(e.clientX/innerWidth-.5)*.15;target.x=.04+(e.clientY/innerHeight-.5)*.09;},{passive:true});document.addEventListener('pointerleave',()=>{target.x=.04;target.y=-.14;});}
 assembly.rotation.set(target.x,target.y,0);
 function render(time){assembly.rotation.x=Math.abs(target.x-assembly.rotation.x)<.0002?target.x:assembly.rotation.x+(target.x-assembly.rotation.x)*.16;assembly.rotation.y=Math.abs(target.y-assembly.rotation.y)<.0002?target.y:assembly.rotation.y+(target.y-assembly.rotation.y)*.16;uiAssembly.quaternion.copy(assembly.quaternion);typeMaterial.emissiveIntensity=document.body.classList.contains('ending')&&!reduced?.4+Math.sin(time*.003)*.2:.25;renderer.render(scene,camera);css.render(uiScene,camera);}
 renderer.setAnimationLoop(render);document.addEventListener('visibilitychange',()=>renderer.setAnimationLoop(document.hidden?null:render));
 stage.dataset.ready='true';
}
