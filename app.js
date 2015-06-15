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

    this.handleContextMenu = function() {
        var table = this;
        APP.addEvent(APP.contextMenu, "click", function(e) {
            if (e.target.textContent == "cut") {
                APP.bufferText = APP.selectedInput.value;
                APP.selectedInput.value = '';
            } else if (e.target.textContent == "copy") {
                APP.bufferText = APP.selectedInput.value;
            } else if (e.target.textContent == "paste") {
                APP.selectedInput.value = APP.bufferText;
            } else if (e.target.textContent == "Add Row") {
                var tr = document.createElement("tr"),
                    td, input;
                for (var i = 0; i < table.columns; i++) {
                    td = document.createElement("td");
                    input = document.createElement("input");
                    td.appendChild(input);
                    tr.appendChild(td);
                }
                APP.selectedInput.parentElement.parentElement.parentElement.insertBefore(
                    tr, APP.selectedInput.parentElement.parentElement
                );
            } else if (e.target.textContent == "Remove Row") {
                APP.selectedInput.parentElement.parentElement.parentElement.removeChild(APP.selectedInput.parentElement.parentElement);
            }
        });
    };

    this.render = function(target, rows, columns) {
        this.rows = rows;
        this.columns = columns;

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

        // context menu selection
        this.handleContextMenu();
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
        elem.attachEvent("on" + event, function(e) {
            e = window.event;
            e.target = e.srcElement;
            e.target.textContent ? e.target.textContent : (e.target.textContent = e.target.innerText);
            return (fn.call(elem, e));
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

    var inputs = document.getElementsByTagName("input");

    APP.addEvent(document, "click", function(e) {
        APP.contextMenu.style.display = 'none';
    });

    APP.addEvent(document, "contextmenu", function(e) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        // check input
        if (e.target && e.target.type === 'text') {
            APP.contextMenu.style.top = (e.clientY) + "px";
            APP.contextMenu.style.left = (e.clientX - 30) + "px";
            APP.contextMenu.style.display = 'block';
        }
    });


    for (var i = 0; i < inputs.length; i++) {
        var elem = inputs[i];

        APP.addEvent(elem, "focus", function(e) {
            APP.selectedInput = e.target;
        });

        APP.addEvent(elem, "blur", function(e) {});
    };

};

APP.start = function(rows, columns) {
    APP.init();
    APP.addEvent(window, "load", function(e) {
        APP.onDocumentLoad(rows, columns);
    });
};

APP.start(10, 6);