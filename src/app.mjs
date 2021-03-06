import {upgradeElement} from './dist/main.mjs';
window.workerpath = "https://multithreading-demo.bobobobobobo.net/fractalworker.js";

// https://github.com/rafgraph/fractal
// this code may be freely distributed under the GNU GPL v3 copyleft licence

(function () {
    'use strict';

    const animationWindow = new Animation(document.querySelector('#canvas-window').getContext('2d'));
    animationWindow.start();

    function calc(canv, width, height, numthread, mode) {
        var frac = new window.mandelbrotFractal.Fractal(canv);
        frac.updateFractalSize(width, height);
        frac.updateNumThreads(numthread);
        frac.draw(mode);
        frac.canvas.style.width = "150px"
        frac.canvas.style.height = "150px"
    }

    window.benchmark_start = function (pending){
        window.benchmarkstartstartTime = performance.now();
        window.benchmarkpending = pending;
    }
    window.benchmark_end = function (){
        window.benchmarkpending = window.benchmarkpending - 1;
        if (window.benchmarkpending === 0){
            var endTime = performance.now();
            document.getElementById("time_completion").textContent = `Took ${endTime - window.benchmarkstartstartTime} milliseconds`
        }
    }

    document.getElementById("refreshbtn").addEventListener("click", function () {
        // cleanup
        var workerdomele = document.getElementById("upgrade-fractal");
        var graphics = document.getElementById("fractal-graphics");
        graphics.innerHTML = "";

        // get option
        var ele
        ele = document.getElementById("numthreads");
        var numthreads = ele.options[ele.selectedIndex].value;
        ele = document.getElementById("numfractals");
        var numele = ele.options[ele.selectedIndex].value;
        ele = document.getElementById("impl");
        var impl = ele.options[ele.selectedIndex].value;
        ele = document.getElementById("presentation");
        var presentation = ele.options[ele.selectedIndex].value;
        ele = document.getElementById("fracwidth");
        var fracwidth = ele.options[ele.selectedIndex].value;
        var fracheight = fracwidth * 24/29

        graphics.textContent = JSON.stringify({
            numthreads: numthreads,
            numele: numele,
            impl: impl,
            presentation: presentation,
            fracwidth: fracwidth,
            fracheight: fracheight,
        })
        graphics.appendChild(document.createElement("br"))

        var arr = [];
        var i;
        var canv;

        switch (presentation){
            case "single_fractal":
                canv = document.createElement('canvas');
                graphics.appendChild(canv);
                arr.push(canv);
                break;
            case "fractal_list":
                for (i = 0; i < numele; i++) {
                    canv = document.createElement('canvas');
                    graphics.appendChild(canv);
                    arr.push(canv);
                }
                break
            case "fractal_nested":
                var t = graphics
                for (i = 0; i < numele; i++) {
                    canv = document.createElement('canvas');
                    let div = document.createElement('div');
                    div.appendChild(canv);
                    t.appendChild(div);
                    t = div
                    arr.push(canv);
                }
                break
        }

        switch (impl){
            case "naive_st":
                window.benchmark_start(numele);
                for (i = 0; i < arr.length; i++) {
                    calc(arr[i], fracwidth, fracheight, -1, "naive_st");
                }
                break;
            case "naive_ww":
                window.benchmark_start(numele * numthreads);
                for (i = 0; i < arr.length; i++) {
                    calc(arr[i], fracwidth, fracheight, numthreads, "naive_ww");
                }
                break;
            case "ww_wasm":
                window.benchmark_start(numele);
                for (i = 0; i < arr.length; i++) {
                    calc(arr[i], fracwidth, fracheight, numthreads, "ww_wasm");
                }
                break;
            case "ww_offscreen":
                window.benchmark_start(numele);
                for (i = 0; i < arr.length; i++) {
                    calc(arr[i], fracwidth, fracheight, numthreads, "ww_offscreen");
                }
                break;
            case "workerdom":
                upgradeElement(workerdomele, './dist/worker/worker.mjs');
                break;
            case "workerdom_ww":
                upgradeElement(workerdomele, './dist/worker/worker.mjs');
                break;
            case "workerdom_ww_kx1":
                var s = ""
                for(i=0;i<numele;i++){
                    s += `<div src="workerdomworkerfixed.js" id="upgrade-fractal-fixed-${i}"><div id="fractal-fixed"></div></div>`
                }
                document.getElementById("fractal-graphics").innerHTML = s;
                for(i=0;i<numele;i++){
                    let e = document.getElementById("upgrade-fractal-fixed-" + i.toString());
                    e.childNodes[0].textContent = JSON.stringify({
                        numthreads: numthreads,
                        numele: numele,
                        impl: impl,
                        presentation: presentation,
                        fracwidth: fracwidth,
                        fracheight: fracheight,
                    });
                    e.childNodes[0].appendChild(document.createElement("br"));
                    upgradeElement(e, './dist/worker/worker.mjs');
                }
                break;
        }


    });

})();

