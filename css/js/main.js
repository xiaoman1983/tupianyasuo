// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const compressionControls = document.getElementById('compressionControls');
const previewArea = document.getElementById('previewArea');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

// 存储当前处理的图片数据
let currentFile = null;
let compressedBlob = null;

// 初始化拖放区域
function initDropZone() {
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 处理拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    // 处理文件选择
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0]);
        }
    });
}

// 处理图片上传
async function handleImageUpload(file) {
    // 验证文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        alert('请上传 JPG 或 PNG 格式的图片！');
        return;
    }

    currentFile = file;
    
    // 显示原始图片预览
    originalPreview.src = URL.createObjectURL(file);
    originalSize.textContent = `文件大小: ${formatFileSize(file.size)}`;

    // 显示控制区域和预览区域
    compressionControls.style.display = 'block';
    previewArea.style.display = 'block';

    // 压缩图片
    await compressImage();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩图片
async function compressImage() {
    if (!currentFile) return;

    const quality = qualitySlider.value / 100;
    const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        quality: quality
    };

    try {
        compressedBlob = await imageCompression(currentFile, options);
        
        // 更新压缩后的预览
        compressedPreview.src = URL.createObjectURL(compressedBlob);
        compressedSize.textContent = `文件大小: ${formatFileSize(compressedBlob.size)}`;
        
        // 计算压缩率
        const compressionRate = ((currentFile.size - compressedBlob.size) / currentFile.size * 100).toFixed(1);
        compressedSize.textContent += ` (节省 ${compressionRate}%)`;
    } catch (error) {
        console.error('压缩失败:', error);
        alert('图片压缩失败，请重试！');
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    if (!compressedBlob) return;

    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedBlob);
    
    // 生成文件名
    const originalName = currentFile.name;
    const extension = originalName.split('.').pop();
    const newName = originalName.replace(`.${extension}`, `_compressed.${extension}`);
    
    link.download = newName;
    link.click();
}

// 初始化事件监听
function initEventListeners() {
    // 监听质量滑块变化
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
    });

    qualitySlider.addEventListener('change', compressImage);

    // 监听下载按钮点击
    downloadBtn.addEventListener('click', downloadCompressedImage);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initDropZone();
    initEventListeners();
}); 
