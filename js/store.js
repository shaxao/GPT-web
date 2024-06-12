export let modelState = {
  model: 'gpt-3.5-turbo'
};

/**
 * observe 函数通过监视对象属性的变化来实现响应式编程。
 * 当读取对象的属性时，它会将当前函数（如果有）添加到监听器列表中。
 * 当属性被设置为新值时，它会通知所有监听器并调用它们。
 *
 * @param {Object} obj - 需要监视其属性变化的对象。
 * /*
 * @example
 * const person = {
 *   name: 'John',
 *   age: 30
 * };
 *
 * observe(person);
 *
 * person.name = 'Jane'; // 触发监听器并调用函数
 * console.log(person.name); // 输出：Jane
 */
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
