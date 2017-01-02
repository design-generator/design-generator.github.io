// THREE.JS MODEL DISPLAY
$(function () {
	var camera, scene, renderer;
	var control;
	var container;
	var building;

	var floors = [];
	var helpers = [];
	var windows = [];

	function NewBuilding (area, aspectRatio, height, floorCount, windowRatio) {
		this.length = Math.sqrt(area)/aspectRatio;
		this.width = area/this.length;
		this.height = height;
		this.floorCount = floorCount;
		this.windowRatio = windowRatio;

		// TODO take a list of vertex colors as a param
		this.createFloor = function() {
			
			// Floor Materials
			var material = new THREE.MeshPhongMaterial( 
			{
				vertexColors: THREE.VertexColors,
				shininess: 100,
				specular: 0x111111,
				side: THREE.DoubleSide 
			});

			var plane = new THREE.PlaneGeometry( this.length, this.width, 10, 10 );

			// START EXAMPLE vertex coloring
			var faceIndices = [ 'a', 'b', 'c' ];

			var originalColors = [];

			for ( var i = 0, j = plane.faces.length; i < j; i ++ ) 
			{
				// OLD
				//plane.faces[i].vertexColors = [new THREE.Color(Math.random() * 0xffffff), new THREE.Color(Math.random() * 0xffffff), new THREE.Color(Math.random() * 0xffffff)];
				
				// NEW
				// EXAMPLE OF VERTEX COLORING BASE ON DISTANCE FROM CENTER OF ROOM
				var face = plane.faces[ i ];
				var origin = new THREE.Vector3(0, 0, 0);
				// assign color to each vertex of current face
				for( var k = 0; k < 3; k++ ) 
				{
					var vertexIndex = face[ faceIndices[ k ] ];
					// store coordinates of vertex
					var point = plane.vertices[ vertexIndex ];
					// compare distance to origin
					originalColors.push(-(point.distanceTo(origin)));
				}
			}

			var finalColors = remap(originalColors);
			var count = 0;

			for ( var i = 0, j = plane.faces.length; i < j; i ++ ) 
			{
				var face = plane.faces[ i ];
				for( var k = 0; k < 3; k++ ) 
				{
					var color = new THREE.Color( "rgb( 255, " + String(finalColors[count]) + ", 0)" );
					face.vertexColors[ k ] = color;
					count += 1;
				}
			}
			// END EXAMPLE

			var floor = new THREE.Mesh( plane, material );
			floor.rotation.x = 90 * Math.PI / 180;
			var floorsContainer = [];
			floorsContainer.push(floor);

    		for(var i = 1; i < this.floorCount ; i++)
    		{
    			var newFloor = floor.clone();
    			newFloor.position.y += this.height * i;
    			floorsContainer.push(newFloor);
    		}
    		return floorsContainer;
		}

		// Draw building frame
		this.createHelper = function(inset) {
			var material = new THREE.MeshBasicMaterial( { color: 0x000000, transparent: true, opacity: 0.1 } );
			var box = new THREE.BoxGeometry( this.length, this.height * this.floorCount, this.width);
			var boxOffset = new THREE.BoxGeometry( this.length-inset, this.height * this.floorCount, this.width-inset);
			var meshBox = new THREE.Mesh(box, material);
			var offsetMeshBox = new THREE.Mesh(boxOffset, material);
			meshBox.position.y= offsetMeshBox.position.y += this.height * this.floorCount / 2;
			var boxHelper = new THREE.BoxHelper(meshBox, 0x000000);
			var offsetBoxHelper = new THREE.BoxHelper(offsetMeshBox, 0x000000);
			var helpersContainer = [];
			helpersContainer.push(boxHelper);
			helpersContainer.push(offsetBoxHelper);

			var lines = [];

			var lineMaterial = new THREE.LineBasicMaterial(
			{
            	color: 0x000000
	        });

			// Draw lines between corner points
			for (var i = 0; i < offsetMeshBox.geometry.vertices.length; i++)
			{
				var line = new THREE.Geometry();
				line.vertices.push(meshBox.geometry.vertices[i]);
				line.vertices.push(offsetMeshBox.geometry.vertices[i]);
				lines[i] = new THREE.Line(line, lineMaterial);
				lines[i].position.y += this.height * this.floorCount / 2;
				helpersContainer.push(lines[i]);
			}

			return helpersContainer;
		}

		// Create windows based on WWR
		this.createWindows = function(percent) {
			var materials = [
			    // Transparent Material
			    new THREE.MeshPhongMaterial( { transparent: true, opacity: 0.0 } ),
			    // Window Material
			    new THREE.MeshStandardMaterial( {
					map: null,
					bumpScale: - 0.05,
					color: 0x008cff,
					metalness: 0.5,
					roughness: 0.9,
					shading: THREE.SmoothShading,
					side: THREE.DoubleSide
				} )
			    ];

			var glazing = new THREE.BoxGeometry( this.length, this.height * percent/100, this.width);

			for( var i = 0; i < glazing.faces.length; i++ ) 
			   {
    				if (i < 4 || i > 7)
    				{
    					glazing.faces[ i ].materialIndex = 1;
    				}

    				else
    				{
    					glazing.faces[ i ].materialIndex = 0;
    				}
    			}

			var glazingMesh = new THREE.Mesh(glazing, new THREE.MultiMaterial( materials ));
			glazingMesh.position.y += this.height/2;
			
			var windowsContainer = [];
			windowsContainer.push(glazingMesh);;

			for(var i = 1; i < this.floorCount ; i++)
    		{
    			var newGlazingMesh = glazingMesh.clone();
    			newGlazingMesh.position.y += this.height * i;
    			windowsContainer.push(newGlazingMesh);
    		}

    		return windowsContainer;
		}
	}

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.y = 10;
		camera.position.x = 50;
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xffffff );

		// TODO Sun Lighting?
		// add light
		var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    	dirLight.position.set(100, 100, 50);
    	scene.add(dirLight);

		building = new NewBuilding(controls.Area, controls.Aspect_Ratio, controls.Height, controls.FloorCount);
        floors = building.createFloor();
        helpers = building.createHelper(controls.Offset);
        windows = building.createWindows(controls.Window_Wall_Ratio);
        
        addObjects();

      	// define renderer
      	renderer = new THREE.WebGLRenderer( { antialias: false, preserveDrawingBuffer: true } );
		renderer.setClearColor( new THREE.Color( 0xffffff ) );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		container = document.getElementById("viewer3d")
		container.appendChild( renderer.domElement );

		THREEx.Screenshot.bindKey(renderer);
		window.addEventListener( 'resize', onWindowResize, false );

		// add mouse controls
		control = new THREE.OrbitControls( camera, container );
		control.center =  new THREE.Vector3(0,0,0);
	}

	// Retrieve slider values and apply changes
	window.updateBuilding = function updateBuilding(sliderValue) {
        building.length = Math.sqrt(sliderValue.Area)/(sliderValue.Aspect_Ratio);
	    building.width = sliderValue.Area/building.length;
		building.height = sliderValue.Height;
		building.floorCount = sliderValue.FloorCount;
		building.windowRatio = sliderValue.Window_Wall_Ratio;

        removeObjects();

        floors = building.createFloor();
        helpers = building.createHelper(sliderValue.Offset);
        windows = building.createWindows(sliderValue.Window_Wall_Ratio);

        addObjects();
	}

	// Remove all building components from scene
	function removeObjects() {
		for(var i = 0; i < windows.length; i ++)
        {
        	scene.remove(floors[i]);
        	scene.remove(windows[i]);
        }

        for(var i = 0; i < helpers.length; i ++)
        {
        	scene.remove(helpers[i]);
        }
	}

	// Add all building components to scene
	function addObjects() {
		for(var i = 0; i < windows.length; i ++)
        {
        	scene.add(floors[i]);
        	scene.add(windows[i]);
        }

        for(var i = 0; i < helpers.length; i ++)
        {
        	scene.add(helpers[i]);
        }
	}

	// Remap a list of values between 0 and 255
	function remap(colorList) {
		var max = Math.max(...colorList);
		var min = Math.min(...colorList);
		var mappedColors = [];

		for(var i = 0; i < colorList.length; i++)
		{
			var newColor = 0 + (255 - 0) * (colorList[i] - min) / (max - min);
			newColor = Math.floor(newColor);
			mappedColors.push(newColor);
		}
    		
    		return mappedColors
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
		control.update();
	}

	function render() {

		renderer.render( scene, camera );
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

});
