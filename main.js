//initial global variables
var g_camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
const g_scene = new THREE.Scene();
const g_material = new THREE.MeshPhongMaterial({
	color: 0x666666,
	flatShading: false,
	side: THREE.DoubleSide
});
const g_renderer = new THREE.WebGLRenderer({
	preserveDrawingBuffer: true
});
const g_loader = new THREE.STLLoader();	
var g_body1;
var g_body2;
var g_transmission;
var g_engine;
var g_wheels;
var g_tires;

//global varibale to make adding or removing elements much better
var g_map = new Map();

//global variables for dragging/dropping modal content
/*
var g_initialX;
var g_initialY;
var g_active = false;
var g_currentX;
var g_currentY;
var g_xOffset;
var g_yOffset;
var g_listener1;
var g_listener2;
var g_listener3;
*/

//global variables I added while trying to figure out the sceenshot
var strMime = "image/jpeg";
var imgData = g_renderer.domElement.toDataURL(strMime);
var strDownloadMime = "image/octet-stream";
var initialCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
initialCamera.position.set(-11, -461, 153);
initialCamera.lookAt(g_scene.position);
var tempCamera;

//third batch of global variables
var g_vehicle_ref_x = 12
var g_vehicle_ref_y = 1.5
var g_vehicle_ref_z = -49
var g_vehicle_dx = 218
var g_vehicle_dy = 150
var g_vehicle_dz = 69/2.
var g_picture_name_variable = 0;
var g_picture_name;
var g_picture_id;

//listen for clicks outside the modal
window.addEventListener('click', outsideClick);


function init() {
	document.getElementById("checkbox1").checked = true;
	document.getElementById("checkbox2").checked = true;
	document.getElementById("checkbox3").checked = true;
	document.getElementById("checkbox4").checked = true;
	document.getElementById("checkbox5").checked = true;
	document.getElementById("checkbox6").checked = true;
}

function loadAndRender() {
	window.addEventListener('resize', onResize, false);
	g_renderer.setSize(window.innerWidth, window.innerHeight);

	var file = "data/body.stl";
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		var body = new THREE.Mesh(geometry, g_material);
		body.name = "body1";
		body.position.set(0,0,0);
		//body.rotation.x = -0.5 * Math.PI;
		g_body1 = body;
		g_scene.add(body);
		g_map.set("body1", body);
	});

	file = "data/body2.stl";
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		var body = new THREE.Mesh(geometry, g_material);
		body.name = "body2";
		body.position.set(0,0,0);
		//body.rotation.x = -0.5 * Math.PI;
		g_body2 = body;
		g_scene.add(body);
		g_map.set("body2", body);
	});

	file = "data/transmission.stl"
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		var transmission = new THREE.Mesh(geometry, g_material);
		transmission.name = "transmission";
		//transmission.rotation.x = -0.5 * Math.PI;
		g_transmission = transmission;
		g_scene.add(transmission);
		g_map.set("transmission", transmission);
	});

	file = "data/engine.stl"
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		var engine = new THREE.Mesh(geometry, g_material);
		engine.name = "engine";
		//engine.rotation.x = -0.5 * Math.PI;
		g_engine = engine;
		g_scene.add(engine);
		g_map.set("engine", engine);
	});

	loadAndRenderTiresAndWheels();

	var spotlight = new THREE.SpotLight(0xffffff);
	spotlight.name = "spotlight";
	spotlight.position.set(-50, 50, 250);
	spotlight.castShadow = true;
	g_scene.add(spotlight);

	var ambientLight = new THREE.AmbientLight(0xffffff);
	ambientLight.name = "ambientLight";
	g_scene.add(ambientLight);

	g_camera.position.set(0, 0, 510); 
	g_camera.lookAt(g_scene.position);

	document.getElementById("div1").appendChild(g_renderer.domElement);

	var trackballControls = initTrackballControls(g_camera, g_renderer);
	var clock = new THREE.Clock();

	function animate() {
		trackballControls.update(clock.getDelta());
		requestAnimationFrame(animate);
		g_renderer.render(g_scene, g_camera);
	}
	//animate();
	setTimeout(function(){ animate(); }, 500);

	function onResize() {
		g_camera.aspect = window.innerWidth / window.innerHeight;
		g_camera.updateProjectionMatrix();
		g_renderer.setSize(window.innerWidth, window.innerHeight);
	}
}

function saveAsImage() {
	tempCamera = g_camera;
	temp_r = document.getElementById("red").value;
	temp_g = document.getElementById("green").value;
	temp_b = document.getElementById("blue").value;

   	g_camera = initialCamera;
    g_camera.lookAt(g_scene.position);
   	g_camera.updateProjectionMatrix();

   	g_scene.background = new THREE.Color( 0xcccccc );
  	g_scene.background = new THREE.Color( 0x000000 );
	g_scene.background.setRGB(red, green, blue);

   	g_renderer.render(g_scene, g_camera);

	var imgData, imgNode;

    try {

        var strMime = "image/jpeg";
   	    imgData = g_renderer.domElement.toDataURL(strMime);

        setTimeout(function(){ saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg"); }, 1);

        setTimeout(function() {
        	g_camera = tempCamera;
        	changeColor();
        }, 2);

    } catch (e) {
        console.log(e);
        return;
    }

}

var saveFile = function (strData, filename) {
 	console.log("saveFile function");
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        document.body.appendChild(link); //Firefox requires the link to be in the body
        link.download = filename;
        link.href = strData;
        link.click();
        document.body.removeChild(link); 
    } else {
        location.replace(uri);
    }
}

function addOrRemoveElements(key, id) {
	var checked = document.getElementById(id).checked;

	if(key!="wheels"&&key!="tires") {
		g_map.get(key).visible = checked;
	}

	if(key=="wheels") {
		g_map.get("wheel_lf").visible = checked;
		g_map.get("wheel_rf").visible = checked;
		g_map.get("wheel_lr").visible = checked;
		g_map.get("wheel_rr").visible = checked;
	}

	if(key=="tires") {
		g_map.get("tire_lf").visible = checked;
		g_map.get("tire_rf").visible = checked;
		g_map.get("tire_lr").visible = checked;
		g_map.get("tire_rr").visible = checked;
	}
}

function changeColor() {
	console.log("in changeColor");

	var red = document.getElementById("red").value;
	var green = document.getElementById("green").value;
	var blue = document.getElementById("blue").value;

	g_scene.background = new THREE.Color( 0xcccccc );
  	g_scene.background = new THREE.Color( 0x000000 );
	g_scene.background.setRGB(red, green, blue);

	red=parseInt(red*=100);
	green=parseInt(green*=100);
	blue=parseInt(blue*=100);

	red = JSON.stringify(red);
	green = JSON.stringify(green);
	blue = JSON.stringify(blue);

	while(red.length < 3) {
		red = "0" + red;
	}

	while(green.length < 3) {
		green = "0" + green;
	}

	while(blue.length < 3) {
		blue = "0" + blue;
	}

	document.getElementById("redd").innerHTML = "red: " + red;
	document.getElementById("greenn").innerHTML = "green: " + green;
	document.getElementById("bluee").innerHTML = "blue: " + blue;
}

function loadAndRenderTiresAndWheels() {
	//wheel
	var file = "data/wheel-1.stl" 
	var example_wheel;
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		example_wheel = new THREE.Mesh(geometry, g_material);
		example_wheel.name = "example_wheel";
		g_map.set("example_wheel", example_wheel);
	});

	//tire
	file = "data/tire-1.stl"
	var example_tire;
	g_loader.load(file, function(geometry) {
		geometry.computeBoundingBox();
		example_tire = new THREE.Mesh(geometry, g_material);
		example_tire.name = "example_tire";
		g_map.set("example_tire", example_tire);
	})

	setTimeout(function() { 
		//wheels
		var wheel_lf = example_wheel.clone();
		var wheel_rf = example_wheel.clone();
		var wheel_lr = example_wheel.clone();
		var wheel_rr = example_wheel.clone();

		g_map.set("wheel_lf", wheel_lf);
		g_map.set("wheel_rf", wheel_rf);
		g_map.set("wheel_lr", wheel_lr);
		g_map.set("wheel_rr", wheel_rr);

		//tires
		var tire_lf = example_tire.clone();
		var tire_rf = example_tire.clone();
		var tire_lr = example_tire.clone();
		var tire_rr = example_tire.clone();

		g_map.set("tire_lf", tire_lf);
		g_map.set("tire_rf", tire_rf);
		g_map.set("tire_lr", tire_lr);
		g_map.set("tire_rr", tire_rr);

		//wheels
		g_map.get('wheel_lf').rotation.x = ( THREE.Math.degToRad(  90. ) );
  		g_map.get('wheel_rf').rotation.x = ( THREE.Math.degToRad( -90 ) );
 		g_map.get('wheel_lr').rotation.x = ( THREE.Math.degToRad(  90 ) );
  		g_map.get('wheel_rr').rotation.x = ( THREE.Math.degToRad( -90 ) );

 		g_map.get('wheel_lf').position.x = g_vehicle_ref_x - g_vehicle_dx/2.
		g_map.get('wheel_lf').position.y = g_vehicle_ref_y - g_vehicle_dy/2.
  		g_map.get('wheel_lf').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('wheel_rf').position.x = g_vehicle_ref_x - g_vehicle_dx/2.
  		g_map.get('wheel_rf').position.y = g_vehicle_ref_y + g_vehicle_dy/2.
  		g_map.get('wheel_rf').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('wheel_lr').position.x = g_vehicle_ref_x + g_vehicle_dx/2.
  		g_map.get('wheel_lr').position.y = g_vehicle_ref_y - g_vehicle_dy/2.
  		g_map.get('wheel_lr').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('wheel_rr').position.x = g_vehicle_ref_x + g_vehicle_dx/2.
  		g_map.get('wheel_rr').position.y = g_vehicle_ref_y + g_vehicle_dy/2.
  		g_map.get('wheel_rr').position.z = g_vehicle_ref_z + g_vehicle_dz

  		//tires
  		g_map.get('tire_lf').rotation.x = ( THREE.Math.degToRad(  90. ) );
  		g_map.get('tire_rf').rotation.x = ( THREE.Math.degToRad( -90 ) );
 		g_map.get('tire_lr').rotation.x = ( THREE.Math.degToRad(  90. ) );
  		g_map.get('tire_rr').rotation.x = ( THREE.Math.degToRad( -90 ) );

  		g_map.get('tire_lf').position.x = g_vehicle_ref_x - g_vehicle_dx/2.
		g_map.get('tire_lf').position.y = g_vehicle_ref_y - g_vehicle_dy/2.
  		g_map.get('tire_lf').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('tire_rf').position.x = g_vehicle_ref_x - g_vehicle_dx/2.
  		g_map.get('tire_rf').position.y = g_vehicle_ref_y + g_vehicle_dy/2.
  		g_map.get('tire_rf').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('tire_lr').position.x = g_vehicle_ref_x + g_vehicle_dx/2.
  		g_map.get('tire_lr').position.y = g_vehicle_ref_y - g_vehicle_dy/2.
  		g_map.get('tire_lr').position.z = g_vehicle_ref_z + g_vehicle_dz
  		g_map.get('tire_rr').position.x = g_vehicle_ref_x + g_vehicle_dx/2.
  		g_map.get('tire_rr').position.y = g_vehicle_ref_y + g_vehicle_dy/2.
  		g_map.get('tire_rr').position.z = g_vehicle_ref_z + g_vehicle_dz

  		g_scene.add(g_map.get("wheel_lf"));
  		g_scene.add(g_map.get("wheel_rf"));
  		g_scene.add(g_map.get("wheel_lr"));
  		g_scene.add(g_map.get("wheel_rr"));

  		g_scene.add(g_map.get("tire_lf"));
  		g_scene.add(g_map.get("tire_rf"));
  		g_scene.add(g_map.get("tire_lr"));
  		g_scene.add(g_map.get("tire_rr"));
	}, 200);
}

function changeTireLength(value) {
	var tire_lf = g_map.get("tire_lf");
	var tire_lr = g_map.get("tire_lr");
	var wheel_lf = g_map.get("wheel_lf");
	var wheel_lr = g_map.get("wheel_lr");
	var tire_rf = g_map.get("tire_rf");
	var tire_rr = g_map.get("tire_rr")
	var wheel_rf = g_map.get("wheel_rf");
	var wheel_rr = g_map.get("wheel_rr");
	var tire_lf_og = tire_lf.clone();
	var tire_lf_delta;

	tire_lf.position.x = tire_lr.position.x - value;
	tire_lf_delta = tire_lf_og.position.x - tire_lf.position.x;
	tire_lr.position.x += tire_lf_delta/2;
	tire_lf.position.x += tire_lf_delta/2;

	wheel_lf.position.x = tire_lf.position.x;
	wheel_lr.position.x = tire_lr.position.x;

	tire_rf.position.x = tire_lf.position.x;
	tire_rr.position.x = tire_lr.position.x;

	wheel_rf.position.x = tire_rf.position.x;
	wheel_rr.position.x = tire_rr.position.x;

	document.getElementById('length').innerHTML = "length: " + value;
}

function changeTireWidth(value) {
	var tire_lf = g_map.get("tire_lf");
	var tire_lr = g_map.get("tire_lr");
	var wheel_lf = g_map.get("wheel_lf");
	var wheel_lr = g_map.get("wheel_lr");
	var tire_rf = g_map.get("tire_rf");
	var tire_rr = g_map.get("tire_rr")
	var wheel_rf = g_map.get("wheel_rf");
	var wheel_rr = g_map.get("wheel_rr");
	var tire_lf_og = tire_lf.clone();
	var tire_lf_delta;

	tire_lf.position.y = tire_rf.position.y - value;
	tire_lf_delta = tire_lf_og.position.y - tire_lf.position.y;
	tire_lf.position.y += tire_lf_delta/2;
	tire_rf.position.y += tire_lf_delta/2;

	wheel_lf.position.y = tire_lf.position.y;
	wheel_rf.position.y = tire_rf.position.y;

	tire_lr.position.y = tire_lf.position.y;
	tire_rr.position.y = tire_rf.position.y;

	wheel_lr.position.y = tire_lr.position.y;
	wheel_rr.position.y = tire_rr.position.y;

	document.getElementById('width').innerHTML = "width: " + value;
}

function tradeSpace() {
	changeTireLength(data.case_0.length);
	changeTireWidth(data.case_0.width);

	setTimeout(function() {saveImageToServer();}, 1);

	setTimeout(function() {
		changeTireLength(data.case_36.length);
		changeTireWidth(data.case_36.width);
	}, 50);

	setTimeout(function() {saveImageToServer();}, 100);

	setTimeout(function() {
		changeTireLength(data.case_72.length);
		changeTireWidth(data.case_72.width);
	}, 150);

	setTimeout(function() {saveImageToServer();}, 200);

	setTimeout(function() {
		changeTireLength(data.case_108.length);
		changeTireWidth(data.case_108.width);
	}, 250);

	setTimeout(function() {saveImageToServer();}, 300);

	setTimeout(function() {
		changeTireLength(data.case_144.length);
		changeTireWidth(data.case_144.width);
	}, 350);

	setTimeout(function() {saveImageToServer();}, 400);

	setTimeout(function() {
		changeTireLength(data.case_180.length);
		changeTireWidth(data.case_180.width);
	}, 450);

	setTimeout(function() {saveImageToServer();}, 500);

	setTimeout(function() {
		changeTireLength(data.case_216.length);
		changeTireWidth(data.case_216.width);
	}, 550);

	setTimeout(function() {saveImageToServer();}, 600);

	setTimeout(function() {
		changeTireLength(data.case_252.length);
		changeTireWidth(data.case_252.width);
	}, 650);

	setTimeout(function() {saveImageToServer();}, 700);

	setTimeout(function() {
		changeTireLength(data.case_288.length);
		changeTireWidth(data.case_288.width);
	}, 750);

	setTimeout(function() {saveImageToServer();}, 800);

	setTimeout(function() {setUpScreenForCollage()}, 1000);
}

function saveImageToServer() {
	tempCamera = g_camera;
	temp_r = document.getElementById("red").value;
	temp_g = document.getElementById("green").value;
	temp_b = document.getElementById("blue").value;

   	g_camera = initialCamera;
    g_camera.lookAt(g_scene.position);
   	g_camera.updateProjectionMatrix();

   	g_scene.background = new THREE.Color( 0xcccccc );
  	g_scene.background = new THREE.Color( 0x000000 );
	g_scene.background.setRGB(red, green, blue);

   	g_renderer.render(g_scene, g_camera);

   	setTimeout(function() {
   		var screenshot = g_renderer.domElement.toDataURL();
		var newElement = document.createElement("IMG");
		newElement.setAttribute("src", screenshot);
		newElement.setAttribute("width", "33%");
		newElement.setAttribute("height", "33%");
		newElement.setAttribute("alt", "screenshot should be here");
		newElement.setAttribute("id", "picture" + g_picture_name_variable);
		newElement.setAttribute("onclick", "createSmallerModal(this.id, this.name)");
		newElement.setAttribute("name", g_picture_name_variable);
		newElement.setAttribute("class", "picture");
		document.getElementById("screenshot").appendChild(newElement);
		g_picture_name_variable++;
   	}, 1);

   	setTimeout(function() { 
   		g_camera = tempCamera;
    	changeColor();
   	}, 2);
}

function setUpScreenForCollage() {
	document.getElementById("menu").style.display = "none";
	document.getElementById("div1").style.display = "none";
	var button = document.createElement("BUTTON");
	button.setAttribute("onclick", "takeScreenShot()");
	button.setAttribute("id", "screenshot-button");
	button.innerHTML = "screenshot";
	document.getElementById("collage-controls").appendChild(button);
}

var takeScreenShot = function() {
    html2canvas(document.getElementById("screenshot"), {
        onrendered: function (canvas) {
            var tempcanvas=document.createElement('canvas');
			tempcanvas.setAttribute("width", canvas.width);
			tempcanvas.setAttribute("height", canvas.height);
            var context=tempcanvas.getContext('2d');
            context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
            var link=document.createElement("a");
            link.href=tempcanvas.toDataURL('image/jpg');   //function blocks CORS
            link.download = 'frog-tradespace.jpg';
            link.click();
        }
    });
}

function createModal(id, name) {
	//global variables needed to adjust pictures
	g_picture_name = name;
	g_picture_id = id;

	//modal variables
	var modal = document.createElement("div");
	var modal_content = document.createElement("div");
	var closeBtn = document.createElement("span");

	//close button (x)
	closeBtn.setAttribute("id", "closeBtn");
	closeBtn.setAttribute("class", "closeBtn");
	closeBtn.setAttribute("onclick", "closeModal()");

	//the modal itself
	modal_content.setAttribute("class", "modal_content");
	modal_content.setAttribute("id", "modal_content");
	modal_content.appendChild(closeBtn);

	//the big div (tuns background grey)
	modal.setAttribute("class", "modal");
	modal.appendChild(modal_content);
	modal.setAttribute("id", "modal");

	//put modal on screen
	document.getElementById("screenshot").appendChild(modal);
	//put x in modal
	document.getElementById("closeBtn").innerHTML="&times;";

	//create clone of selected picture to put in modal
	var clone = document.getElementById(id).cloneNode(false);
	clone.setAttribute("class", "photocopy");
	clone.setAttribute("id", "clone");
	clone.setAttribute("onclick", "");
	clone.style.width = "65%";
	clone.style.height = "auto";
	document.getElementById("modal_content").appendChild(clone);

	//create a new row to display picture information
	var info_row = document.createElement("p");
	info_row.setAttribute("id", "info_row");
	document.getElementById("modal_content").appendChild(info_row);

	//create slider to adjust selected picture size
	//while keeping ratio the same
	var size_slider = document.createElement("input");
	size_slider.setAttribute("type", "range");
	size_slider.setAttribute("id", "size_slider")
	size_slider.setAttribute("min", "0");
	size_slider.setAttribute("max", "1000");
	size_slider.setAttribute("step", "1");
	size_slider.setAttribute("value", "window.innerWidth/3");
	size_slider.innerHTML = window.innerWidth/3;
	size_slider.setAttribute("oninput", "changePictureSize(this.value)");
	document.getElementById("info_row").appendChild(size_slider);

	//label for size slider
	var size_info = document.createElement("mytag");
	size_info.setAttribute("id", "size_info");
	size_info.innerHTML = "size";
	size_info.style.paddingRight="20px";
	size_info.style.paddingLeft="10px";
	document.getElementById("info_row").appendChild(size_info);

	//create slider to adjust selected picture width
	var width_slider = document.createElement("input");
	width_slider.setAttribute("type", "range");
	width_slider.setAttribute("id", "width_slider")
	width_slider.setAttribute("min", "0");
	width_slider.setAttribute("max", "1000");
	width_slider.setAttribute("step", "1");
	width_slider.setAttribute("value", "window.innerWidth/3");
	width_slider.setAttribute("oninput", "changePictureWidth(this.value)");
	document.getElementById("info_row").appendChild(width_slider);

	//display width info
	var width_info = document.createElement("mytag");
	width_info.setAttribute("id", "width_info");
	width_info.innerHTML="width: " + document.getElementById(id).width;
	width_info.style.paddingRight="20px";
	width_info.style.paddingLeft="10px";
	document.getElementById("info_row").appendChild(width_info);

	//create slider to adjust selected picture height
	var height_slider = document.createElement("input");
	height_slider.setAttribute("type", "range");
	height_slider.setAttribute("id", "height_slider")
	height_slider.setAttribute("min", "0");
	height_slider.setAttribute("max", "1000");
	height_slider.setAttribute("step", "1");
	height_slider.setAttribute("value", "window.innerWidth/3");
	height_slider.setAttribute("oninput", "changePictureHeight(this.value)");
	//height_slider.style.left = "65%";
	document.getElementById("info_row").appendChild(height_slider);

	//display height info
	var height_info = document.createElement("mytag");
	height_info.setAttribute("id", "height_info");
	height_info.innerHTML="height: " + document.getElementById(id).height;
	height_info.style.paddingLeft="10px";
	height_info.style.paddingRight="20px";
	document.getElementById("info_row").appendChild(height_info);
}

function createSmallerModal(id, name) {
	console.log("smaller Modal");
	//global variables needed to adjust pictures
	g_picture_name = name;
	g_picture_id = id;

	//modal variables
	var modal = document.createElement("div");
	var modal_content = document.createElement("div");
	var closeBtn = document.createElement("span");

	//close button (x)
	closeBtn.setAttribute("id", "closeBtn");
	closeBtn.setAttribute("class", "closeBtn");
	closeBtn.setAttribute("onclick", "closeModal()");

	//the modal itself
	modal_content.setAttribute("class", "smaller_modal_content");
	modal_content.setAttribute("id", "modal_content");
	modal_content.appendChild(closeBtn);
	//may take out
	//modal_content.setAttribute("draggable", "true");
	//modal_content.setAttribute("droppable", "true");
	//modal_content.setAttribute("moveable", "true");

	//the big div (tuns background grey)
	modal.setAttribute("class", "smaller_modal");
	modal.appendChild(modal_content);
	modal.setAttribute("id", "modal");

	//make the modal content draggable on the modal
	//g_listener1 = modal.addEventListener("mousedown", dragStart, false);
	//g_listener2 = modal.addEventListener("mouseup", dragEnd, false);
	//g_listener3 = modal.addEventListener("mousemove", drag, false);

	//put modal on screen
	document.getElementById("screenshot").appendChild(modal);
	//put x in modal
	document.getElementById("closeBtn").innerHTML="&times;";

	//create clone of selected picture to put in modal
	/*
	var clone = document.getElementById(id).cloneNode(false);
	clone.setAttribute("class", "photocopy");
	clone.setAttribute("id", "clone");
	clone.setAttribute("onclick", "");
	clone.style.width = "65%";
	clone.style.height = "auto";
	document.getElementById("modal_content").appendChild(clone);
	*/

	//var dragItem = document.querySelector("#item");
    //var container = document.querySelector("#container");
    var dragItem = document.getElementById("modal_content");
    var container = document.getElementById("modal");

    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragItem) {
        active = true;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;

      active = false;
    }

    function drag(e) {
      if (active) {
      
        e.preventDefault();
      
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, dragItem);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    }

	//create a new row to display picture information
	var info_row = document.createElement("p");
	info_row.setAttribute("id", "info_row");
	document.getElementById("modal_content").appendChild(info_row);

	//create slider to adjust selected picture size
	//while keeping ratio the same
	var size_slider = document.createElement("input");
	size_slider.setAttribute("type", "range");
	size_slider.setAttribute("id", "size_slider")
	size_slider.setAttribute("min", "0");
	size_slider.setAttribute("max", "1000");
	size_slider.setAttribute("step", "1");
	size_slider.setAttribute("value", "window.innerWidth/3");
	size_slider.innerHTML = window.innerWidth/3;
	size_slider.setAttribute("oninput", "changePictureSize(this.value)");
	document.getElementById("info_row").appendChild(size_slider);

	//label for size slider
	var size_info = document.createElement("mytag");
	size_info.setAttribute("id", "size_info");
	size_info.innerHTML = "size";
	size_info.style.paddingRight="20px";
	size_info.style.paddingLeft="10px";
	document.getElementById("info_row").appendChild(size_info);

	//create slider to adjust selected picture width
	var width_slider = document.createElement("input");
	width_slider.setAttribute("type", "range");
	width_slider.setAttribute("id", "width_slider")
	width_slider.setAttribute("min", "0");
	width_slider.setAttribute("max", "1000");
	width_slider.setAttribute("step", "1");
	width_slider.setAttribute("value", "window.innerWidth/3");
	width_slider.setAttribute("oninput", "changePictureWidth(this.value)");
	document.getElementById("info_row").appendChild(width_slider);

	//display width info
	var width_info = document.createElement("mytag");
	width_info.setAttribute("id", "width_info");
	width_info.innerHTML="width: " + document.getElementById(id).width;
	width_info.style.paddingRight="20px";
	width_info.style.paddingLeft="10px";
	document.getElementById("info_row").appendChild(width_info);

	//create slider to adjust selected picture height
	var height_slider = document.createElement("input");
	height_slider.setAttribute("type", "range");
	height_slider.setAttribute("id", "height_slider")
	height_slider.setAttribute("min", "0");
	height_slider.setAttribute("max", "1000");
	height_slider.setAttribute("step", "1");
	height_slider.setAttribute("value", "window.innerWidth/3");
	height_slider.setAttribute("oninput", "changePictureHeight(this.value)");
	//height_slider.style.left = "65%";
	document.getElementById("info_row").appendChild(height_slider);

	//display height info
	var height_info = document.createElement("mytag");
	height_info.setAttribute("id", "height_info");
	height_info.innerHTML="height: " + document.getElementById(id).height;
	height_info.style.paddingLeft="10px";
	height_info.style.paddingRight="20px";
	document.getElementById("info_row").appendChild(height_info);
}

function closeModal() {
	document.getElementById("screenshot").removeChild(document.getElementById("modal"));
}

function changePictureSize(value) {
	document.getElementById(g_picture_id).style.width = value + "px";
	document.getElementById(g_picture_id).style.height = "auto";
	document.getElementById("width_info").innerHTML = "width: " + value;
	document.getElementById("height_info").innerHTML = "height: " + value;
}

function changePictureWidth(value) {
	document.getElementById(g_picture_id).style.width = value + "px";
	document.getElementById(g_picture_id).style.height = document.getElementById("height_slider").value + "px";
	document.getElementById("height_info").innerHTML = "height: " + document.getElementById(g_picture_id).height;;
	document.getElementById("width_info").innerHTML = "width: " + document.getElementById(g_picture_id).width;
}

function changePictureHeight(value) {
	document.getElementById(g_picture_id).style.height = value + "px";
	document.getElementById(g_picture_id).style.width= document.getElementById("width_slider").value;
	document.getElementById("height_info").innerHTML = "height: " + document.getElementById(g_picture_id).height;;
	document.getElementById("width_info").innerHTML = "width: " + document.getElementById(g_picture_id).width;
}

function outsideClick(e) {
	if(e.target == modal) {
		document.getElementById("screenshot").removeChild(document.getElementById("modal"));
	}
}

function dragStart(e) {
	console.log("drag start");
	if(e.target == document.getElementById("modal_content")); {
		g_initialX = e.clientX - g_xOffset;
		g_initialY = e.clientY - g_yOffset;

		g_active = true;
	}
}

function drag(e) {
	console.log("drag");
	if (g_active) {
		e.preventDefault();

		currentX = e.clientX - g_initialX;
		currentY = e.clientY - g_initialX;

		g_xOffset = g_currentX;
		g_yOffset = g_currentY;

		setTranslate(currentX, currentY, document.getElementById("modal_content"));
	}

	console.log("in drag, active is " + g_active);
}

function dragEnd(e) {
	console.log("drag end");
	g_initialX = g_currentX;
	g_initialY = g_currentY;

	g_active = false;
}

function setTranslate(xPos, yPos, el) {
	console.log("translate");
	el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
}