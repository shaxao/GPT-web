export let modelState = {
  model: 'gpt-3.5-turbo'
};

function observe(obj) {
  Object.keys(obj).forEach(key => {
    let internalValue = obj[key];
    const listeners = [];

    Object.defineProperty(obj, key, {
      get() {
        if (window.__currentFunction && !listeners.includes(window.__currentFunction)) {
          listeners.push(window.__currentFunction);
        }
        return internalValue;
      },
      set(newValue) {
        internalValue = newValue;
        listeners.forEach(func => func());
      }
    });
  });
}

function autorun(func) {
  window.__currentFunction = func;
  func();
  window.__currentFunction = null;
}

function updateModel() {
  document.getElementById("dropbtn").setAttribute("data-text", modelState.model);
  document.getElementById("dropbtn").textContent = modelState.model;
  var selectElement = document.getElementById('model-select');
  selectElement.value = modelState.model;
  if (selectElement.value !== modelState.model) {
    var newOption = new Option(modelState.model, modelState.model);
    selectElement.add(newOption);
    selectElement.value = modelState.model;
  }
  var headTitleDiv = document.querySelector('.head-title');
  var spanElement = headTitleDiv.querySelector('span');
  spanElement.textContent = modelState.model;
}

observe(modelState);
autorun(updateModel);
