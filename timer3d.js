(function () {
    'use strict';

    var container;
    var camera, scene, renderer, particles, geometry, material, i, h;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    var particleNum = 30000;
    var particleSize = 2;

    var fontHeight = 200;
    var fontWidth = 100;
    var fontBold = 10;
    var fontDepth = 10;
    var margin = 30;
    var createNumericRetryLimit = 1000;

    var numerics;

    var timerPositions;
    var beforeTimerPositions;

    var timer = 12 * 3600;
    var timerStr = '12:00:00';
    var beforeTimerStr = '12:00:00';

    initTimerPositions();
    initNumerics();
    init();
    animate();
    timerStart();

    function init() {
        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 2, 2000);
        camera.position.z = 1000;

        scene = new THREE.Scene();

        //

        geometry = new THREE.Geometry();

        for (i = 0; i < particleNum; i++) {
            var p = randomVertex(i);
            var vertex = new THREE.Vector3(p.x, p.y, p.z);
            geometry.vertices.push(vertex);
        }

        material = new THREE.PointCloudMaterial({
            size: particleSize,
            sizeAttenuation: false,
            alphaTest: 0.5,
            transparent: true
        });
        material.color.setHSL(1.0, 0.3, 0.7);

        particles = new THREE.PointCloud(geometry, material);
        scene.add(particles);

        //

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);
    }

    function initTimerPositions() {
        var i,
            ps = [0, 0, 0, 1, 1, 1, 2, 3, 3, 3, 4, 4, 4, 5, 6, 6, 6, 7, 7, 7];

        timerPositions = [];
        beforeTimerPositions = [];

        for (i = 0; i < particleNum; i++) {
            timerPositions[i] = ps[i % ps.length];
            beforeTimerPositions[i] = ps[i % ps.length];
        }
    }

    function initNumerics() {
        var offsetX = fontWidth * -4 + margin * -3 + fontBold * -1.5,
            offsetY = fontHeight / -2,
            i, numeric;

        numerics = [];

        for (i = 0; i < 8; i++) {
            numeric = new Numeric2D(fontWidth, fontHeight, fontBold, offsetX, offsetY);
            numerics.push(numeric);

            offsetX += fontWidth + margin;
        }
    }

    function randomVertex(vertexIndex) {
        var x, y, z,
            idx = timerPositions[vertexIndex],
            width = fontWidth + fontBold,
            height = fontHeight + fontBold,
            retryLimit = createNumericRetryLimit,
            offsetX;

        do {
            offsetX = fontWidth * -4 + margin * -3 + fontBold * 1.5 + fontWidth * idx + margin * idx + fontBold * 2;

            x = width * Math.random() - width / 2 + offsetX;
            y = height * Math.random() - height / 2;
            z = fontDepth * Math.random() - fontDepth / 2;
        } while (!innerNumeric(x, y, idx) && --retryLimit);

        if (!retryLimit) {
            console.error('cannot create numeric.');
        }

        return {x: x, y: y, z: z};
    }

    function innerNumeric(x, y, idx) {
        var c = timerStr[idx];

        return c === ':' ?
            numerics[idx].isInnerPointColon(x, y) :
            numerics[idx].isInnerPoint(x, y, Number(c));
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function updateVertex() {
        var p, h, m, s;

        if (--timer < 0) { return; }


        h = paddingTwoZero(Math.floor(timer / 3600));
        m = paddingTwoZero(Math.floor((timer % 3600) / 60));
        s = paddingTwoZero(Math.floor(timer % 60));
        beforeTimerStr = timerStr;
        timerStr = h + ':' + m + ':' + s;

        TWEEN.removeAll();
        particles.geometry.vertices.forEach(function (obj, i) {
            if (needUpdate(i)) {
                p = randomVertex(i);

                new TWEEN.Tween(obj)
                    .to(p, 500 + Math.random() * 300)
                    .easing(TWEEN.Easing.Back.Out)
                    .start();
            }
        });
    }

    function needUpdate(vertexIdx) {
        var idx = timerPositions[vertexIdx];

        return timerStr[idx] !== beforeTimerStr[idx] ||
            timerPositions[vertexIdx] !== beforeTimerPositions[vertexIdx] ||
            timer === 0;
    }

    function paddingTwoZero(x) {
        return ('00' + x).slice(-2);
    }

    //

    function timerStart() {
        updateVertex();

        setInterval(function () {
            updateVertex();
        }, 1000);
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        render();
    }

    function render() {
        var time = Date.now() * 0.00005;

        particles.geometry.verticesNeedUpdate = true;

        h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
        material.color.setHSL(h, 0.5, 0.5);

        renderer.render(scene, camera);
    }

}());