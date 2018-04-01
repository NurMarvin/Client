const ipcRenderer = require('electron').ipcRenderer

window.prompt = function(title, val){
    return ipcRenderer.sendSync('prompt', {title, val})
}

//This function is a constructor that details what CreateElement does
function CreateElement(options) {
    //type : Element type to create
    //class : Class name of element
    //text : Inner text
    //html : Set inner html
    //appendTo : Append to element
    //elements : Inner elements to append to this element
    var element = null;

    if (options.hasOwnProperty('type')) {
        element = document.createElement(options['type']);
        if (options.hasOwnProperty('class')) element.className = options['class'];
        if (options.hasOwnProperty('inputType')) {
            element.type = options['inputType'];
            if (options.hasOwnProperty('text')) element.text = options['text'];
        } else {
            if (options['type'] == 'input') {
                if (options.hasOwnProperty('text')) element.value = options['text'];
            } else {
                if (options.hasOwnProperty('text')) element.innerText = options['text'];
            }
        }
        if (options.hasOwnProperty('html')) element.innerHTML = options['html'];
        if (options.hasOwnProperty('opacity')) element.style.opacity = options['opacity'];
        if (options.hasOwnProperty('appendTo')) options['appendTo'].appendChild(element);
        if (options.hasOwnProperty('src')) element.src = options['src'];
        if (options.hasOwnProperty('id')) element.id = options['id'];
        if (options.hasOwnProperty('value')) element.value = options['value'];
        if (options.hasOwnProperty('onClick')) element.onclick = options['onClick'];
        if (options.hasOwnProperty('onMouseMove')) element.onmousemove = options['onMouseMove'];
        if (options.hasOwnProperty('onMouseDown')) element.onmousedown = options['onMouseDown'];
        if (options.hasOwnProperty('onMouseUp')) element.onmouseup = options['onMouseUp'];
        if (options.hasOwnProperty('onChange')) element.onchange = options['onChange'];
        if (options.hasOwnProperty('onInput')) element.oninput = options['onInput'];
        if (options.hasOwnProperty('value')) element.value = options['value'];
        if (options.hasOwnProperty('elements')) {
            var elements = options['elements'];
            for (var i = 0; i < elements.length; i++) {
                var addElement = elements[i];
                element.appendChild(addElement);
            }
        }
    }

    return element;
}

//This function dictates how CreateFunction works
function CreateFunction(owner, func) {
    return function() {
        return func.apply(owner, arguments);
    }
}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

/*
 (function(index) {
 console.log('iterator: ' + index);
 })(i);

function runBlock(func, arguments) {
    return func.apply(this, arguments);
}
    */