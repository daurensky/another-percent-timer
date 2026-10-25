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
 // A single rounded housing follows the screen; no control panel or carrying hardware.
 block(4.65,3.7,.95,.95,shell,0,-.4,.05,.15);
 // The CRT surround nests into the front shell like the supplied reference.
 block(4.65,3.7,.44,.95,trim,0,-.4,.68,.16);
 block(4.12,3.23,.16,.78,dark,0,-.4,.98,.06);
 block(4.0,3.1,.08,.74,chrome,0,-.4,1.09,.035);
 block(3.87,2.98,.06,.70,black,0,-.4,1.14,.035);
 const surface=new CSS3DObject(screen);surface.scale.setScalar(.0048);surface.position.set(0,-.4,1.205);uiAssembly.add(surface);
 // One physical power switch, with a matching accessible HTML hit target.
 const powerRim=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.065,48),dark);
 powerRim.rotation.x=Math.PI/2;powerRim.position.set(1.7,-2.08,1.09);assembly.add(powerRim);
 const powerMaterial=new THREE.MeshStandardMaterial({color:0x293126,emissive:0x74994b,emissiveIntensity:.18,metalness:.3,roughness:.4});
 const powerCap=new THREE.Mesh(new THREE.CylinderGeometry(.125,.125,.035,48),powerMaterial);
 powerCap.rotation.x=Math.PI/2;powerCap.position.set(1.7,-2.08,1.135);assembly.add(powerCap);
 const powerControl=new CSS3DObject(document.querySelector('#power'));
 powerControl.scale.setScalar(.004);powerControl.position.set(1.7,-2.08,1.16);uiAssembly.add(powerControl);
 document.addEventListener('timer-power',event=>{powerMaterial.emissiveIntensity=event.detail.powered?.18:0;});
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.92,1.08,.38,64),dark);neck.position.set(0,-2.4,-.1);assembly.add(neck);
 const foot=new THREE.Mesh(new THREE.CylinderGeometry(1.57,1.8,.34,80),trim);foot.position.set(0,-2.66,-.1);foot.castShadow=true;foot.receiveShadow=true;assembly.add(foot);
 const baseRim=new THREE.Mesh(new THREE.TorusGeometry(1.62,.095,12,80),shell);baseRim.rotation.x=Math.PI/2;baseRim.position.set(0,-2.78,-.1);assembly.add(baseRim);
 // Raised, extruded lettering on a matching enamel signboard.
 const signY=2.65;
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
 scene.add(new THREE.HemisphereLight(0xf4eedb,0x151e15,2.6));
 const key=new THREE.DirectionalLight(0xffdeb0,4.5);key.position.set(-4,7,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.03;scene.add(key);
 const fill=new THREE.DirectionalLight(0xb7d3c1,2);fill.position.set(4,2,3);scene.add(fill);
 const rim=new THREE.DirectionalLight(0xf2a14a,3);rim.position.set(3,4,-4);scene.add(rim);
 const screenLight=new THREE.PointLight(0xc4e1a1,1.2,4);screenLight.position.set(0,-.3,2);assembly.add(screenLight);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.38}));ground.rotation.x=-Math.PI/2;ground.position.y=-2.94;ground.receiveShadow=true;scene.add(ground);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 // The camera and model stay fixed. Only the distant background has parallax.
 assembly.rotation.set(.04,-.14,0);uiAssembly.quaternion.copy(assembly.quaternion);
 function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();const vertical=7.3/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));const horizontal=6.4/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect);camera.position.z=Math.max(vertical,horizontal);camera.position.y=.15;renderer.setSize(w,h);css.setSize(w,h);}
 resize();addEventListener('resize',resize);
 function render(time){typeMaterial.emissiveIntensity=document.body.classList.contains('ending')&&!reduced?.4+Math.sin(time*.003)*.2:.25;renderer.render(scene,camera);css.render(uiScene,camera);}
 renderer.setAnimationLoop(render);document.addEventListener('visibilitychange',()=>renderer.setAnimationLoop(document.hidden?null:render));
 stage.dataset.ready='true';
}
