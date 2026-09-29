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

    const clearButton = document.getElementById("clearButton");
    
    const saveSquareButton = document.getElementById("saveSquareButton");
    const savePortraitButton = document.getElementById("savePortraitButton");

    const editorWrapper = document.querySelector(".editor-wrapper");
    const viewSquareBtn = document.getElementById("viewSquareBtn");
    const viewPortraitBtn = document.getElementById("viewPortraitBtn");


    /* =====================================================
       코드에서 미리 지정하는 값
    ===================================================== */

    /* 형광펜 투명도 (0 ~ 100) */
    const HIGHLIGHT_OPACITY = 50;

    /*
     * 글꼴 목록
     * - name    : Google Fonts 에 등록된 글꼴 이름 (정확히 일치해야 함)
     * - weights : 불러올 굵기. 굵기가 하나뿐인 글꼴은 생략
     *
     * 목록은 아래 배열만 수정하면 됩니다.
     * (첫 번째 글꼴이 기본 글꼴)
     */
    const FONT_LIST = [
        { name: "Gowun Batang", weights: "400;700" },
        { name: "Gowun Dodum" },
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

            const margin = getBlurMargin();

            editorBgImage.style.display = "block";

            editorBgImage.style.backgroundImage =
                `url("${bgImage}")`;

            /* 블러 가장자리가 비치지 않도록 바깥으로 넓혀서 채움 */
            editorBgImage.style.top = `${-margin}px`;
            editorBgImage.style.left = `${-margin}px`;
            editorBgImage.style.right = `${-margin}px`;
            editorBgImage.style.bottom = `${-margin}px`;

            editorBgImage.style.filter = settings.bgBlurOn
                ? `blur(${settings.bgBlurSize}px)`
                : "none";

            editorBg.style.backgroundColor = "#000000";

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

        bgOptions.forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.bg === settings.bgType
            );
        });

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
        bubbleButton
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

        button.addEventListener(
            "click",
            () => {

                const type = button.dataset.bg;

                /* 아직 불러온 이미지가 없으면 갤러리 열기 */

                if (type === "image" && !bgImage) {

                    bgImageInput.click();

                    return;
                }

                settings.bgType = type;

                applyBackground();
                saveSettings();
            }
        );
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

                if (bubble) {
                    event.preventDefault(); // 기본 줄바꿈 방지

                    // 말풍선 바깥 바로 아래에 일반 텍스트 입력을 위한 빈 줄 생성
                    const newLine = document.createElement("div");
                    const br = document.createElement("br");
                    newLine.appendChild(br);

                    // 말풍선 요소 바로 뒤에 삽입
                    bubble.after(newLine);

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

            savedRange = null;

            editor.focus();
        }
    );


    /* =====================================================
       PNG 저장용: 배경 이미지 그리기 / 블러
    ===================================================== */

    function drawCover(context, image, width, height) {

        const scale = Math.max(
            width / image.naturalWidth,
            height / image.naturalHeight
        );

        const drawWidth = image.naturalWidth * scale;
        const drawHeight = image.naturalHeight * scale;

        context.drawImage(
            image,
            (width - drawWidth) / 2,
            (height - drawHeight) / 2,
            drawWidth,
            drawHeight
        );
    }

    /* 한 방향 박스 블러 */

    function blurPass(source, target, width, height, radius, horizontal) {

        const length = horizontal ? width : height;
        const lines = horizontal ? height : width;

        const step = horizontal ? 4 : width * 4;
        const lineStep = horizontal ? width * 4 : 4;

        const divisor = radius * 2 + 1;

        for (let line = 0; line < lines; line++) {

            const base = line * lineStep;

            for (let channel = 0; channel < 4; channel++) {

                let sum = 0;

                for (let k = -radius; k <= radius; k++) {

                    const index = Math.min(length - 1, Math.max(0, k));

                    sum += source[base + index * step + channel];
                }

                for (let i = 0; i < length; i++) {

                    target[base + i * step + channel] = sum / divisor;

                    const add = Math.min(length - 1, i + radius + 1);
                    const sub = Math.max(0, i - radius);

                    sum +=
                        source[base + add * step + channel] -
                        source[base + sub * step + channel];
                }
            }
        }
    }

    /* 박스 블러 3회 ≈ 가우시안 블러 (CSS blur 와 비슷한 결과) */

    function gaussianBlur(data, width, height, sigma) {

        const radius = Math.max(
            1,
            Math.round((Math.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2)
        );

        const buffer = new Uint8ClampedArray(data.length);

        for (let i = 0; i < 3; i++) {

            blurPass(data, buffer, width, height, radius, true);
            blurPass(buffer, data, width, height, radius, false);
        }
    }

    /*
     * 저장할 PNG 크기에 맞춘 배경 이미지 canvas
     * factor : PNG 너비 / 화면 입력창 너비 (블러 크기를 화면과 같은 비율로 맞춤)
     */

    async function buildBackgroundCanvas(width, height, factor, pixelRatio) {

        const image = await loadImageElement(bgImage);

        const sigma = settings.bgBlurOn
            ? settings.bgBlurSize * factor
            : 0;

        const margin = sigma > 0 ? Math.ceil(sigma * 2) : 0;

        /* 블러가 있으면 어차피 흐려지므로 1배 해상도로 처리 */

        const ratio = sigma > 0 ? 1 : pixelRatio;

        const fullWidth = Math.round((width + margin * 2) * ratio);
        const fullHeight = Math.round((height + margin * 2) * ratio);

        const canvas = document.createElement("canvas");

        canvas.width = fullWidth;
        canvas.height = fullHeight;

        const context = canvas.getContext("2d");

        drawCover(context, image, fullWidth, fullHeight);

        if (sigma > 0) {

            const imageData =
                context.getImageData(0, 0, fullWidth, fullHeight);

            gaussianBlur(imageData.data, fullWidth, fullHeight, sigma);

            context.putImageData(imageData, 0, 0);
        }

        if (margin === 0) {
            return canvas;
        }

        const cropped = document.createElement("canvas");

        cropped.width = width;
        cropped.height = height;

        cropped.getContext("2d").drawImage(
            canvas,
            margin,
            margin,
            width,
            height,
            0,
            0,
            width,
            height
        );

        return cropped;
    }

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

    /* =====================================================
       미리보기 비율 전환 기능 (1:1 / 4:5)
    ===================================================== */
    viewSquareBtn.addEventListener("click", () => {
        editorWrapper.classList.remove("portrait");
        viewSquareBtn.classList.add("active");
        viewPortraitBtn.classList.remove("active");
    });

    viewPortraitBtn.addEventListener("click", () => {
        editorWrapper.classList.add("portrait");
        viewPortraitBtn.classList.add("active");
        viewSquareBtn.classList.remove("active");
    });


    /* =====================================================
       PNG 저장 공통 함수 (화면 줄바꿈 완벽 유지 방식)
    ===================================================== */

    async function handleSave(targetWidth, targetHeight, fileNamePrefix) {

        if (editor.textContent.trim().length === 0) {
            alert("저장할 내용이 없습니다.");
            return;
        }

        try {

            await loadHtml2Canvas();

            await ensureFontsReady();

            const PNG_WIDTH = targetWidth;
            const MIN_HEIGHT = targetHeight;

            // 현재 화면의 에디터 실제 너비 기준 설정 (줄바꿈 어긋남 방지)
            const currentWidth = editor.getBoundingClientRect().width;
            const scaleFactor = PNG_WIDTH / currentWidth; // 1080px로 맞추기 위한 확대 배율

            /* ---------------------------------------------
            입력 내용 복제 (화면과 동일한 너비 유지)
            --------------------------------------------- */

            const clone = editor.cloneNode(true);

            clone.removeAttribute("id");
            clone.removeAttribute("contenteditable");


            /* ---------------------------------------------
            캡처용 임시 영역 (화면 크기 그대로 생성)
            --------------------------------------------- */

            const captureArea = document.createElement("div");

            captureArea.style.position = "absolute";
            captureArea.style.left = "-99999px";
            captureArea.style.top = "0";
            captureArea.style.width = `${currentWidth}px`; // 👈 화면과 정확히 같은 너비
            captureArea.style.boxSizing = "border-box";
            captureArea.style.padding = `${settings.editorPadding}px`;
            captureArea.style.backgroundColor = "transparent";
            captureArea.style.border = "none";
            captureArea.style.margin = "0";
            captureArea.style.overflow = "visible";


            /* ---------------------------------------------
            복제된 입력창 스타일 적용
            --------------------------------------------- */

            clone.style.width = "100%";
            clone.style.height = "auto";
            clone.style.minHeight = "0";
            clone.style.margin = "0";
            clone.style.padding = "0";
            clone.style.border = "none";
            clone.style.borderRadius = "0";
            clone.style.outline = "none";
            clone.style.background = "transparent";
            clone.style.overflow = "visible";
            clone.style.boxSizing = "border-box";


            const highlightSpans = clone.querySelectorAll('span[style*="background-color"]');
            
            highlightSpans.forEach(span => {
                const bgColor = span.style.backgroundColor;
                
                // 투명한 배경이 아닌 실제 형광펜 색상이 있는 경우에만 실행
                if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
                    // 이모지나 공백이 깨지지 않도록 배열로 분해
                    const textArr = Array.from(span.textContent);
                    span.textContent = ''; 
                    
                    textArr.forEach(char => {
                        const charSpan = document.createElement("span");
                        charSpan.textContent = char;
                        charSpan.style.backgroundColor = bgColor;
                        span.appendChild(charSpan);
                    });
                    
                    // 덩어리로 묶여있던 거대한 부모 배경색은 투명하게 제거
                    span.style.backgroundColor = 'transparent'; 
                }
            });


            captureArea.appendChild(clone);

            document.body.appendChild(captureArea);


            /* ---------------------------------------------
            실제 내용 높이 계산
            --------------------------------------------- */

            const contentHeight = clone.scrollHeight;

            const captureHeight = Math.max(
                currentWidth,
                contentHeight + settings.editorPadding * 2
            );

            captureArea.style.height = `${captureHeight}px`;

            /* ---------------------------------------------
            형광펜 위치를 브라우저 계산값으로 직접 수집
            (html2canvas 가 인라인 배경을 줄 단위로 그리지 못해
             문장 전체가 칠해지는 문제 방지)
            --------------------------------------------- */

            const highlightRects = [];

            const areaRect = captureArea.getBoundingClientRect();

            const textWalker = document.createTreeWalker(
                clone,
                NodeFilter.SHOW_TEXT
            );

            while (textWalker.nextNode()) {

                const textNode = textWalker.currentNode;

                let color = null;

                let element = textNode.parentElement;

                while (element && element !== clone) {

                    if (
                        element.style &&
                        element.style.backgroundColor &&
                        !isTransparent(element.style.backgroundColor)
                    ) {
                        color = element.style.backgroundColor;
                        break;
                    }

                    element = element.parentElement;
                }

                if (!color) {
                    continue;
                }

                const inBubble = Boolean(
                    textNode.parentElement.closest(".bubble")
                );

                const textRange = document.createRange();

                textRange.selectNodeContents(textNode);

                Array.from(textRange.getClientRects()).forEach(rect => {

                    if (rect.width > 0 && rect.height > 0) {

                        highlightRects.push({
                            x: rect.left - areaRect.left,
                            y: rect.top - areaRect.top,
                            width: rect.width,
                            height: rect.height,
                            color,
                            inBubble
                        });
                    }
                });
            }

            /* html2canvas 가 그리지 않도록 원래 형광펜 배경 제거 */

            clone.querySelectorAll("[style]").forEach(el => {

                if (
                    el.style.backgroundColor &&
                    !isTransparent(el.style.backgroundColor)
                ) {
                    el.style.backgroundColor = "transparent";
                }
            });



            /* ---------------------------------------------
            화면 기준 고화질 캡처 (scaleFactor로 1080px 확대)
            --------------------------------------------- */

            const textCanvas = await html2canvas(
                captureArea,
                {
                    backgroundColor: null,
                    scale: scaleFactor * 1.5, // 👈 선명도를 높이기 위한 추가 배율
                    width: currentWidth,
                    height: captureHeight,
                    windowWidth: currentWidth,
                    windowHeight: captureHeight,
                    scrollX: 0,
                    scrollY: 0,
                    useCORS: true,
                    logging: false,
                    letterRendering: true
                }
            );


            /* ---------------------------------------------
            임시 영역 제거
            --------------------------------------------- */

            captureArea.remove();


            /* ---------------------------------------------
            최종 1080px 캔버스에 맞추어 배경과 합성
            --------------------------------------------- */

            const finalHeight = Math.max(MIN_HEIGHT, Math.round(textCanvas.height * (PNG_WIDTH / textCanvas.width)));

            const output = document.createElement("canvas");

            output.width = PNG_WIDTH;
            output.height = finalHeight;

            const context = output.getContext("2d");

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";

            const useImage =
                settings.bgType === "image" && bgImage;

            if (useImage) {

                const backgroundCanvas =
                    await buildBackgroundCanvas(
                        PNG_WIDTH,
                        finalHeight,
                        1,
                        1
                    );

                context.drawImage(
                    backgroundCanvas,
                    0,
                    0,
                    PNG_WIDTH,
                    finalHeight
                );

            } else {

                const bg =
                    BACKGROUNDS[settings.bgType] || BACKGROUNDS.white;

                context.fillStyle = bg.color;

                context.fillRect(0, 0, PNG_WIDTH, finalHeight);
            }

            /* 형광펜: 글자 아래에 직접 그림 (글자 캡처와 같은 비율) */

            const rectScaleX = PNG_WIDTH / currentWidth;
            const rectScaleY = finalHeight / captureHeight;

            const drawHighlights = (inBubble) => {

                highlightRects
                    .filter(rect => rect.inBubble === inBubble)
                    .forEach(rect => {

                        context.fillStyle = rect.color;

                        context.fillRect(
                            rect.x * rectScaleX,
                            rect.y * rectScaleY,
                            rect.width * rectScaleX,
                            rect.height * rectScaleY
                        );
                    });
            };

            drawHighlights(false);

            // 텍스트를 1080px 규격에 맞춰 비율대로 깔끔하게 그림
            context.drawImage(textCanvas, 0, 0, PNG_WIDTH, finalHeight);

            /* 말풍선 안의 형광펜은 말풍선 배경에 가려지므로 글자 위에 겹침 */

            drawHighlights(true);


            /* ---------------------------------------------
            새 창 미리보기 (아이폰 꾹 눌러 저장)
            --------------------------------------------- */

            const dataUrl = output.toDataURL("image/png");

            const newWindow = window.open();
            
            if (newWindow) {
                newWindow.document.write(`
                    <!DOCTYPE html>
                    <html lang="ko">
                    <head>
                        <meta charset="UTF-8">
                        <title>발췌 이미지 저장</title>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                        <style>
                            * { box-sizing: border-box; }
                            body {
                                margin: 0;
                                background: #121212;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                min-height: 100vh;
                                color: #ffffff;
                                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                padding: 20px;
                            }
                            .img-container {
                                max-width: 100%;
                                max-height: 80vh;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                            }
                            img {
                                max-width: 100%;
                                max-height: 80vh;
                                object-fit: contain;
                                border-radius: 12px;
                                box-shadow: 0 8px 30px rgba(0,0,0,0.6);
                            }
                            p {
                                margin-top: 20px;
                                font-size: 15px;
                                font-weight: 500;
                                color: #cccccc;
                                text-align: center;
                                line-height: 1.4;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="img-container">
                            <img src="${dataUrl}" alt="발췌 이미지">
                        </div>
                        <p>꾹 눌러서 저장</p>
                    </body>
                    </html>
                `);
                newWindow.document.close();
            } else {
                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `${fileNamePrefix}_${getDateString()}.png`;
                document.body.appendChild(link);
                link.click();
                link.remove();
            }


        } catch (error) {

            console.error("PNG 저장 오류:", error);

            alert("이미지를 저장하는 중 문제가 발생했습니다.");
        }
    }


    /* =====================================================
       html2canvas 불러오기
    ===================================================== */

    function loadHtml2Canvas() {

        return new Promise(
            (resolve, reject) => {

                /* 이미 불러와져 있다면 종료 */

                if (typeof html2canvas !== "undefined") {

                    resolve();

                    return;
                }

                const script = document.createElement("script");

                script.src =
                    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

                script.onload = () => resolve();

                script.onerror = () => {

                    reject(
                        new Error("html2canvas를 불러오지 못했습니다.")
                    );
                };

                document.head.appendChild(script);
            }
        );
    }


    /* =====================================================
       PNG 파일 이름
    ===================================================== */

    function getDateString() {

        const now = new Date();

        const pad = (value) => String(value).padStart(2, "0");

        return (
            `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
            `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
        );
    }


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

});