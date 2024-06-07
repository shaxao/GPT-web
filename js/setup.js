import { models, GlobalModeSet, setAuthToken, setOpenaiBaseUrl, saveToLocalStorage, loadFromLocalStorage, API_URL, API_KEY } from "./common.js";
import { modelState } from './store.js'

// 全局的模型类

export let globalModeSettings = new GlobalModeSet();
// JavaScript代码
// 获取元素引用
const modal = document.getElementById('modal-settings');
const btnSave = document.getElementById('save-settings');
const btnReset = document.getElementById('reset-settings');
const setupbtn = document.getElementById("setupbtn");
const close = document.getElementById('close-settings');
let modelSelect = document.getElementById("model-select");
let dropbtn = document.getElementById("dropbtn");
let proxyUrl = document.getElementById("proxyUrl");
let apiKey = document.getElementById("apiKey");
let webProxyUrl = document.getElementById("webProxyUrl");
let accessToken = document.getElementById("access_token");
let temperature = document.getElementById("temperature-value");
let topP = document.getElementById("top-p-value");
let maxTokens = document.getElementById("max-tokens");
let presencePenalty = document.getElementById("presence-penalty-value");
let frequencyPenalty = document.getElementById("frequency-penalty-value");



// 更新滑块值的函数
const updateSliderValue = (sliderId, spanId, isReset) => {
  const slider = document.getElementById(sliderId);
  const output = document.getElementById(spanId);
  if (isReset) {
    slider.value = output.textContent;
  } else {
    output.textContent = slider.value;
  }
  slider.oninput = function () {
    output.textContent = this.value;
  };
};
function showSetUp() {
  const loadedSettings = JSON.parse(loadFromLocalStorage('globalSetting'));
  if (loadedSettings) {
    // console.log('loadSetting', loadedSettings);
    modelState.model = "gpt-3.5-turbo";
    apiKey.value = loadedSettings.apiKey;
    proxyUrl.value = loadedSettings.baseUrl;
    webProxyUrl.value = loadedSettings.webProxyUrl;
    accessToken.value = loadedSettings.accessToken;
    frequencyPenalty.textContent = loadedSettings.frequencyPenalty;
    topP.textContent = loadedSettings.topP;
    presencePenalty.textContent = loadedSettings.presencePenalty;
    temperature.textContent = loadedSettings.temperature;
    updateSliderValue('temperature-slider', 'temperature-value', true);
    updateSliderValue('top-p-slider', 'top-p-value', true);
    updateSliderValue('presence-penalty', 'presence-penalty-value', true);
    updateSliderValue('frequency_penalty', 'frequency-penalty-value', true);
  }

}

showSetUp();

// 为下拉菜单添加change事件监听器
modelSelect.addEventListener("change", function () {
  var selectedText = this.options[this.selectedIndex].text;
  dropbtn.setAttribute("data-text", selectedText);
  dropbtn.textContent = selectedText;
});

// 循环遍历模型数组，为每个模型创建一个选项并添加到下拉菜单中
models.forEach(function (model) {
  var option = document.createElement("option");
  option.value = model.toLowerCase().replace(/ /g, "-");
  option.text = model;
  modelSelect.appendChild(option);
});

document.querySelector('.toggle-password').addEventListener('click', function () {
  event.stopPropagation();
  const input = document.querySelector('.password-input');
  const icon = this.querySelector('i');
  if (input.type === "password") {
    input.type = "text";
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = "password";
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
});




// 为每个滑块调用更新函数
updateSliderValue('temperature-slider', 'temperature-value', false);
updateSliderValue('top-p-slider', 'top-p-value', false);
updateSliderValue('presence-penalty', 'presence-penalty-value', false);
updateSliderValue('frequency_penalty', 'frequency-penalty-value', false);

// 关闭模态窗口的函数
const closeModal = () => {
  modal.style.display = 'none';
};

// 打开模态窗口的函数
const openModal = () => {
  modal.style.display = 'block';
};

// 保存设置的函数
const saveSettings = () => {
  console.log('设置已保存.');
  globalModeSettings.modelSelect = modelSelect.value;
  globalModeSettings.apiKey = apiKey.value;
  globalModeSettings.baseUrl = proxyUrl.value;
  globalModeSettings.webProxyUrl = webProxyUrl.value;
  globalModeSettings.accessToken = accessToken.value;
  globalModeSettings.frequencyPenalty = frequencyPenalty.textContent;
  globalModeSettings.topP = topP.textContent;
  globalModeSettings.presencePenalty = presencePenalty.textContent;
  globalModeSettings.tempertaure = temperature.textContent;
  setAuthToken(accessToken.value);
  setOpenaiBaseUrl(webProxyUrl.value);
  saveToLocalStorage(API_URL, proxyUrl.value);
  saveToLocalStorage(API_KEY, apiKey.value);
  saveToLocalStorage('globalSetting', JSON.stringify(globalModeSettings));
  // console.log("modelSelect:", globalModeSettings.modelSelect);
  // console.log("apiKey:", globalModeSettings.apiKey);
  // console.log("proxyUrl:", globalModeSettings.proxyUrl);
  // console.log("frequencyPenalty:", globalModeSettings.frequencyPenalty);
  // console.log("top_p:", globalModeSettings.topP);
  // console.log("presencePenalty:", globalModeSettings.presencePenalty);
  // console.log("temperature:", globalModeSettings.tempertaure);
  closeModal();

};

// 恢复默认设置的函数
const resetSettings = () => {
  // 重置逻辑
  const resedGlobalSet = new GlobalModeSet();
  modelState.model = "gpt-3.5-turbo";
  apiKey.value = resedGlobalSet.apiKey;
  proxyUrl.value = resedGlobalSet.baseUrl;
  webProxyUrl.value = resedGlobalSet.webProxyUrl;
  accessToken.value = resedGlobalSet.accessToken;
  frequencyPenalty.textContent = resedGlobalSet.frequencyPenalty;
  topP.textContent = resedGlobalSet.topP;
  presencePenalty.textContent = resedGlobalSet.presencePenalty;
  temperature.textContent = resedGlobalSet.temperature;
  updateSliderValue('temperature-slider', 'temperature-value', true);
  updateSliderValue('top-p-slider', 'top-p-value', true);
  updateSliderValue('presence-penalty', 'presence-penalty-value', true);
  updateSliderValue('frequency_penalty', 'frequency-penalty-value', true);
  console.log('top_p:", globalModeSettings.topP', resedGlobalSet.topP);
};

// 添加事件监听器
close.onclick = closeModal;
btnSave.onclick = saveSettings;
btnReset.onclick = resetSettings;
setupbtn.onclick = openModal;

// 点击窗口外部关闭模态窗口
window.onclick = (event) => {
  if (event.target === modal) {
    closeModal();
  }
};