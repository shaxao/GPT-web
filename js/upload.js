import { setFileExplare, getFileExplare } from "./common.js";
import { showAlert } from "./iconBtn.js";

const input = document.getElementById('fileInput');
const container = document.getElementById('pre-container');
const preview = document.getElementById('preview');
const fileIcon = document.getElementById('fileIcon');
const fileName = document.getElementById('fileName');
const deleteMark = document.getElementById('deleteMark');
var viewFileIcon = document.getElementById("viewFile");
const progressBar = document.getElementById('progressBar');
var closeBtn = fileModal.getElementsByClassName("close")[0];
let imagePreviewSrc = "";
let uploadFile = "";


export function setImagePreviewSrc(value) {
    imagePreviewSrc = value;
}

export function getImagePreviewSrc() {
    return imagePreviewSrc;
}

export function setUploadFile(value) {
    uploadFile = value;
}

export function getUploadFile() {
    return uploadFile;
}

function handleMOdal() {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const fileText = getFileExplare();
    const fileContent = marked.parse(fileText);
    document.getElementById("fileContent").innerHTML = fileContent;

    var fileModal = document.getElementById("fileModal");
    fileModal.style.display = "block";
}

const fileTypes = {
    'application/pdf': '📄',
    'text/markdown': '📝',
};


async function getFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://blob.qipusong.site/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.status) {
            // 请求成功，获取 content 内容
            // console.log('上传成功，内容是：', data.content);
            Swal.fire({
                title: '成功',
                text: '文件解析成功',
                icon: 'success',
                confirmButtonText: '好的'
            });
            return data.content;
        } else {
            // console.error('上传失败，错误信息：', data.error);
            showAlert('文件解析失败!', false)
            return null;
        }
    } catch (error) {
        // console.error('请求出错：', error);
        showAlert('请求错误：', error, false)
        return null;
    }
}

function showFile(file) {
    viewFileIcon.style.display = "inline-block";
    fileIcon.textContent = fileTypes[file.type] || '📄';
    fileIcon.style.display = 'inline-block';
    fileName.textContent = file.name;
    fileName.style.display = 'inline-block';
    deleteMark.style.display = 'block';
}

// 更新进度条的函数
function updateProgressBar(event) {
    const progressBar = document.getElementById('progressBar');
    if (event.lengthComputable) {
        const percentage = (event.loaded / event.total) * 100;
        progressBar.style.width = percentage + '%';
    }
}

const showPlaceholder = () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    // 创建加载图标容器
    const loadingIcon = document.createElement('div');
    loadingIcon.className = 'loading-icon';
    placeholder.appendChild(loadingIcon);
    container.appendChild(placeholder);
    // 延迟显示进度条
    setTimeout(() => {
        document.querySelector('.progress-bar-container').style.display = 'block';
    }, 500);
}

const removePlaceholder = () => {
    const placeholder = container.querySelector('.placeholder');
    if (placeholder) {
        container.removeChild(placeholder);
    }
    document.querySelector('.progress-bar-container').style.display = 'none';
}

export const resetPreview = () => {
    viewFileIcon.style.display = "none";
    container.classList.remove('visible');
    preview.style.display = 'none';
    preview.src = '';
    fileIcon.style.display = 'none';
    fileName.textContent = '';
    deleteMark.style.display = 'none';
    input.value = '';
    setFileExplare('');
};

input.addEventListener('change', async function () {
    const file = this.files[0];
    setUploadFile(file);
    // console.log("file: ", getUploadFile());
    if (!file) {
        resetPreview();
        return;
    }
    // 文件大于20MB，则无法上传
    if (file.size > 1024 * 1024 * 10) {
        showAlert('文件过大，无法上传', false);
        return;
    }
    resetPreview();
    showPlaceholder();
    container.style.display = 'inline-block';
    console.log("Container display set to inline-block");
    setTimeout(() => {
        container.classList.add('visible');
        console.log("Container class 'visible' added");
    }, 10);


    const reader = new FileReader();
    reader.onprogress = updateProgressBar;
    reader.onloadstart = function (e) {
        // 显示进度条容器
        document.querySelector('.progress-bar-container').style.display = 'block';
        updateProgressBar({ lengthComputable: true, loaded: 0, total: file.size });
    };
    // 文件读取完毕后隐藏进度条
    reader.onloadend = function (e) {
        setTimeout(function () {
            document.querySelector('.progress-bar-container').style.display = 'none';
        }, 500);
    };


    if (file.type.startsWith('image/')) {
        viewFileIcon.style.display = "none";
        preview.onload = () => {
            removePlaceholder();
            preview.style.display = 'block';
            deleteMark.style.display = 'block';
        };
        reader.onload = (e) => {
            setImagePreviewSrc(e.target.result);
            console.log("imagePreviewSrc:", getImagePreviewSrc());
            preview.src = e.target.result;
        };
    } else {
        // 如果是文件，那么发送请求到服务器进行文件解析
        setFileExplare(await getFile(file));
        // const explare = getFileExplare();
        // console.log(explare);
        // console.log("content:", content);
        removePlaceholder();
        showFile(file);
    }
    reader.onerror = resetPreview;
    reader.readAsDataURL(file);
});

//点击眼睛图标时显示模态框
document.getElementById("viewFile").onclick = handleMOdal;





// 点击关闭按钮隐藏模态框
closeBtn.onclick = function () {
    // container.classList.remove('visible');
    fileModal.style.display = "none";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
};

// 点击模态框外部时隐藏模态框
window.onclick = function (event) {
    if (event.target == fileModal) {
        fileModal.style.display = "none";
    }
};

deleteMark.addEventListener('click', function () {
    resetPreview();
    removePlaceholder(); // 确保点击删除后也会移除加载提示和进度条
});