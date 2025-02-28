let zip = new JSZip();
let currentPath = '';
let currentFile = '';

function loadZipFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        zip.loadAsync(event.target.result)
            .then(function(zip) {
                currentPath = '';
                displayDirectoryStructure();
                document.getElementById('saveFileButton').style.display = 'block';
                document.getElementById('downloadZipButton').style.display = 'block';
            });
    };

    reader.readAsArrayBuffer(file);
}

function displayDirectoryStructure() {
    const container = document.getElementById('directoryStructure');
    container.innerHTML = '';
    const files = zip.files;

    for (let fileName in files) {
        if (fileName.startsWith(currentPath)) {
            const relativePath = fileName.slice(currentPath.length);
            const parts = relativePath.split('/');
            if (parts.length === 1 || (parts.length === 2 && parts[1] === '')) {
                const element = document.createElement('div');
                element.innerHTML = parts[0] + (files[fileName].dir ? ' ⬇️' : ' ➡️');
                if (files[fileName].dir) {
                    element.style.fontWeight = 'bold';
                    element.onclick = () => navigateDown(fileName);
                } else {
                    element.onclick = () => loadFileContent(fileName);
                }
                container.appendChild(element);
            }
        }
    }
}

function navigateHome() {
    currentPath = '';
    displayDirectoryStructure();
}

function navigateDown(path) {
    currentPath = path;
    displayDirectoryStructure();
}

function navigateUp() {
    if (currentPath) {
        const parts = currentPath.split('/');
        if (parts.length > 1) {
            parts.pop();
            parts.pop();
            currentPath = parts.join('/') + '/';
        } else {
            currentPath = '';
        }
        displayDirectoryStructure();
    }
}

function loadFileContent(fileName) {
    currentFile = fileName;
    zip.files[fileName].async('string')
        .then(function(content) {
            const fileContentElement = document.getElementById('fileContent');
            const uploadedImageElement = document.getElementById('uploadedImage');
            const isImage = /\.(jpe?g|png|gif|bmp)$/i.test(fileName);
            
            if (isImage) {
                zip.files[fileName].async('base64').then(function(base64Content) {
                    uploadedImageElement.src = 'data:image/*;base64,' + base64Content;
                    uploadedImageElement.style.display = 'block';
                    fileContentElement.style.display = 'none';
                });
            } else {
                fileContentElement.value = content;
                fileContentElement.style.display = 'block';
                uploadedImageElement.style.display = 'none';
            }
            
            document.getElementById('saveFileButton').style.display = 'block';
            document.getElementById('closeEditButton').style.display = 'block';
            document.getElementById('editMenu').style.display = 'block';
        });
}

function createNewDirectory() {
    const newDir = document.getElementById('newDir').value;
    if (newDir) {
        zip.folder(currentPath + newDir);
        displayDirectoryStructure();
        document.getElementById('newDir').value = '';
    }
}

function createNewFile() {
    const newFile = document.getElementById('newFile').value;
    if (newFile) {
        zip.file(currentPath + newFile, '');
        displayDirectoryStructure();
        document.getElementById('newFile').value = '';
    }
}

function saveCurrentFile() {
    const content = document.getElementById('fileContent').value;
    zip.file(currentFile, content);
    alert('File saved!');
}

function closeEditMenu() {
    document.getElementById('fileContent').style.display = 'none';
    document.getElementById('saveFileButton').style.display = 'none';
    document.getElementById('closeEditButton').style.display = 'none';
    document.getElementById('editMenu').style.display = 'none';
    document.getElementById('uploadedImage').style.display = 'none';
}

function downloadZip() {
    zip.generateAsync({ type: 'blob' }).then(function(blob) {
        const anchor = document.createElement('a');
        anchor.download = 'edited-file.zip';
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
    });
}

function loadImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileName = currentPath + file.name;
        zip.file(fileName, event.target.result.split(',')[1], { base64: true });
        displayDirectoryStructure();
        const imageElement = document.getElementById('uploadedImage');
        imageElement.src = event.target.result;
        imageElement.style.display = 'block';
    };

    reader.readAsDataURL(file);
}
