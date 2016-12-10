// put all the main functionalities here!
$(function () {
	var camera, scene, renderer;
	var control;

	// materials
	var boxMaterial;
	var lineMaterial;
	var slabMaterial
	var frameColor = 0xffffff;

	// inner core
	var core;
	var coreHelper = new THREE.BoxHelper(core, frameColor);
	var coreVertices = [];

	// outer frame
	var frame;
	var frameHelper = new THREE.BoxHelper(frame, frameColor);
	var frameVertices = [];

	// constructor for settings
	var Settings = function() {
	    this.Length = 200;
	    this.Width = 200;
	    this.Height = 200;
	    this.Offset = 1.1;
	    this.FloorCount = 3;
	  };

	// gui
	window.controls = new Settings();
	// var gui = new dat.GUI();
	// gui.add(controls, 'Length', 100, 300);
	// gui.add(controls, 'Width', 100, 300);
	// gui.add(controls, 'Height', 100, 300);
	// gui.add(controls, 'Offset', 1, 2);
	// gui.add(controls, 'FloorCount').min(1).max(10).step(1);

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		//camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000 );
		camera.position.y = 50;
		camera.position.z = -200;
		scene = new THREE.Scene();

		// define materials
		boxMaterial = new THREE.MeshBasicMaterial( {
			color: 0xffffff,
			transparent: true,
			opacity: 0
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
		coreVertices[4] = new THREE.Vector3( -controls.Length * .5,	controls.Height,  controls.Width * .5 );
		coreVertices[5] = new THREE.Vector3( controls.Length * .5, 	controls.Height,  controls.Width * .5 );
		coreVertices[6] = new THREE.Vector3( controls.Length * .5, 	controls.Height,  -controls.Width * .5 );
		coreVertices[7] = new THREE.Vector3( -controls.Length * .5,	controls.Height,  -controls.Width * .5 );

		// multplier for building frame offset
		var mult = controls.Offset;
		var offsetLength = controls.Length * mult;
		var offsetWidth = controls.Width * mult;
		var offsetHeight = controls.Height;

		// offset floor vertices
		frameVertices[0] = new THREE.Vector3( -offsetLength * .5,	0, offsetWidth * .5 );
		frameVertices[1] = new THREE.Vector3( offsetLength * .5, 	0, offsetWidth * .5 );
		frameVertices[2] = new THREE.Vector3( offsetLength * .5, 	0, -offsetWidth * .5 );
		frameVertices[3] = new THREE.Vector3( -offsetLength * .5,	0, -offsetWidth * .5 );

		// offset ceiling vertices
		frameVertices[4] = new THREE.Vector3( -offsetLength * .5,	offsetHeight,  offsetWidth * .5 );
		frameVertices[5] = new THREE.Vector3( offsetLength * .5, 	offsetHeight,  offsetWidth * .5 );
		frameVertices[6] = new THREE.Vector3( offsetLength * .5, 	offsetHeight,  -offsetWidth * .5 );
		frameVertices[7] = new THREE.Vector3( -offsetLength * .5,	offsetHeight,  -offsetWidth * .5 );

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

		//clear scene
		for (var i = 0; i < scene.children.length; i++)
		{
			var obj = scene.children[ i ];
			scene.remove(obj)
		}

		core = new THREE.Mesh( coreGeom, boxMaterial );
		frame = new THREE.Mesh ( frameGeom, boxMaterial);

		// create geometry frames
		scene.add(coreHelper);
		scene.add(frameHelper);
		coreHelper.update(core);
		frameHelper.update(frame);

		// add geometry to scene
		scene.add(core);
		scene.add(frame);

		// draw lines between corner points
		for (var i = 0; i < frame.geometry.vertices.length; i++)
		{
			var lines = new THREE.Geometry();
			lines.vertices.push(coreVertices[i]);
			lines.vertices.push(frameVertices[i]);
			var line = new THREE.Line(lines, lineMaterial);
			scene.add(line);

		}

		createSlabs();
	}

	window.updateBuilding = function updateBuilding()
	{
		// floor vertices
		coreVertices[0].set(-controls.Length * .5,	0, controls.Width * .5 );
		coreVertices[1].set(controls.Length * .5, 	0, controls.Width * .5 );
		coreVertices[2].set(controls.Length * .5, 	0, -controls.Width * .5 );
		coreVertices[3].set(-controls.Length * .5,	0, -controls.Width * .5 );

		// ceiling vertices
		coreVertices[4].set(-controls.Length * .5,	controls.Height,  controls.Width * .5 );
		coreVertices[5].set(controls.Length * .5, 	controls.Height,  controls.Width * .5 );
		coreVertices[6].set(controls.Length * .5, 	controls.Height,  -controls.Width * .5 );
		coreVertices[7].set(-controls.Length * .5,	controls.Height,  -controls.Width * .5 );

		// multplier for building frame offset
		var mult = controls.Offset;
		var offsetLength = controls.Length * mult;
		var offsetWidth = controls.Width * mult;
		var offsetHeight = controls.Height;

		// offset floor vertices
		frameVertices[0].set(-offsetLength * .5,	0, offsetWidth * .5 );
		frameVertices[1].set(offsetLength * .5, 	0, offsetWidth * .5 );
		frameVertices[2].set(offsetLength * .5, 	0, -offsetWidth * .5 );
		frameVertices[3].set(-offsetLength * .5,	0, -offsetWidth * .5 );

		// offset ceiling vertices
		frameVertices[4].set(-offsetLength * .5,	offsetHeight,  offsetWidth * .5 );
		frameVertices[5].set(offsetLength * .5, 	offsetHeight,  offsetWidth * .5 );
		frameVertices[6].set(offsetLength * .5, 	offsetHeight,  -offsetWidth * .5 );
		frameVertices[7].set(-offsetLength * .5,	offsetHeight,  -offsetWidth * .5 );

		coreGeom.vertices = coreVertices;
		frameGeom.vertices = frameVertices;

		//clear scene
		for (var i = 0; i < scene.children.length; i++)
		{
			var obj = scene.children[ i ];
			scene.remove(obj)
		}

		// add geometry to scene
		scene.add(core);
		scene.add(frame);

		// create geometry frames
		scene.add(coreHelper);
		scene.add(frameHelper);
		coreHelper.update(core);
		frameHelper.update(frame);

		// draw lines between corner points
		for (var i = 0; i < frame.geometry.vertices.length; i++)
		{
			var lines = new THREE.Geometry();
			lines.vertices.push(coreVertices[i]);
			lines.vertices.push(frameVertices[i]);
			var line = new THREE.Line(lines, lineMaterial);
			scene.add(line);
		}

		createSlabs();

	}

	function createSlabs() {
		if (controls.FloorCount > 1)
		{
			var floorSpacing = controls.Height/controls.FloorCount;

			for (var i = 0; i < controls.FloorCount; i++ )
			{
				if( i != 0)
				{
					var slab = new THREE.PlaneGeometry( controls.Length, controls.Width, 2 );
					var plane = new THREE.Mesh( slab, slabMaterial );
					plane.rotation.x = 90 * Math.PI / 180;
					plane.position.y += floorSpacing*i;
					scene.add( plane );
				}

				else
				{
					var slab = new THREE.PlaneGeometry( controls.Length, controls.Width, 2 );
					var plane = new THREE.Mesh( slab, slabMaterial );
					plane.rotation.x = 90 * Math.PI / 180;
					scene.add( plane );
				}
			}
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

});
