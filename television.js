import * as THREE from 'three';

// A fixed, detailed product render keeps the CRT interface perfectly stable.
// WebGL renders the cutout in sRGB; the same image is the no-WebGL fallback.
export async function createTelevision() {
 const host=document.querySelector('#webgl');
 const frame=document.querySelector('#television');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
 renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
 renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.5,.5,.5,-.5,.1,10);camera.position.z=2;
 const texture=await new THREE.TextureLoader().loadAsync('./assets/retro-tv.png');texture.colorSpace=THREE.SRGBColorSpace;
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));scene.add(plane);
 function resize(){const size=frame.clientWidth;renderer.setSize(size,size);renderer.render(scene,camera);}
 new ResizeObserver(resize).observe(frame);resize();
 frame.dataset.webgl='true';
 document.querySelector('#stage').dataset.ready='true';
}
