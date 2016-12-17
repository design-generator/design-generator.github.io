// put all the main functionalities here!
$(function () {
	var camera, scene, renderer;
	var control;
	var container;
	var building;

	var floors = [];
	var helpers = [];
	var windows = [];

	class Building {
		constructor(area, aspectRatio, height, floorCount, windowRatio)
		{
			this.length = Math.sqrt(area)/aspectRatio;
			this.width = area/this.length;
			this.height = height;
			this.floorCount = floorCount;
			this.windowRatio = windowRatio;
		}

		createFloor()
		{
			// Floor Materials
			var material = new THREE.MeshBasicMaterial( { color: 0xd3d3d3, side: THREE.DoubleSide } );

			var plane = new THREE.PlaneGeometry( this.length, this.width, 2 );

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

		createHelper(inset)
		{

			var material = new THREE.MeshBasicMaterial( { color: 0xff0000, transparent: false, opacity: 0.5 } );
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

		createWindows(percent)
		{
			var materials = [
			    //Invisible
			    new THREE.MeshBasicMaterial( { transparent: true, opacity: 0.0 } ),
			    //Blue
			    new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } ),
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

			// Floor Materials
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

	// materials

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.y = 10;
		camera.position.x = 50;
		scene = new THREE.Scene();
		scene.background = new THREE.Color( 0xffffff );

		building = new Building(controls.Area, controls.Aspect_Ratio, controls.Height, controls.FloorCount);
        floors = building.createFloor();
        helpers = building.createHelper(controls.Offset);
        windows = building.createWindows(controls.Window_Wall_Ratio);
        
        addObjects();

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

	window.updateBuilding = function updateBuilding(cnrt)
	{

        building.length = Math.sqrt(cnrt.Area)/(cnrt.Aspect_Ratio);
	    building.width = cnrt.Area/building.length;
		building.height = cnrt.Height;
		building.floorCount = cnrt.FloorCount;
		building.windowRatio = cnrt.Window_Wall_Ratio;

        removeObjects();

        floors = building.createFloor();
        helpers = building.createHelper(cnrt.Offset);
        windows = building.createWindows(cnrt.Window_Wall_Ratio);

        addObjects();

	}

	function removeObjects()
	{
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

	function addObjects()
	{
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
