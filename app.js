// Namespace
var APP = {};

// Excel table header component
APP.TableHeader = function() {
    this.render = function(target, columns) {
        var th;
        var tr = document.createElement("tr");
        for (var j = 0; j < columns; j++) {
            th = document.createElement("th");
            th.innerHTML = String.fromCharCode("A".charCodeAt(0) + j - 1);
            tr.appendChild(th);
        }
        target.appendChild(tr);
    };
};

// Excel table component
APP.Table = function() {
    this.render = function(target, rows, columns) {
        var tr, td, input;

        var header = new APP.TableHeader();
        header.render(target, columns);

        for (var i = 0; i < rows; i++) {
            tr = document.createElement("tr");
            for (var j = 0; j < columns; j++) {
                td = document.createElement("td");
                input = document.createElement("input");
                td.appendChild(input);
                tr.appendChild(td);
            }
            target.appendChild(tr);
        }
    };
};

APP.init = function() {
    APP.contextMenu = document.getElementById('contextMenu');
    APP.bufferText = '';
    APP.selectedInput = null;
};

APP.addEvent = function(elem, event, fn, isCapture) {
    if (typeof isCapture === "undefined") {
        isCapture = false;
    }
    if (elem.addEventListener) {
        elem.addEventListener(event, fn, isCapture);
    } else {
        elem.attachEvent("on" + event, function() {
            // set the this pointer same as addEventListener when fn is called
            return (fn.call(elem, window.event));
        });
    }
};

APP.removeEvent = function(element, event, isCapture) {
    if (elem.addEventListener) {
        elem.removeEventListener(event, fn, isCapture);
    } else {
        elem.detachEvent("on" + event, fn);
    }
};

APP.drawExcelSheet = function(rows, columns) {
    var table = new APP.Table();
    table.render(document.getElementById("excelTable"), rows, columns);
}

APP.onDocumentLoad = function(rows, columns) {

    APP.drawExcelSheet(rows, columns);

    var inputs = [].slice.call(document.querySelectorAll("input"));

    APP.addEvent(document, "click", function(e) {
        APP.contextMenu.style.display = 'none';
    });

    APP.addEvent(document, "contextmenu", function(e) {
        e.preventDefault();
        // check input
        if (e.target && e.target.type === 'text') {
            APP.contextMenu.style.top = (e.clientY) + "px";
            APP.contextMenu.style.left = (e.clientX - 30) + "px";
            APP.contextMenu.style.display = 'block';
        }
    });

    APP.addEvent(APP.contextMenu, "click", function(e) {
        if (e.target.textContent == "cut") {
            APP.bufferText = APP.selectedInput.value;
            APP.selectedInput.value = '';
            localStorage[APP.selectedInput.id] = '';
        } else if (e.target.textContent == "copy") {
            APP.bufferText = APP.selectedInput.value;
        } else if (e.target.textContent == "paste") {
            localStorage[APP.selectedInput.id] = APP.selectedInput.value = APP.bufferText;
        }
    });

    inputs.forEach(function(elem) {
        APP.addEvent(elem, "focus", function(e) {
            APP.selectedInput = e.target;
        });

        APP.addEvent(elem, "blur", function(e) {});
    });

};

APP.start = function(rows, columns) {
    APP.init();
    APP.addEvent(window, "load", function(e) {
        APP.onDocumentLoad(rows, columns);
    });
};

APP.start(10, 6);