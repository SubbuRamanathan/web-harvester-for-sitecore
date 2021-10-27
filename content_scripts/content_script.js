var isMultiSelect = false;
var selectedXPaths = [];

chrome.runtime.onMessage.addListener(function(request) {
	switch(request.method){
		case 'pickDOM':
			pickDOM(request);
			break;
	}
});

function pickDOM(request){
	if (request.pickDOM == !0) {
		document.addEventListener("mouseover", onMouseHoverElement);
		document.addEventListener("click", onClickElement);
		isMultiSelect = request.multiSelect;
	}
	else{
		processSelectedXPaths();
	}
}

function onMouseHoverElement(event) {
	if (event === undefined) event = window.event;
	var target = 'target' in event ? event.target : event.srcElement;
	var tooltip = document.createElement('span');
	var tooltipText = target.innerHTML.length > 40 ? target.innerHTML.substring(0, 39) + '..' : target.innerHTML;
	tooltip.setAttribute('locator-data-tooltip', tooltipText);
	target.appendChild(tooltip);
	markElementTemp(target);
	target.addEventListener('mouseout', function() {
		unMarkAllTempElements();
		if (tooltip.parentNode) {
			target.removeChild(tooltip)
		}
	})
};

function onClickElement(event) {
	event.preventDefault();
    event.stopPropagation();
	if (event === undefined) event = window.event;
	var target = 'target' in event ? event.target : event.srcElement;
	selectedXPaths.push(getXPath(target));
	if(isMultiSelect){
		markElement(target);
	}
	else{
		processSelectedXPaths();
	}
    return false;
};

function processSelectedXPaths(){
	if(selectedXPaths.length > 0){
		chrome.runtime.sendMessage({ method: 'pickDOM', xpaths: selectedXPaths });
		selectedXPaths = [];
	}
	unMarkAllTempElements();
	unMarkAllMarkedElements();
	document.removeEventListener("mouseover", onMouseHoverElement);
	document.removeEventListener("click", onClickElement);
}

function getXPath(element) {
	if (element.id !== '') {
		var xpathWithId = '//*[@id=\"' + element.id + '\"]';
		return xpathWithId
	}
	if (element === document.body) return '//' + element.tagName.toLowerCase();
	var index = 0;
	var siblings = element.parentNode.childNodes;
	for (var i = 0; i < siblings.length; i++) {
		var sibling = siblings[i];
		if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (index + 1) + ']';
		if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
			index++
		}
	}
};

function markElement(element) {
	if (element) {
		element.classList.add("marked-element")
	}
}

function markElementTemp(element) {
	if (element) {
		element.classList.add("marked-element-temp")
	}
}

function unMarkAllTempElements() {
	unMarkElements(document.querySelectorAll('*[class*="marked-element-temp"]'), true);
};

function unMarkAllMarkedElements() {
	unMarkElements(document.querySelectorAll('*[class*="marked-element"]'), false);
};

function unMarkElements(elementArr, isTemp) {
	for (var index = 0; index < elementArr.length; index++) {
		unMarkElement(elementArr[index], isTemp)
	}
}

function unMarkElement(element, isTemp) {
	if (element) {
		if (isTemp) {
			element.classList.remove("marked-element-temp");
		} else {
			element.classList.remove("marked-element");
		}

		if (element.getAttribute('class') == '') {
			element.removeAttribute('class');
		} else {
			element.setAttribute('class', element.getAttribute('class').trim());
		}
	}
}