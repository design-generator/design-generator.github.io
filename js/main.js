// put all the main functionalities here!
$(function () {
	var camera, scene, renderer;
	var control;

	// materials
	var boxMaterial;
	var lineMaterial;
	var slabMaterial
	var frameColor = 0x000000;

	// inner core
	var core;
	var coreHelper = new THREE.BoxHelper(core, frameColor);
	var coreVertices = [];

	// outer frame
	var frame;
	var frameHelper = new THREE.BoxHelper(frame, frameColor);
	var frameVertices = [];

	var lines = [];
	var windows = [];

	var mult = controls.Offset * 2;
	var offsetLength = controls.Length + mult;
	var offsetWidth = controls.Width + mult;
	var offsetHeight = controls.Height;

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.y = 10;
		camera.position.x = 50;
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xffffff );

		// define materials
		boxMaterial = new THREE.MeshBasicMaterial( {
			color: 0x0000ff,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: .3
		} );

		lineMaterial = new THREE.LineBasicMaterial({
            color: frameColor
        });

        slabMaterial = new THREE.MeshBasicMaterial( {
        	color: 0xff0000,
        	side: THREE.DoubleSide
        } );

        createBuilding();

      	// define renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );

		container = document.getElementById("viewer3d")
		var texture = new THREE.Texture(container);
		texture.needsUpdate = true;
		container.appendChild( renderer.domElement );

		window.addEventListener( 'resize', onWindowResize, false );

		// add mouse controls
		control = new THREE.OrbitControls( camera, container );
	}

	function createBuilding() {
		coreGeom = new THREE.Geometry();
		frameGeom = new THREE.Geometry();

		// floor vertices
		coreVertices[0] = new THREE.Vector3( -controls.Length * .5,	0, controls.Width * .5 );
		coreVertices[1] = new THREE.Vector3( controls.Length * .5, 	0, controls.Width * .5 );
		coreVertices[2] = new THREE.Vector3( controls.Length * .5, 	0, -controls.Width * .5 );
		coreVertices[3] = new THREE.Vector3( -controls.Length * .5,	0, -controls.Width * .5 );

		// ceiling vertices
		coreVertices[4] = new THREE.Vector3( -controls.Length * .5,	controls.Height * controls.FloorCount,  controls.Width * .5 );
		coreVertices[5] = new THREE.Vector3( controls.Length * .5, 	controls.Height * controls.FloorCount,  controls.Width * .5 );
		coreVertices[6] = new THREE.Vector3( controls.Length * .5, 	controls.Height * controls.FloorCount,  -controls.Width * .5 );
		coreVertices[7] = new THREE.Vector3( -controls.Length * .5,	controls.Height * controls.FloorCount,  -controls.Width * .5 );

		// offset floor vertices
		frameVertices[0] = new THREE.Vector3( -offsetLength * .5,	0, offsetWidth * .5 );
		frameVertices[1] = new THREE.Vector3( offsetLength * .5, 	0, offsetWidth * .5 );
		frameVertices[2] = new THREE.Vector3( offsetLength * .5, 	0, -offsetWidth * .5 );
		frameVertices[3] = new THREE.Vector3( -offsetLength * .5,	0, -offsetWidth * .5 );

		// offset ceiling vertices
		frameVertices[4] = new THREE.Vector3( -offsetLength * .5,	offsetHeight * controls.FloorCount,  offsetWidth * .5 );
		frameVertices[5] = new THREE.Vector3( offsetLength * .5, 	offsetHeight * controls.FloorCount,  offsetWidth * .5 );
		frameVertices[6] = new THREE.Vector3( offsetLength * .5, 	offsetHeight * controls.FloorCount,  -offsetWidth * .5 );
		frameVertices[7] = new THREE.Vector3( -offsetLength * .5,	offsetHeight * controls.FloorCount,  -offsetWidth * .5 );

		coreGeom.vertices = coreVertices;
		frameGeom.vertices = frameVertices;

		// bottom
		coreGeom.faces[0] = new THREE.Face3( 0, 1, 2 );
		coreGeom.faces[1] = new THREE.Face3( 0, 2, 3 );
		frameGeom.faces[0] = new THREE.Face3( 0, 1, 2 );
		frameGeom.faces[1] = new THREE.Face3( 0, 2, 3 );
		// left
		coreGeom.faces[2] = new THREE.Face3( 7, 4, 0 );
		coreGeom.faces[3] = new THREE.Face3( 7, 0, 3 );
		frameGeom.faces[2] = new THREE.Face3( 7, 4, 0 );
		frameGeom.faces[3] = new THREE.Face3( 7, 0, 3 );
		// front
		coreGeom.faces[4] = new THREE.Face3( 4, 5, 1 );
		coreGeom.faces[5] = new THREE.Face3( 4, 1, 0 );
		frameGeom.faces[4] = new THREE.Face3( 4, 5, 1 );
		frameGeom.faces[5] = new THREE.Face3( 4, 1, 0 );
		// back
		coreGeom.faces[6] = new THREE.Face3( 6, 7, 3 );
		coreGeom.faces[7] = new THREE.Face3( 6, 3, 2 );
		frameGeom.faces[6] = new THREE.Face3( 6, 7, 3 );
		frameGeom.faces[7] = new THREE.Face3( 6, 3, 2 );
		// right
		coreGeom.faces[8] = new THREE.Face3( 5, 6, 2 );
		coreGeom.faces[9] = new THREE.Face3( 5, 2, 1 );
		frameGeom.faces[8] = new THREE.Face3( 5, 6, 2 );
		frameGeom.faces[9] = new THREE.Face3( 5, 2, 1 );
		// top
		coreGeom.faces[10] = new THREE.Face3( 7, 6, 5 );
		coreGeom.faces[11] = new THREE.Face3( 7, 5, 4 );
		frameGeom.faces[10] = new THREE.Face3( 7, 6, 5 );
		frameGeom.faces[11] = new THREE.Face3( 7, 5, 4 );

		core = new THREE.Mesh( coreGeom, boxMaterial );
		frame = new THREE.Mesh ( frameGeom, boxMaterial);

		// create geometry frames
		scene.add(coreHelper);
		scene.add(frameHelper);
		coreHelper.update(core);
		frameHelper.update(frame);

		// draw lines between corner points
		for (var i = 0; i < frame.geometry.vertices.length; i++)
		{
			var line = new THREE.Geometry();
			line.vertices.push(coreVertices[i]);
			line.vertices.push(frameVertices[i]);
			lines[i] = new THREE.Line(line, lineMaterial);
			scene.add(lines[i]);
		}

		createWindows(controls);
		createSlabs(controls);
	}

	window.updateBuilding = function updateBuilding(cnrt)
	{

		//clear scene
		for (var i = 0; i < scene.children.length; i++)
		{
			var obj = scene.children[ i ];
			scene.remove(obj)
		}

		// floor vertices
		coreVertices[0].set(-cnrt.Length * .5,	0, cnrt.Width * .5 );
		coreVertices[1].set(cnrt.Length * .5, 	0, cnrt.Width * .5 );
		coreVertices[2].set(cnrt.Length * .5, 	0, -cnrt.Width * .5 );
		coreVertices[3].set(-cnrt.Length * .5,	0, -cnrt.Width * .5 );

		// ceiling vertices
		coreVertices[4].set(-cnrt.Length * .5,	cnrt.Height * cnrt.FloorCount,  cnrt.Width * .5 );
		coreVertices[5].set(cnrt.Length * .5, 	cnrt.Height * cnrt.FloorCount,  cnrt.Width * .5 );
		coreVertices[6].set(cnrt.Length * .5, 	cnrt.Height * cnrt.FloorCount,  -cnrt.Width * .5 );
		coreVertices[7].set(-cnrt.Length * .5,	cnrt.Height * cnrt.FloorCount,  -cnrt.Width * .5 );

		// offset floor vertices
		frameVertices[0].set(-offsetLength * .5,	0, offsetWidth * .5 );
		frameVertices[1].set(offsetLength * .5, 	0, offsetWidth * .5 );
		frameVertices[2].set(offsetLength * .5, 	0, -offsetWidth * .5 );
		frameVertices[3].set(-offsetLength * .5,	0, -offsetWidth * .5 );

		// offset ceiling vertices
		frameVertices[4].set(-offsetLength * .5,	offsetHeight * cnrt.FloorCount,  offsetWidth * .5 );
		frameVertices[5].set(offsetLength * .5, 	offsetHeight * cnrt.FloorCount,  offsetWidth * .5 );
		frameVertices[6].set(offsetLength * .5, 	offsetHeight * cnrt.FloorCount,  -offsetWidth * .5 );
		frameVertices[7].set(-offsetLength * .5,	offsetHeight * cnrt.FloorCount,  -offsetWidth * .5 );

		coreGeom.vertices = coreVertices;
		frameGeom.vertices = frameVertices;

		// create geometry frames
		scene.add(coreHelper);
		scene.add(frameHelper);
		coreHelper.update(core);
		frameHelper.update(frame);

		// draw lines between corner points
		for (var i = 0; i < frame.geometry.vertices.length; i++)
		{
			var line = new THREE.Geometry();
			line.vertices.push(coreVertices[i]);
			line.vertices.push(frameVertices[i]);
			lines[i] = new THREE.Line(line, lineMaterial);
			scene.add(lines[i]);
		}

		createWindows(cnrt);
		createSlabs(cnrt);

	}

	function createWindows(cnrt) {
		if (cnrt.Window_Wall_Ratio > 0)
		{
			var windHeight = (cnrt.Height * (cnrt.Window_Wall_Ratio/100));

			var windGeom = new THREE.Geometry();
			var windVerts = [];

			windows = [];

			// floor vertices
			windVerts[0] = new THREE.Vector3( -offsetLength * .5, 0, offsetWidth * .5 );
			windVerts[1] = new THREE.Vector3( offsetLength * .5, 0, offsetWidth * .5 );
			windVerts[2] = new THREE.Vector3( offsetLength * .5, 0, -offsetWidth * .5 );
			windVerts[3] = new THREE.Vector3( -offsetLength * .5, 0, -offsetWidth * .5 );

			// ceiling vertices
			windVerts[4] = new THREE.Vector3( -offsetLength * .5, windHeight, offsetWidth * .5 );
			windVerts[5] = new THREE.Vector3( offsetLength * .5, windHeight, offsetWidth * .5 );
			windVerts[6] = new THREE.Vector3( offsetLength * .5, windHeight, -offsetWidth * .5 );
			windVerts[7] = new THREE.Vector3( -offsetLength * .5,windHeight, -offsetWidth * .5 );

			windGeom.vertices = windVerts;

			// left
			windGeom.faces[0] = new THREE.Face3( 7, 4, 0 );
			windGeom.faces[1] = new THREE.Face3( 7, 0, 3 );
			// front
			windGeom.faces[2] = new THREE.Face3( 4, 5, 1 );
			windGeom.faces[3] = new THREE.Face3( 4, 1, 0 );
			// back
			windGeom.faces[4] = new THREE.Face3( 6, 7, 3 );
			windGeom.faces[5] = new THREE.Face3( 6, 3, 2 );
			// right
			windGeom.faces[6] = new THREE.Face3( 5, 6, 2 );
			windGeom.faces[7] = new THREE.Face3( 5, 2, 1 );

			//var wind = new THREE.Mesh( windGeom, boxMaterial );

			for (var i = 0; i < cnrt.FloorCount; i++)
			{
				var wind = new THREE.Mesh( windGeom, boxMaterial );
				wind.position.y += cnrt.Height/4;
				wind.position.y += cnrt.Height * (i)
				scene.add(wind);
			}

		}
	}

	function createSlabs(cnrt) {
		var floorSpacing = cnrt.Height/cnrt.FloorCount;

		if (cnrt.FloorCount > 1)
		{

			for (var i = 0; i < cnrt.FloorCount; i++ )
			{
				if( i != 0)
				{
					var slab = new THREE.PlaneGeometry( offsetLength, offsetWidth, 2 );
					var plane = new THREE.Mesh( slab, slabMaterial );
					plane.rotation.x = 90 * Math.PI / 180;
					plane.position.y +=  cnrt.Height *i;
					scene.add( plane );
				}
			}
		}

		else
		{
			var slab = new THREE.PlaneGeometry( offsetLength, offsetWidth, 2 );
			var plane = new THREE.Mesh( slab, slabMaterial );
			plane.rotation.x = 90 * Math.PI / 180;
			scene.add( plane );
		}
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function render() {

		// updateBuilding();
		renderer.render( scene, camera );
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	window.save = function save(){
		window.open(renderer.domElement.toDataURL('img/png'), 'mywindow');
		return false;
	}
});
