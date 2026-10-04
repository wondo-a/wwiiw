/* =========================================================
   발췌기 JavaScript
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       요소 가져오기
    ===================================================== */

    const toolbar = document.getElementById("toolbar");
    const editor = document.getElementById("editor");

    const boldButton = document.getElementById("boldButton");
    const italicButton = document.getElementById("italicButton");
    const strikeButton = document.getElementById("strikeButton");
    const highlightButton = document.getElementById("highlightButton");

    const bubbleButton = document.getElementById("bubbleButton");
    const bubbleOtherButton = document.getElementById("bubbleOtherButton");
    
    const boxButton = document.getElementById("boxButton");
    const boxColorButton = document.getElementById("boxColorButton");
    const boxColorInput = document.getElementById("boxColorInput");

    const spacingButton = document.getElementById("spacingButton");
    const backgroundButton = document.getElementById("backgroundButton");
    
    const paddingButton = document.getElementById("paddingButton");
    const paddingPanel = document.getElementById("paddingPanel");
    const paddingRange = document.getElementById("paddingRange");
    const paddingValue = document.getElementById("paddingValue");
    const paddingReset = document.getElementById("paddingReset");

    const highlightColorButton = document.getElementById("highlightColorButton");
    const highlightColorInput = document.getElementById("highlightColorInput");

    const fontSelect = document.getElementById("fontSelect");
    const fontSizeDown = document.getElementById("fontSizeDown");
    const fontSizeUp = document.getElementById("fontSizeUp");
    const fontSizeValue = document.getElementById("fontSizeValue");

    const spacingPanel = document.getElementById("spacingPanel");
    const lineHeightRange = document.getElementById("lineHeightRange");
    const lineHeightValue = document.getElementById("lineHeightValue");
    const letterSpacingRange = document.getElementById("letterSpacingRange");
    const letterSpacingValue = document.getElementById("letterSpacingValue");
    const spacingReset = document.getElementById("spacingReset");

    const backgroundPanel = document.getElementById("backgroundPanel");
    const bgOptions = document.querySelectorAll(".bg-option");
    const bgImageOption = document.getElementById("bgImageOption");
    const bgImagePick = document.getElementById("bgImagePick");
    const bgImageInput = document.getElementById("bgImageInput");
    const blurRow = document.getElementById("blurRow");
    const blurToggle = document.getElementById("blurToggle");
    const blurRange = document.getElementById("blurRange");
    const blurValue = document.getElementById("blurValue");

    const editorBg = document.getElementById("editorBg");
    const editorBgImage = document.getElementById("editorBgImage");

    const clearCacheButton = document.getElementById("clearCacheButton");
    const clearButton = document.getElementById("clearButton");
    const saveImageButton = document.getElementById("saveImageButton");
    const editorWrapper = document.querySelector(".editor-wrapper");

    /* =====================================================
       코드에서 미리 지정하는 값
    ===================================================== */

    /* 형광펜 투명도 (0 ~ 100) */
    const HIGHLIGHT_OPACITY = 40;

    /*
     * 글꼴 목록
     * - name    : Google Fonts 에 등록된 글꼴 이름 (정확히 일치해야 함)
     * - weights : 불러올 굵기. 굵기가 하나뿐인 글꼴은 생략
     *
     * 목록은 아래 배열만 수정하면 됩니다.
     * (첫 번째 글꼴이 기본 글꼴)
     */
    const FONT_LIST = [
        { name: "Gowun Dodum" },
        { name: "Gowun Batang", weights: "400;700" },
        { name: "IBM Plex Sans KR", weights: "400;700" },
        { name: "Nanum Pen Script" }
    ];

    /* 글자 크기 범위 */
    const FONT_SIZE_MIN = 10;
    const FONT_SIZE_MAX = 60;

    /* 배경 색상과 글자색 */
    const BACKGROUNDS = {
        white: { color: "#ffffff", text: "#222222" },
        black: { color: "#000000", text: "#f2f2f7" },
        gray: { color: "#3a3a3c", text: "#f2f2f7" }
    };

    /* 배경 이미지일 때 글자색 (이미지 밝기에 따라 자동 선택) */
    const IMAGE_TEXT_DARK = "#222222";
    const IMAGE_TEXT_LIGHT = "#ffffff";

    /* 배경 이미지 최대 크기 (기기 저장 용량 절약) */
    const IMAGE_MAX_SIZE = 1600;


    /* =====================================================
       설정값 (기기에 저장)
    ===================================================== */

    const STORAGE_KEY = "excerptToolSettings";
    const IMAGE_KEY = "excerptToolBgImage";

    const defaultSettings = {
        highlightColor: "#fff176",
        boxColor: "#ebebeb",

        fontFamily: FONT_LIST[0].name,
        fontSize: 15,
        lineHeight: 1.65,
        letterSpacing: 0,
        editorPadding: 40,

        bgType: "white",
        bgBlurOn: false,
        bgBlurSize: 8,
        bgTextLight: false
    };

    let settings = loadSettings();

    /* 갤러리에서 불러온 배경 이미지 (data URL) */
    let bgImage = loadBgImage();

    if (settings.bgType === "image" && !bgImage) {
        settings.bgType = "white";
    }

    /* 마지막으로 선택한 텍스트 영역 */
    let savedRange = null;


    /* =====================================================
       설정 불러오기 / 저장
    ===================================================== */

    function loadSettings() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultSettings };
            }

            const merged = {
                ...defaultSettings,
                ...JSON.parse(saved)
            };

            /* 목록에서 사라진 글꼴이면 기본 글꼴로 */
            if (!FONT_LIST.some(font => font.name === merged.fontFamily)) {
                merged.fontFamily = defaultSettings.fontFamily;
            }

            return merged;

        } catch (error) {

            console.warn("설정값을 불러오지 못했습니다.", error);

            return { ...defaultSettings };
        }
    }

    function saveSettings() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(settings)
            );

        } catch (error) {

            console.warn("설정값을 저장하지 못했습니다.", error);
        }
    }

    function loadBgImage() {

        try {

            return localStorage.getItem(IMAGE_KEY) || null;

        } catch (error) {

            return null;
        }
    }


    /* =====================================================
       Google Fonts 불러오기
       (글꼴마다 따로 불러와서 하나가 실패해도 나머지는 정상)
    ===================================================== */

    function loadGoogleFonts() {

        FONT_LIST.forEach(font => {

            const family = font.name.replace(/ /g, "+");

            const weight = font.weights
                ? `:wght@${font.weights}`
                : "";

            const link = document.createElement("link");

            link.rel = "stylesheet";

            link.href =
                `https://fonts.googleapis.com/css2?family=${family}${weight}&display=swap`;

            /* html-to-image가 폰트를 차단 없이 읽어서 이미지에 구울 수 있도록 보안 권한 허용 추가 */
            link.crossOrigin = "anonymous";

            document.head.appendChild(link);
        });
    }

    function createFontOptions() {

        fontSelect.innerHTML = "";

        FONT_LIST.forEach(font => {

            const option = document.createElement("option");

            option.value = font.name;
            option.textContent = font.name;

            option.style.fontFamily = `"${font.name}", sans-serif`;

            fontSelect.appendChild(option);
        });
    }

    function createFontOptions() {

        fontSelect.innerHTML = "";

        FONT_LIST.forEach(font => {

            const option = document.createElement("option");

            option.value = font.name;
            option.textContent = font.name;

            option.style.fontFamily = `"${font.name}", sans-serif`;

            fontSelect.appendChild(option);
        });
    }


    /* =====================================================
       색상 변환
    ===================================================== */

    function hexToRgba(hex, opacity) {

        hex = hex.replace("#", "");

        if (hex.length === 3) {

            hex = hex
                .split("")
                .map(char => char + char)
                .join("");
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
    }

    function isTransparent(value) {

        if (!value) {
            return true;
        }

        const compact = value.replace(/\s/g, "");

        return (
            compact === "transparent" ||
            /^rgba\(.*,0\)$/.test(compact)
        );
    }


    /* =====================================================
       현재 형광펜 색상 표시
    ===================================================== */

    function updateHighlightColorDisplay() {

        const rgba = hexToRgba(
            settings.highlightColor,
            HIGHLIGHT_OPACITY
        );

        /* 흰 바탕 위에 실제 투명도로 겹쳐 보이게 표시 */
        highlightColorButton.style.backgroundImage =
            `linear-gradient(${rgba}, ${rgba})`;

        highlightColorInput.value = settings.highlightColor;
    }


    /* =====================================================
       글꼴 / 글자 크기 / 행간 / 자간 적용
       (입력창 안의 내용에만 적용)
    ===================================================== */

    function applyTypography() {

        editor.style.fontFamily =
            `"${settings.fontFamily}", "Noto Sans KR", sans-serif`;

        editor.style.fontSize =
            `${settings.fontSize}px`;

        editor.style.lineHeight =
            String(settings.lineHeight);

        editor.style.letterSpacing =
            `${settings.letterSpacing}em`;

        editor.style.padding = `${settings.editorPadding}px`;
        paddingRange.value = settings.editorPadding;
        paddingValue.textContent = `${settings.editorPadding}px`;

        fontSelect.value = settings.fontFamily;

        fontSelect.style.fontFamily = `"${settings.fontFamily}", sans-serif`;

        fontSizeValue.textContent = settings.fontSize;

        lineHeightRange.value = settings.lineHeight;
        lineHeightValue.textContent =
            Number(settings.lineHeight).toFixed(2);

        letterSpacingRange.value = settings.letterSpacing;
        letterSpacingValue.textContent =
            `${Number(settings.letterSpacing).toFixed(2)}em`;
    }

    function changeFontSize(amount) {

        const next = Math.min(
            FONT_SIZE_MAX,
            Math.max(FONT_SIZE_MIN, settings.fontSize + amount)
        );

        settings.fontSize = next;

        applyTypography();
        saveSettings();
    }


    /* =====================================================
       배경 적용
    ===================================================== */

    function getBlurMargin() {

        return settings.bgBlurOn
            ? Math.ceil(settings.bgBlurSize * 2)
            : 0;
    }

    function applyBackground() {

        const useImage =
            settings.bgType === "image" && bgImage;

        let textColor;

        if (useImage) {

            editorBgImage.style.display = "block";

            editorBgImage.style.backgroundImage =
                `url("${bgImage}")`;

            /* 이미지 확대(Zoom) 현상을 방지하기 위해 강제 여백 확장을 제거하고 기본값으로 고정 */
            editorBgImage.style.top = "0";
            editorBgImage.style.left = "0";
            editorBgImage.style.right = "0";
            editorBgImage.style.bottom = "0";

            editorBgImage.style.filter = settings.bgBlurOn
                ? `blur(${settings.bgBlurSize}px)`
                : "none";

            textColor = settings.bgTextLight
                ? IMAGE_TEXT_LIGHT
                : IMAGE_TEXT_DARK;

        } else {

            const bg =
                BACKGROUNDS[settings.bgType] || BACKGROUNDS.white;

            editorBgImage.style.display = "none";

            editorBg.style.backgroundColor = bg.color;

            textColor = bg.text;
        }

        editor.style.color = textColor;

        /* 배경 창 표시 갱신 */
        if (bgImage) {

            bgImageOption.style.backgroundImage =
                `url("${bgImage}")`;

            bgImageOption.innerHTML = "";

        } else {

            bgImageOption.style.backgroundImage = "";

            bgImageOption.innerHTML =
                '<i class="fa-regular fa-image"></i>';
        }

        blurToggle.checked = settings.bgBlurOn;

        blurRange.value = settings.bgBlurSize;

        blurValue.textContent = `${settings.bgBlurSize}px`;

        blurRange.disabled = !settings.bgBlurOn;

        blurRow.classList.toggle(
            "disabled",
            !useImage
        );
    }


    /* =====================================================
       갤러리 이미지 처리 (축소 + 밝기 계산)
    ===================================================== */

    function loadImageElement(source) {

        return new Promise((resolve, reject) => {

            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () =>
                reject(new Error("이미지를 불러오지 못했습니다."));

            image.src = source;
        });
    }

    async function processImageFile(file) {

        const url = URL.createObjectURL(file);

        try {

            const image = await loadImageElement(url);

            const scale = Math.min(
                1,
                IMAGE_MAX_SIZE /
                Math.max(image.naturalWidth, image.naturalHeight)
            );

            const width = Math.round(image.naturalWidth * scale);
            const height = Math.round(image.naturalHeight * scale);

            const canvas = document.createElement("canvas");

            canvas.width = width;
            canvas.height = height;

            canvas.getContext("2d").drawImage(image, 0, 0, width, height);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);


            /* 평균 밝기 계산 → 글자색 자동 선택 */

            const small = document.createElement("canvas");

            small.width = 24;
            small.height = 24;

            const smallContext = small.getContext("2d");

            smallContext.drawImage(image, 0, 0, 24, 24);

            const pixels =
                smallContext.getImageData(0, 0, 24, 24).data;

            let total = 0;

            for (let i = 0; i < pixels.length; i += 4) {

                total +=
                    0.2126 * pixels[i] +
                    0.7152 * pixels[i + 1] +
                    0.0722 * pixels[i + 2];
            }

            const brightness = total / (pixels.length / 4) / 255;

            return {
                dataUrl,
                isDark: brightness < 0.5
            };

        } finally {

            URL.revokeObjectURL(url);
        }
    }


    /* =====================================================
       선택 영역 저장 / 복구
    ===================================================== */

    function saveSelection() {

        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return;
        }

        const range = selection.getRangeAt(0);

        /* 선택 영역이 입력창 안에 있을 때만 저장 */

        if (editor.contains(range.commonAncestorContainer)) {

            savedRange = range.cloneRange();
        }
    }

    function restoreSelection() {

        if (!savedRange) {
            return;
        }

        const selection = window.getSelection();

        selection.removeAllRanges();

        selection.addRange(savedRange.cloneRange());
    }

    function focusEditorWithSelection() {

        editor.focus({ preventScroll: true });

        restoreSelection();
    }

    function currentRange() {

        const selection = window.getSelection();

        return selection.rangeCount > 0
            ? selection.getRangeAt(0)
            : null;
    }

    /* 저장된 선택 영역에 글자가 선택되어 있는지 */

    function hasSavedSelection() {

        return Boolean(
            savedRange &&
            !savedRange.collapsed &&
            editor.contains(savedRange.commonAncestorContainer)
        );
    }


    /* =====================================================
       툴바 버튼: 누를 때 선택 영역이 사라지는 것 방지
    ===================================================== */

    [
        boldButton,
        italicButton,
        strikeButton,
        highlightButton,
        bubbleButton,
        boxButton
    ].forEach(button => {

        button.addEventListener(
            "mousedown",
            (event) => event.preventDefault()
        );
    });


    /* =====================================================
       굵게 / 기울임 / 취소선
    ===================================================== */

    function applyTextCommand(command) {

        focusEditorWithSelection();

        document.execCommand("styleWithCSS", false, true);

        document.execCommand(command, false, null);

        saveSelection();

        updateToolbarState();
    }

    boldButton.addEventListener(
        "click",
        () => applyTextCommand("bold")
    );

    italicButton.addEventListener(
        "click",
        () => applyTextCommand("italic")
    );

    strikeButton.addEventListener(
        "click",
        () => applyTextCommand("strikeThrough")
    );


    /* =====================================================
       형광펜 (누르면 적용, 한 번 더 누르면 해제)
    ===================================================== */

    /* 범위 안의 (공백이 아닌) 텍스트 노드 목록 */

    function getTextNodesInRange(range) {

        const container = range.commonAncestorContainer;

        const candidates = [];

        if (container.nodeType === Node.TEXT_NODE) {

            candidates.push(container);

        } else {

            const walker = document.createTreeWalker(
                container,
                NodeFilter.SHOW_TEXT
            );

            while (walker.nextNode()) {

                candidates.push(walker.currentNode);
            }
        }

        return candidates.filter(node => {

            if (!range.intersectsNode(node)) {
                return false;
            }

            const start =
                node === range.startContainer
                    ? range.startOffset
                    : 0;

            const end =
                node === range.endContainer
                    ? range.endOffset
                    : node.length;

            return node.data.slice(start, end).trim() !== "";
        });
    }

    function hasHighlightAncestor(node) {

        let element = node.parentElement;

        while (element && element !== editor) {

            if (
                element.style &&
                !isTransparent(element.style.backgroundColor)
            ) {
                return true;
            }

            element = element.parentElement;
        }

        return false;
    }

    /* 선택한 글자가 모두 형광펜 상태인지 */

    function isRangeHighlighted(range) {

        if (!range) {
            return false;
        }

        const nodes = getTextNodesInRange(range);

        if (nodes.length === 0) {
            return false;
        }

        return nodes.every(hasHighlightAncestor);
    }

    function unwrapElement(element) {

        const parent = element.parentNode;

        while (element.firstChild) {

            parent.insertBefore(element.firstChild, element);
        }

        parent.removeChild(element);
    }

    /* 해제 후 남는 투명 배경 span 정리 */

    function cleanHighlightSpans() {

        editor.querySelectorAll("[style]").forEach(element => {

            if (
                element.style.backgroundColor &&
                isTransparent(element.style.backgroundColor)
            ) {

                element.style.removeProperty("background-color");

                if (!element.getAttribute("style").trim()) {

                    element.removeAttribute("style");
                }

                if (
                    element.tagName === "SPAN" &&
                    element.attributes.length === 0
                ) {

                    unwrapElement(element);
                }
            }
        });
    }

    function addHighlight() {

        const color = hexToRgba(
            settings.highlightColor,
            HIGHLIGHT_OPACITY
        );

        if (!document.execCommand("hiliteColor", false, color)) {

            document.execCommand("backColor", false, color);
        }
    }

    function removeHighlight() {

        const values = ["transparent", "rgba(0, 0, 0, 0)"];

        for (const value of values) {

            document.execCommand("hiliteColor", false, value);

            if (!isRangeHighlighted(currentRange())) {
                return;
            }
        }

        document.execCommand("backColor", false, "transparent");
    }

    highlightButton.addEventListener(
        "click",
        () => {
            /* 선택된 글자가 없으면 아무 것도 하지 않음 */

            if (!hasSavedSelection()) {
                return;
            }

            focusEditorWithSelection();

            document.execCommand("styleWithCSS", false, true);

            const range = currentRange();

            if (isRangeHighlighted(range)) {

                removeHighlight();

            } else {

                addHighlight();
            }

            cleanHighlightSpans();

            saveSelection();

            updateToolbarState();
        }
    );


    /* =====================================================
       형광펜 색상 (아이폰 기본 색상 선택창)
    ===================================================== */

    highlightColorInput.addEventListener(
        "input",
        () => {

            settings.highlightColor = highlightColorInput.value;

            saveSettings();

            updateHighlightColorDisplay();
        }
    );


    /* =====================================================
       말풍선
    ===================================================== */

    function closestBubble(node) {

        const element =
            node.nodeType === Node.ELEMENT_NODE
                ? node
                : node.parentElement;

        return element ? element.closest(".bubble") : null;
    }

    function createEmptyLine() {

        const line = document.createElement("div");

        line.appendChild(document.createElement("br"));

        return line;
    }

    bubbleButton.addEventListener(
        "click",
        () => {

            if (!hasSavedSelection()) {
                return;
            }

            focusEditorWithSelection();

            const range = currentRange();

            if (!range) {
                return;
            }


            /* 이미 말풍선 안의 글자를 선택했다면 말풍선 해제 */

            const startBubble = closestBubble(range.startContainer);
            const endBubble = closestBubble(range.endContainer);

            if (startBubble && startBubble === endBubble) {

                unwrapElement(startBubble);

                saveSelection();

                updateToolbarState();

                return;
            }


            /* 선택한 텍스트를 말풍선으로 감싸기 */

            const fragment = range.extractContents();

            const bubble = document.createElement("div");

            bubble.className = "bubble";

            bubble.appendChild(fragment);

            /* 겹친 말풍선 방지 */

            bubble.querySelectorAll(".bubble").forEach(unwrapElement);

            range.insertNode(bubble);


            /* 말풍선 앞뒤에 커서를 놓을 수 있는 빈 줄 확보 */

            if (!bubble.nextSibling) {

                bubble.after(createEmptyLine());
            }

            if (!bubble.previousSibling) {

                bubble.before(createEmptyLine());
            }


            /* 말풍선 뒤로 커서 이동 */

            const caret = document.createRange();

            caret.setStartAfter(bubble);
            caret.collapse(true);

            const selection = window.getSelection();

            selection.removeAllRanges();
            selection.addRange(caret);

            saveSelection();

            updateToolbarState();
        }
    );

    /* =====================================================
       상대방 말풍선 (버전 2) 기능 추가
    ===================================================== */
    bubbleOtherButton.addEventListener(
        "click",
        () => {
            if (!hasSavedSelection()) {
                return;
            }

            focusEditorWithSelection();

            const range = currentRange();

            if (!range) {
                return;
            }

            const startBubble = closestBubble(range.startContainer);
            const endBubble = closestBubble(range.endContainer);

            // 이미 말풍선 안의 글자를 선택했다면 해제 기능은 공유
            if (startBubble && startBubble === endBubble) {
                unwrapElement(startBubble);
                saveSelection();
                updateToolbarState();
                return;
            }

            // 선택한 텍스트를 '상대방 말풍선(.bubble-other)'으로 감싸기
            const fragment = range.extractContents();
            const bubble = document.createElement("div");

            bubble.className = "bubble bubble-other"; // 👈 핵심: 버전 2 클래스 적용
            bubble.appendChild(fragment);

            bubble.querySelectorAll(".bubble").forEach(unwrapElement);

            range.insertNode(bubble);

            if (!bubble.nextSibling) {
                bubble.after(createEmptyLine());
            }

            if (!bubble.previousSibling) {
                bubble.before(createEmptyLine());
            }

            const caret = document.createRange();
            caret.setStartAfter(bubble);
            caret.collapse(true);

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(caret);

            saveSelection();
            updateToolbarState();
        }
    );


    /* =====================================================
       텍스트 박스 기능 추가
    ===================================================== */
    
    function updateBoxColorDisplay() {
        boxColorButton.style.backgroundColor = settings.boxColor;
        boxColorInput.value = settings.boxColor;
    }

    function closestBox(node) {
        const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        return element ? element.closest(".message-box") : null;
    }

    boxButton.addEventListener("click", () => {
        if (!hasSavedSelection()) return;
        focusEditorWithSelection();
        const range = currentRange();
        if (!range) return;

        const startBox = closestBox(range.startContainer);
        const endBox = closestBox(range.endContainer);

        // 이미 텍스트 박스 안이라면 해제
        if (startBox && startBox === endBox) {
            unwrapElement(startBox);
            saveSelection();
            updateToolbarState();
            return;
        }

        const fragment = range.extractContents();
        const box = document.createElement("div");
        box.className = "message-box";
        box.style.backgroundColor = settings.boxColor;
        box.appendChild(fragment);

        box.querySelectorAll(".message-box, .bubble").forEach(unwrapElement);
        range.insertNode(box);

        if (!box.nextSibling) box.after(createEmptyLine());
        if (!box.previousSibling) box.before(createEmptyLine());

        const caret = document.createRange();
        caret.setStartAfter(box);
        caret.collapse(true);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(caret);

        saveSelection();
        updateToolbarState();
    });

    boxColorInput.addEventListener("input", () => {
        settings.boxColor = boxColorInput.value;
        saveSettings();
        updateBoxColorDisplay();

        // 현재 커서가 박스 안에 있다면 해당 박스 색상도 실시간 변경
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const box = closestBox(range.startContainer);
            if (box) {
                box.style.backgroundColor = settings.boxColor;
            }
        }
    });


    /* =====================================================
       글꼴 / 글자 크기
    ===================================================== */

    fontSelect.addEventListener(
        "change",
        () => {

            settings.fontFamily = fontSelect.value;

            applyTypography();
            saveSettings();
        }
    );

    fontSizeDown.addEventListener(
        "click",
        () => changeFontSize(-1)
    );

    fontSizeUp.addEventListener(
        "click",
        () => changeFontSize(1)
    );


    /* =====================================================
       행간 / 자간
    ===================================================== */

    lineHeightRange.addEventListener(
        "input",
        () => {

            settings.lineHeight = Number(lineHeightRange.value);

            applyTypography();
            saveSettings();
        }
    );

    letterSpacingRange.addEventListener(
        "input",
        () => {

            settings.letterSpacing = Number(letterSpacingRange.value);

            applyTypography();
            saveSettings();
        }
    );

    spacingReset.addEventListener(
        "click",
        () => {

            settings.lineHeight = defaultSettings.lineHeight;
            settings.letterSpacing = defaultSettings.letterSpacing;

            applyTypography();
            saveSettings();
        }
    );

    /* =====================================================
       여백
    ===================================================== */
    paddingRange.addEventListener(
        "input",
        () => {
            settings.editorPadding = Number(paddingRange.value);
            applyTypography();
            saveSettings();
        }
    );

    paddingReset.addEventListener(
        "click",
        () => {
            settings.editorPadding = defaultSettings.editorPadding;
            applyTypography();
            saveSettings();
        }
    );


    /* =====================================================
       배경 선택
    ===================================================== */

    bgOptions.forEach(button => {
        button.addEventListener("click", () => {
            const bgType = button.getAttribute("data-bg");

            // 이미지 배경을 선택했는데 아직 등록된 이미지가 없다면 갤러리 열기
            if (bgType === "image" && !bgImage) {
                bgImageInput.click();
                return;
            }

            // 설정값 변경 및 적용
            settings.bgType = bgType;
            
            // 시각적으로 선택된 버튼 표시 (CSS의 .active 활용)
            bgOptions.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            applyBackground();
            saveSettings();
        });
    });

    bgImagePick.addEventListener(
        "click",
        () => bgImageInput.click()
    );

    bgImageInput.addEventListener(
        "change",
        async () => {

            const file = bgImageInput.files && bgImageInput.files[0];

            if (!file) {
                return;
            }

            try {

                const result = await processImageFile(file);

                bgImage = result.dataUrl;

                settings.bgType = "image";
                settings.bgTextLight = result.isDark;

                try {

                    localStorage.setItem(IMAGE_KEY, bgImage);

                } catch (error) {

                    alert(
                        "이미지가 커서 기기에 저장하지 못했습니다.\n" +
                        "이번에만 사용할 수 있고, 새로고침하면 사라집니다."
                    );
                }

                applyBackground();
                saveSettings();

            } catch (error) {

                console.error(error);

                alert("이미지를 불러오는 중 문제가 발생했습니다.");
            }

            /* 같은 사진을 다시 골라도 change 가 발생하도록 */

            bgImageInput.value = "";
        }
    );

    blurToggle.addEventListener(
        "change",
        () => {

            settings.bgBlurOn = blurToggle.checked;

            applyBackground();
            saveSettings();
        }
    );

    blurRange.addEventListener(
        "input",
        () => {

            settings.bgBlurSize = Number(blurRange.value);

            applyBackground();
            saveSettings();
        }
    );


    /* =====================================================
       설정 창 열기 / 닫기 (행간·자간, 배경)
    ===================================================== */

    const popovers = [
        { panel: spacingPanel, button: spacingButton },
        { panel: backgroundPanel, button: backgroundButton },
        { panel: paddingPanel, button: paddingButton }
    ];

    function closePopovers() {

        popovers.forEach(({ panel, button }) => {

            panel.classList.remove("show");

            panel.setAttribute("aria-hidden", "true");

            button.classList.remove("active");
        });
    }

    function togglePopover(target) {

        const isOpen = target.panel.classList.contains("show");

        closePopovers();

        if (isOpen) {
            return;
        }

        /* 설정바 바로 아래에 표시 */

        target.panel.style.top =
            `${toolbar.offsetTop + toolbar.offsetHeight + 6}px`;

        target.panel.classList.add("show");

        target.panel.setAttribute("aria-hidden", "false");

        target.button.classList.add("active");
    }

    popovers.forEach(target => {

        target.button.addEventListener(
            "click",
            () => togglePopover(target)
        );
    });

    /* 다른 곳을 누르면 설정 창 닫기 */

    document.addEventListener(
        "pointerdown",
        (event) => {

            if (
                event.target.closest(
                    ".popover, #spacingButton, #backgroundButton, #paddingButton, .bg-option, #bgImagePick, #blurToggle, input[type='range']"
                )
            ) {
                return;
            }

            closePopovers();
        }
    );


    /* =====================================================
       붙여넣기: 글자만 붙여넣기
    ===================================================== */

    editor.addEventListener(
        "paste",
        (event) => {

            event.preventDefault();

            const text =
                (event.clipboardData || window.clipboardData)
                    .getData("text/plain");

            document.execCommand("insertText", false, text);
        }
    );


    /* =====================================================
       글자 입력 시 자동 스크롤 (커서 따라가기) 추가됨
    ===================================================== */
    editor.addEventListener(
        "input",
        () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = document.createElement("span");
                try {
                    range.insertNode(span);
                    span.scrollIntoView({ block: "nearest", behavior: "smooth" });
                    span.remove();
                } catch (e) {
                    editor.scrollTop = editor.scrollHeight;
                }
            }
        }
    );

    /* =====================================================
       말풍선 내부에서 엔터 입력 시 말풍선 바깥으로 탈출
    ===================================================== */
    /* =====================================================
       말풍선 내부에서 엔터 입력 시 말풍선 바깥으로 탈출 (수정본)
    ===================================================== */
    editor.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const range = selection.getRangeAt(0);
                const bubble = closestBubble(range.startContainer);

                const box = closestBox(range.startContainer);
                
                const target = bubble || box;

                if (target) {
                    event.preventDefault(); // 기본 줄바꿈 방지

                    // 말풍선 바깥 바로 아래에 일반 텍스트 입력을 위한 빈 줄 생성
                    const newLine = document.createElement("div");
                    const br = document.createElement("br");
                    newLine.appendChild(br);

                    // 말풍선 요소 바로 뒤에 삽입
                    target.after(newLine);

                    // 커서를 새로 만든 빈 줄의 맨 앞으로 이동시켜 말풍선 속성 완전 해제
                    const newRange = document.createRange();
                    newRange.setStart(br, 0);
                    newRange.collapse(true);
                    
                    selection.removeAllRanges();
                    selection.addRange(newRange);

                    saveSelection();
                    updateToolbarState();
                }
            }
        }
    );

    /* =====================================================
       캐시(기기 저장 설정) 삭제 기능 추가
    ===================================================== */

    clearCacheButton.addEventListener(
        "click",
        () => {
            const confirmed = window.confirm(
                "기기에 저장된 설정과 배경 이미지 캐시를 모두 삭제하시겠습니까?\n(확인 시 초기화되며 페이지가 새로고침됩니다.)"
            );

            if (!confirmed) {
                return;
            }

            // 기기에 저장된 설정 키 제거
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(IMAGE_KEY);

            // 초기화를 위해 페이지 새로고침
            window.location.reload();
        }
    );


    /* =====================================================
       전체 삭제
    ===================================================== */

    clearButton.addEventListener(
        "click",
        () => {

            if (editor.textContent.trim().length === 0) {
                return;
            }

            const confirmed = window.confirm(
                "작성한 내용을 모두 삭제할까요?"
            );

            if (!confirmed) {
                return;
            }

            editor.innerHTML = "";

            editorWrapper.style.height = "";
            editorWrapper.style.width = "";

            savedRange = null;

            editor.focus();
        }
    );


    /* =====================================================
       PNG 저장용 폰트 대기 및 html-to-image 캡처
    ===================================================== */

    /* PNG 저장 전에 글꼴이 실제로 로드되었는지 확인 */
    async function ensureFontsReady() {
        if (!document.fonts || !document.fonts.load) {
            return;
        }

        const size = `${settings.fontSize}px`;
        const family = `"${settings.fontFamily}"`;
        const text = editor.textContent;

        try {
            await Promise.all([
                document.fonts.load(`400 ${size} ${family}`, text),
                document.fonts.load(`700 ${size} ${family}`, text)
            ]);
            await document.fonts.ready;
        } catch (error) {
            console.warn("글꼴 로딩 확인 실패", error);
        }
    }

    saveImageButton.addEventListener("click", async () => {
        if (!window.htmlToImage) {
            alert("이미지 저장 기능을 불러오지 못했습니다. 페이지를 새로고침 해주세요.");
            return;
        }

        try {
            // 1. 폰트가 렌더링될 때까지 대기
            await ensureFontsReady();

            // 2. 캡처 시 레이아웃 오차 및 우측 여백/말풍선 줄바꿈 문제 원인 차단
            const originalHeight = editorWrapper.style.height;
            const originalAspectRatio = editorWrapper.style.aspectRatio;
            const originalWidth = editorWrapper.style.width;
            const originalMarginLeft = editorWrapper.style.marginLeft;
            const originalMarginRight = editorWrapper.style.marginRight;

            // 캡처 순간에만 래퍼의 박스 모델을 정확한 정방향(오른쪽 여백 제거 및 너비 고정)으로 강제 보정
            editorWrapper.style.aspectRatio = "auto";
            editorWrapper.style.width = "100%";
            editorWrapper.style.marginLeft = "0";
            editorWrapper.style.marginRight = "0";

            // 브라우저가 변경된 레이아웃을 계산할 수 있도록 대기
            await new Promise(resolve => setTimeout(resolve, 50));

            const scrollHeight = editor.scrollHeight;
            const exactWidth = editorWrapper.clientWidth; // 정확한 내부 너비 측정 (우측 여백 원인 차단)

            editorWrapper.style.height = `${scrollHeight}px`;
            editor.style.overflowY = "hidden"; // 캡처 시 스크롤바 숨김

            // 말풍선 내부 텍스트가 좁아지지 않도록 대기
            await new Promise(resolve => setTimeout(resolve, 100));

            // 3. html-to-image로 고해상도 캡처 (화질 대폭 개선)
            const scale = 3; // 기존 2배율에서 3배율 고해상도로 상향 조정

            const blob = await htmlToImage.toBlob(editorWrapper, {
                pixelRatio: scale, 
                quality: 1.0,
                width: exactWidth,
                height: scrollHeight,
                canvasWidth: exactWidth * scale,
                canvasHeight: scrollHeight * scale,
                style: {
                    margin: "0",
                    width: `${exactWidth}px`,
                    height: `${scrollHeight}px`,
                    aspectRatio: "auto",
                    fontFamily: editor.style.fontFamily
                }
            });

            // 4. 조작했던 스타일 원상 복구
            editorWrapper.style.height = "";
            editorWrapper.style.aspectRatio = originalAspectRatio;
            editorWrapper.style.width = "";
            editorWrapper.style.marginLeft = "";
            editorWrapper.style.marginRight = "";
            editor.style.overflowY = "visible";

            // 5. 공유 창 띄우기 (아이폰 사진첩 직행) 또는 일반 다운로드
            const file = new File([blob], "excerpt.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: '발췌기 이미지'
                });
            } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "excerpt.png";
                a.click();
                URL.revokeObjectURL(url);
            }

        } catch (error) {
            console.error(error);
            alert("이미지 캡처 중 문제가 발생했습니다.");
            
            // 오류 발생 시에도 무조건 원래 상태로 복구
            editorWrapper.style.height = "";
            editorWrapper.style.aspectRatio = "";
            editorWrapper.style.width = "";
            editorWrapper.style.marginLeft = "";
            editorWrapper.style.marginRight = "";
            editor.style.overflowY = "visible";
        }
    });

    /* =====================================================
       현재 서식 버튼 상태
    ===================================================== */

    function updateToolbarState() {

        const selection = window.getSelection();

        if (
            !selection ||
            selection.rangeCount === 0 ||
            !editor.contains(selection.anchorNode)
        ) {

            return;
        }

        // 굵게 버튼
        boldButton.classList.toggle(
            "applied",
            document.queryCommandState("bold")
        );

        // 기울임 버튼
        italicButton.classList.toggle(
            "applied",
            document.queryCommandState("italic")
        );

        // 취소선 버튼
        strikeButton.classList.toggle(
            "applied",
            document.queryCommandState("strikeThrough")
        );

        const range = selection.getRangeAt(0);

        const currentBubble = closestBubble(range.startContainer);
        const currentBox = closestBox(range.startContainer);

        // 형광펜 버튼
        highlightButton.classList.toggle(
            "applied",
            !range.collapsed && isRangeHighlighted(range)
        );

        // 말풍선 버튼들
        bubbleButton.classList.toggle(
            "applied",
            Boolean(currentBubble && !currentBubble.classList.contains("bubble-other"))
        );

        bubbleOtherButton.classList.toggle(
            "applied",
            Boolean(currentBubble && currentBubble.classList.contains("bubble-other"))
        );

        boxButton.classList.toggle(
            "applied",
            Boolean(currentBox)
        );
    }


    /* =====================================================
       선택 영역 변화 감지
       (툴바 버튼을 눌러 선택이 풀려도 마지막 선택을 기억)
    ===================================================== */

    document.addEventListener(
        "selectionchange",
        () => {

            saveSelection();

            updateToolbarState();
        }
    );


    /* =====================================================
       초기 실행
    ===================================================== */

    loadGoogleFonts();

    createFontOptions();

    applyTypography();

    applyBackground();

    updateHighlightColorDisplay();

    updateBoxColorDisplay();

});