// Namespace
var APP = {};

APP.TABKEY = 9;

// IE helper for trim
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

APP.addEvent = function(obj, type, fn, isCapture) {
    // if not specified use false by default
    if (typeof isCapture === "undefined") {
        isCapture = false;
    }
    // Modern browser code
    if (obj.addEventListener) {
        obj.addEventListener(type, fn, isCapture);
    } else {
        obj['e' + type + fn] = fn;
        obj[type + fn] = function() {
            // IE specific code
            // IE8+ supports textContent and innerText
            // for IE7 use value of the input
            var e = window.event;
            e.target = e.srcElement;
            if (e.target) {
                e.target.textContent ? e.target.textContent : (e.target.value ? e.target.textContent = e.target.value : e.target.textContent = e.target.innerText);
            }
            obj['e' + type + fn](e);
        }
        obj.attachEvent('on' + type, obj[type + fn]);
    }
};

APP.removeEvent = function(obj, type, fn, isCapture) {
    if (obj.addEventListener) {
        obj.removeEventListener(type, fn, isCapture);
    } else {
        obj.detachEvent('on' + type, obj[type + fn]);
        obj[type + fn] = null;
    }
};

// Excel table header component
APP.TableHeader = function() {
    var th, tr, prevSelectedTr;

    this.addEvents = function() {
        APP.addEvent(tr, "click", function(e) {
            var sortOrder;
            // first time no class is added
            if (e.target.className == '') {
                sortOrder = 'asc';
                e.target.className = 'asc glyphicon glyphicon-arrow-up';
            }
            // already sorted by ascending order
            else if (e.target.className.indexOf('asc') != -1) {
                sortOrder = 'desc';
                e.target.className = 'desc glyphicon glyphicon-arrow-down';
            }
            // already sorted by descending order
            else if (e.target.className.indexOf('desc') != -1) {
                sortOrder = 'asc';
                e.target.className = 'asc glyphicon glyphicon-arrow-up';
            }
            if (prevSelectedTr && prevSelectedTr != e.target) {
                prevSelectedTr.className = '';
            }
            prevSelectedTr = e.target;
            APP.sortColumn(e.target.id, sortOrder);
        });
    };

    this.render = function(target, columns) {
        tr = document.createElement("tr");
        for (var j = 0; j < columns; j++) {
            th = document.createElement("th");
            th.id = j;
            th.innerHTML = String.fromCharCode("A".charCodeAt(0) + j);
            tr.appendChild(th);
        }

        this.addEvents();
        target.appendChild(tr);
    };
};

// Excel table component
APP.Table = function() {
    var table = this;

    this.handleContextMenu = function() {
        APP.addEvent(APP.contextMenu, "click", function(e) {
            e.target.textContent = e.target.textContent.trim();
            var indices;
            if (APP.selectedInput.parentElement.id) {
                indices = APP.selectedInput.parentElement.id.split(".")
            }
            if (e.target.textContent == "cut") {
                APP.bufferText = APP.selectedInput.value;
                APP.selectedInput.value = '';
                APP.data[indices[0]][indices[1]] = '';
            } else if (e.target.textContent == "copy") {
                APP.bufferText = APP.selectedInput.value;
            } else if (e.target.textContent == "paste") {
                APP.data[indices[0]][indices[1]] = APP.selectedInput.value = APP.bufferText;
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

    // context menu selection
    this.handleContextMenu();

    // will get the data from this
    APP.data = [];

    this.setInitialData = function(rows, columns) {
        for (var i = 0; i < rows; i++) {
            APP.data[i] = [];
            for (var j = 0; j < columns; j++) {
                APP.data[i].push('');
            }
        }
    };

    var focusHandler = function(e) {
        APP.selectedInput = e.target;
    };

    var keydownHandler = function(e) {
        if (e.keyCode == APP.TABKEY) {
            // when tabbed out close the context menu
            APP.contextMenu.style.display = 'none';
        };
    };

    var blurHandler = function(e) {
        var indices = APP.selectedInput.parentElement.id.split(".")
            // store the entered value in to the data element
        APP.data[indices[0]][indices[1]] = APP.selectedInput.value;
    };

    this.addInputEvents = function() {
        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            APP.addEvent(inputs[i], "focus", focusHandler);
            APP.addEvent(inputs[i], "keydown", keydownHandler);
            APP.addEvent(inputs[i], "blur", blurHandler);
        }
    };

    this.removeInputEvents = function() {
        var inputs = document.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            APP.removeEvent(inputs[i], "focus", focusHandler);
            APP.removeEvent(inputs[i], "keydown", keydownHandler);
            APP.removeEvent(inputs[i], "blur", blurHandler);
        }
    };

    // render based on  APP.data
    this.render = function(target, rows, columns) {
        if (typeof rows != "undefined")
            this.rows = rows;

        if (typeof columns != "undefined")
            this.columns = columns;

        if (typeof target != "undefined")
            this.target = target;

        // clear children
        for (var i = this.target.rows.length; i > 1; i--) {
            this.target.deleteRow(i - 1);
        }

        var tr, td, input;

        var header = new APP.TableHeader();
        header.render(this.target, columns);

        for (var i = 0; i < this.rows; i++) {
            tr = document.createElement("tr");
            for (var j = 0; j < this.columns; j++) {
                td = document.createElement("td");
                td.id = i + "." + j;
                input = document.createElement("input");
                input.value = APP.data[i][j];
                td.appendChild(input);
                tr.appendChild(td);
            }
            this.target.appendChild(tr);
        }

        // handle input events
        this.addInputEvents();
    };

    APP.sortColumn = function(colIndex, sortOrder) {
        APP.data.sort(sortFunction);

        function sortFunction(a, b) {
            if (a[colIndex] === b[colIndex]) {
                return 0;
            }
            if (sortOrder === 'asc') {
                return (a[colIndex] < b[colIndex]) ? -1 : 1;
            } else {
                return (a[colIndex] > b[colIndex]) ? -1 : 1;
            }
        }

        // remove the events
        table.removeInputEvents();
        // render the table
        table.render();
    };
};

APP.init = function() {
    APP.contextMenu = document.getElementById('contextMenu');
    APP.bufferText = '';
    APP.selectedInput = null;
};



APP.drawExcelSheet = function(rows, columns) {
    var table = new APP.Table();
    table.setInitialData(rows, columns);
    table.render(document.getElementById("excelTable"), rows, columns);
}

APP.onDocumentLoad = function(rows, columns) {

    APP.drawExcelSheet(rows, columns);

    APP.addEvent(document, "click", function(e) {
        // when clicked any where close the context menu
        APP.contextMenu.style.display = 'none';
    });

    APP.addEvent(document, "contextmenu", function(e) {
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
        // open context menu only when right clicked on the input
        if (e.target && e.target.type === 'text') {
            APP.contextMenu.style.top = (e.clientY) + "px";
            APP.contextMenu.style.left = (e.clientX - 30) + "px";
            APP.contextMenu.style.display = 'block';
        }
    });



};

APP.start = function(rows, columns) {
    APP.init();
    APP.addEvent(window, "load", function(e) {
        APP.onDocumentLoad(rows, columns);
    });
};

APP.start(4, 2);