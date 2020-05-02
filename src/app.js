let openAddRatioModalInitialized = false
let inputValues = {
    x: 16,
    y: 9,
    w: 1920,
    h: 0,
    lastKnownInFocus: 'none',
    whichIsLocked: 'none',
    countInvalid: 0
}

// Setup preset list
let presets = []
let presetList = document.getElementById('ratio-list')

function initListOfPresets() {
    window.readPresetsFromDisk.then((result) => {
        presets = result
        refreshPresetList()
    })
}

function refreshPresetList() {
    presetList.innerHTML = ''
    presets.forEach((preset, index) => {
        if (preset !== null) {
            let li = document.createElement('li')
            li.innerText = preset.title
            li.dataset.x = preset.x
            li.dataset.y = preset.y
            li.dataset.h = preset.h
            li.dataset.index = index
            li.addEventListener('click', (event) => {
                let self = event.target
                loadPreset(self.dataset.x, self.dataset.y, self.dataset.h)
            })
            presetList.appendChild(li)
        }
    })
}

function addPresetToList(preset) {
    presets.push(preset)
    refreshPresetList()
    window.savePresetsOnDisk()
}

function removePresetFromList(index) {
    delete presets[index]
    refreshPresetList()
    window.savePresetsOnDisk()
}

function validatePreset(preset) {
    let result = {
        errors: 0,
        message: ''
    }

    if (preset.title == "") {
        result.errors++
        result.message = "Missing title.\n"
    }

    if (valueIsInvalid(preset.x)) {
        result.errors++
        result.message += "Missing X value.\n"
    }

    if (valueIsInvalid(preset.y)) {
        result.errors++
        result.message += "Missing Y value.\n"
    }

    if (valueIsInvalid(preset.h)) {
        result.errors++
        result.message += "Missing Height value."
    }

    return result
}

let addNewPresetBtn = document.getElementById('add-new-ratio-btn')
addNewPresetBtn.addEventListener('click', () => {
    openAddRatioModal()
})

// Setup aspect ratio decimal and string
// from bottom bar
let aspectRatioDecimal = document.getElementById('aspect-ratio-decimal')
let aspectRatioString = document.getElementById('aspect-ratio-string')
function setupBottombar() {
    // Save aspect ratio
    let saveAspectRatioBtn = document.getElementById('save-aspect-ratio-btn')
    saveAspectRatioBtn.addEventListener('click', () => {
        openAddRatioModal(true)
    })

    // Aspect ratio copy
    let aspectRatioDecimalCopy = document.getElementById('aspect-ratio-decimal-copy')
    let aspectRatioStringCopy = document.getElementById('aspect-ratio-string-copy')
    aspectRatioDecimalCopy.addEventListener('click', () => {
        copyToClipboard(aspectRatioDecimal.innerHTML)
    })
    aspectRatioStringCopy.addEventListener('click', () => {
        copyToClipboard(aspectRatioString.innerText)
    })
}

function openAddRatioModal(saveCurrent = false) {
    let modal = document.getElementById('add-new-ratio-modal')
    let p = document.getElementById('modal-message')
    let title = document.getElementById('add-new-title')
    let x = document.getElementById('add-new-x')
    let y = document.getElementById('add-new-y')
    let h = document.getElementById('add-new-height')

    if (saveCurrent) {
        title.value = ''
        x.value = inputValues.x
        y.value = inputValues.y
        h.value = inputValues.h
        if (inputValues.h <= 0) {
            h.value = y.value * 2
        }
    } else {
        // Clean inputs
        title.value = ''
        x.value = ''
        y.value = ''
        h.value = ''
    }

    p.classList.remove('show')
    modal.classList.add('show')

    if (!openAddRatioModalInitialized) {
        openAddRatioModalInitialized = true
        title.addEventListener('keyup', () => { p.classList.remove('show') })
        x.addEventListener('keyup', () => { p.classList.remove('show') })
        y.addEventListener('keyup', () => { p.classList.remove('show') })
        h.addEventListener('keyup', () => { p.classList.remove('show') })

        setInputFilter(x, (value) => {
            inputValues.lastKnownInFocus = 'x'
            return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
        })
        setInputFilter(y, (value) => {
            inputValues.lastKnownInFocus = 'x'
            return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
        })
        setInputFilter(h, (value) => {
            inputValues.lastKnownInFocus = 'x'
            return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
        })

        let negative = modal.querySelector('.negative')
        negative.addEventListener('click', () => {
            modal.classList.remove('show')
        })

        let positive = modal.querySelector('.positive')
        positive.addEventListener('click', () => {
            // Get data
            let preset = {
                title: title.value,
                x: x.value,
                y: y.value,
                h: h.value
            }

            // Validate
            let resultValidation = validatePreset(preset)
            if (resultValidation.errors == 0) {
                addPresetToList(preset)
                modal.classList.remove('show')

                Toastify({
                    text: "Preset saved",
                    duration: 2000,
                    gravity: "bottom",
                    position: 'right',
                    backgroundColor: "rgba(1,1,1,0.9)",
                }).showToast();
            } else {
                p.innerText = ''
                p.textContent = resultValidation.message
                p.classList.add('show')
            }
        })
    }
}

function setupTopbar() {
    // Setup swap aspect ratio
    let swapAspectRatioBtn = document.getElementById('swap-aspect-ratio-btn')
    swapAspectRatioBtn.addEventListener('click', (event) => {
        let oldX = inputValues.x
        let oldY = inputValues.y
        inputValues.x = oldY
        inputValues.y = oldX
        iX.value = inputValues.x
        iY.value = inputValues.y
        inputValues.whichIsLocked = 'h'
        solveRatio()
        console.log("Aspect ratio values swapped!");
    })

    // Times 2
    let x2Btn = document.getElementById('x2-btn')
    x2Btn.addEventListener('click', () => {
        inputValues.w *= 2
        inputValues.h *= 2
        setInputFromValues()
    })
    // Times 3
    let x3Btn = document.getElementById('x3-btn')
    x3Btn.addEventListener('click', () => {
        inputValues.w *= 3
        inputValues.h *= 3
        setInputFromValues()
    })
    // Divide by 2
    let d2Btn = document.getElementById('d2-btn')
    d2Btn.addEventListener('click', () => {
        inputValues.w /= 2
        inputValues.h /= 2
        setInputFromValues()
    })
    // Divide by 3
    let d3Btn = document.getElementById('d3-btn')
    d3Btn.addEventListener('click', () => {
        inputValues.w /= 3
        inputValues.h /= 3
        setInputFromValues()
    })
}

// Setup draw rectangle
window.addEventListener('resize', () => {
    draw()
});
let canvasPanel = document.getElementById('canvas-panel')
let rect = document.getElementById('rect')

// Get input fields
let iX = document.getElementById('input-x')
let iY = document.getElementById('input-y')
let iW = document.getElementById('input-w')
let iH = document.getElementById('input-h')

function setupFieldsEvents() {
    setInputFilter(iX, function (value) {
        inputValues.lastKnownInFocus = 'x'
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
    });
    setInputFilter(iY, function (value) {
        inputValues.lastKnownInFocus = 'y'
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
    });
    setInputFilter(iW, function (value) {
        inputValues.lastKnownInFocus = 'w'
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
    });
    setInputFilter(iH, function (value) {
        inputValues.lastKnownInFocus = 'h'
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only.
    });

    iX.addEventListener('keyup', (event) => {
        if (iX.value != '') solveRatio();
    })
    iY.addEventListener('keyup', (event) => {
        if (iY.value != '') solveRatio();
    })
    iW.addEventListener('keyup', (event) => {
        if (iW.value != '') solveRatio();
    })
    iH.addEventListener('keyup', (event) => {
        if (iH.value != '') solveRatio();
    })

    iX.addEventListener('focus', () => {
        if (inputValues.whichIsLocked == 'x') {
            inputValues.whichIsLocked = 'y'
        }
    })
    iY.addEventListener('focus', () => {
        if (inputValues.whichIsLocked == 'y') {
            inputValues.whichIsLocked = 'x'
        }
    })
    iW.addEventListener('focus', () => {
        if (inputValues.whichIsLocked == 'w') {
            inputValues.whichIsLocked = 'h'
        }
    })
    iH.addEventListener('focus', () => {
        if (inputValues.whichIsLocked == 'h') {
            inputValues.whichIsLocked = 'w'
        }
    })

    // Copy buttons
    document.getElementById('input-x-copy-btn').addEventListener('click', () => {
        copyToClipboard(iX.value)
    })
    document.getElementById('input-y-copy-btn').addEventListener('click', () => {
        copyToClipboard(iY.value)
    })
    document.getElementById('input-w-copy-btn').addEventListener('click', () => {
        copyToClipboard(iW.value)
    })
    document.getElementById('input-h-copy-btn').addEventListener('click', () => {
        copyToClipboard(iH.value)
    })
}

function loadPreset(x, y, h) {
    console.log('Loading preset ' + x + ':' + y)
    inputValues.x = x
    inputValues.y = y
    inputValues.h = h
    inputValues.whichIsLocked = 'w'
    setInputFromValues()
    solveRatio()
}

function valueIsInvalid(value) {
    return (isNaN(value) || value == 0 || value == '')
}

function setInputFromValues() {
    iX.value = inputValues.x
    iY.value = inputValues.y
    iW.value = inputValues.w
    iH.value = inputValues.h
}

function getValuesFromInput() {
    inputValues.x = iX.value
    inputValues.y = iY.value
    //inputValues.x = Math.abs(Math.floor(iX.value))
    //inputValues.y = Math.abs(Math.floor(iY.value))
    inputValues.w = Math.abs(Math.floor(iW.value))
    inputValues.h = Math.abs(Math.floor(iH.value))

    // Which is locked?
    let countInvalid = 0
    if (valueIsInvalid(inputValues.x)) {
        inputValues.whichIsLocked = 'x'
        countInvalid++
    }
    if (valueIsInvalid(inputValues.y)) {
        inputValues.whichIsLocked = 'y'
        countInvalid++
    }
    if (valueIsInvalid(inputValues.w)) {
        inputValues.whichIsLocked = 'w'
        countInvalid++
    }
    if (valueIsInvalid(inputValues.h)) {
        inputValues.whichIsLocked = 'h'
        countInvalid++
    }

    // Update invalid count
    inputValues.countInvalid = countInvalid
    console.log(countInvalid)


}

function solveRatio() {
    getValuesFromInput();

    // Reset color
    iX.classList.remove('accent');
    iY.classList.remove('accent');
    iW.classList.remove('accent');
    iH.classList.remove('accent');

    // Can be solve?
    if (inputValues.countInvalid < 2) {

        let ratio = 1

        if (inputValues.whichIsLocked == 'x' || inputValues.whichIsLocked == 'y') {
            ratio = inputValues.w / inputValues.h
            if (inputValues.whichIsLocked == 'x') {
                inputValues.x = Math.round(ratio * inputValues.y)
                iX.classList.add('accent');
            } else {
                inputValues.y = Math.round(inputValues.x / ratio)
                iY.classList.add('accent');
            }
        } else if (inputValues.whichIsLocked == 'w' || inputValues.whichIsLocked == 'h') {
            ratio = inputValues.x / inputValues.y
            if (inputValues.whichIsLocked == 'w') {
                inputValues.w = Math.round(ratio * inputValues.h)
                iW.classList.add('accent');
            } else {
                inputValues.h = Math.round(inputValues.w / ratio)
                iH.classList.add('accent');
            }
        }

        aspectRatioDecimal.innerHTML = ratio.toFixed(3)
        aspectRatioString.innerHTML = inputValues.x + ":" + inputValues.y

        setInputFromValues();
        draw();
    } else {
        console.log("Can not be solve!");
    }
}

function setInputFilter(textbox, inputFilter) {
    // Restricts input for the given textbox to the given inputFilter function.
    ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
        textbox.addEventListener(event, function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    });
}

function draw() {
    let canvasWidth = canvasPanel.clientWidth
    let canvasHeight = canvasPanel.clientHeight

    let finalSize = getScaledDimension(
        { width: inputValues.w, height: inputValues.h },
        { width: canvasWidth, height: canvasHeight }
    )

    // Rect size
    rect.style.width = finalSize.width + 'px'
    rect.style.height = finalSize.height + 'px'

    // Center rect
    let top = (canvasHeight / 2) - (finalSize.height / 2)
    let left = (canvasWidth / 2) - (finalSize.width / 2)
    rect.style.top = top + 'px'
    rect.style.left = left + 'px'
    console.log('Rectangle updated ' + top + '-' + left);
}

function getScaledDimension(imgSize, boundary) {
    let original_width = imgSize.width
    let original_height = imgSize.height
    let bound_width = boundary.width
    let bound_height = boundary.height
    let new_width = original_width
    let new_height = original_height

    if (original_height < 500) {
        original_width *= 2
        original_height *= 2
    }

    if (original_width > bound_width) {
        new_width = bound_width
        new_height = (new_width * original_height) / original_width
    }

    if (new_height > bound_height) {
        new_height = bound_height
        new_width = (new_height * original_width) / original_height
    }

    return { width: new_width, height: new_height }
}

function copyToClipboard(value) {
    window.remoteCopyToClipboard(value)
    Toastify({
        text: "Copied!",
        duration: 2000,
        gravity: "bottom",
        position: 'right',
        backgroundColor: "rgba(1,1,1,0.9)",
    }).showToast();
}

function generateImageFileName() {
    return 'template_' + inputValues.w + 'x' + inputValues.h + '.png'
}

function saveImageAsPng(filePath) {
    const canvas = document.getElementById('gl-canvas')
    canvas.width = inputValues.w
    canvas.height = inputValues.h
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true })

    if (gl === null) {
        console.log("Unable to initialize WebGL. Your browser or machine may not support it.")
        return
    }

    gl.clearColor(0.141, 0.545, 0.984, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT)

    const image = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, "")
    window.fs.writeFile(filePath, image, 'base64', function (err) {
        console.log(err)
    })
}

// Start
initListOfPresets()
setupFieldsEvents()
setupTopbar()
setupBottombar()
setInputFromValues()
solveRatio()
