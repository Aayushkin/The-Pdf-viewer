const pdfInput = document.getElementById("upload-pdf");
const uploadSection = document.getElementById("upload-section");
const pdfContainer = document.querySelector(".pdf-container");
const canvas = document.getElementById("pdf-render");
const ctx = canvas.getContext("2d");

const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const zoomInBtn = document.getElementById("zoom-in");
const zoomOutBtn = document.getElementById("zoom-out");
const rotateBtn = document.getElementById("rotate-pdf");
const fullscreenBtn = document.getElementById("fullscreen");

let pdfDoc = null,
    pageNum = 1,
    pageCount = 0,
    scale = 1.5,
    rotation = 0;

// Render PDF Page
const renderPage = (num) => {
    pdfDoc.getPage(num).then((page) => {
        const viewport = page.getViewport({ scale, rotation });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };
        page.render(renderContext);
    });

    document.getElementById("page-input").value = num;
    document.getElementById("page-count").textContent = pdfDoc.numPages;
};

// Load PDF
const loadPDF = (file) => {
    if (file && file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function (e) {
            const pdfData = new Uint8Array(e.target.result);
            pdfjsLib.getDocument({ data: pdfData }).promise.then((pdf) => {
                pdfDoc = pdf;
                pageCount = pdf.numPages;
                pdfContainer.classList.remove("hidden");
                renderPage(pageNum);
            });
        };
        reader.readAsArrayBuffer(file);
    }
};

// File Upload
pdfInput.addEventListener("change", (event) => loadPDF(event.target.files[0]));

// Navigation
prevPageBtn.addEventListener("click", () => pageNum > 1 && renderPage(--pageNum));
nextPageBtn.addEventListener("click", () => pageNum < pdfDoc.numPages && renderPage(++pageNum));

// Zoom & Rotate
zoomInBtn.addEventListener("click", () => { scale += 0.2; renderPage(pageNum); });
zoomOutBtn.addEventListener("click", () => { scale -= 0.2; renderPage(pageNum); });
rotateBtn.addEventListener("click", () => { rotation = (rotation + 90) % 360; renderPage(pageNum); });

// Fullscreen for Canvas Only
fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
    } else {
        document.exitFullscreen();
    }
});

// Adjust Canvas Size in Fullscreen
document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === canvas) {
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        scale = window.innerWidth / canvas.width;
    } else {
        canvas.style.width = "";
        canvas.style.height = "";
        scale = 1.5;
    }
    renderPage(pageNum);
});

// Hide UI in Fullscreen Mode
document.addEventListener("fullscreenchange", () => {
    const topBar = document.querySelector(".top-bar");
    const bottomBar = document.querySelector(".bottom-bar");

    if (document.fullscreenElement === canvas) {
        topBar.style.display = "none";
        bottomBar.style.display = "none";
    } else {
        topBar.style.display = "flex";
        bottomBar.style.display = "flex";
    }
});

// Exit Fullscreen with "Esc"
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.fullscreenElement === canvas) {
        document.exitFullscreen();
    }
});

// Drag and Drop Support
uploadSection.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadSection.classList.add("dragover");
});

uploadSection.addEventListener("dragleave", () => {
    uploadSection.classList.remove("dragover");
});

uploadSection.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadSection.classList.remove("dragover");
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        loadPDF(files[0]);
    }
});

// Keyboard Shortcuts
document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowLeft":
            prevPageBtn.click();
            break;
        case "ArrowRight":
            nextPageBtn.click();
            break;
        case "+":
            zoomInBtn.click();
            break;
        case "-":
            zoomOutBtn.click();
            break;
        case "r":
        case "R":
            rotateBtn.click();
            break;
        case "f":
        case "F":
            fullscreenBtn.click();
            break;
    }
});
