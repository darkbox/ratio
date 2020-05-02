const { clipboard } = require('electron')
const contextMenu = require('electron-context-menu')
const fs = require('fs')
const { dialog } = require('electron').remote
const Store = require('electron-store');
const store = new Store();
const defaultPresets = [
    {
        title: '3:2',
        x: 3,
        y: 2,
        h: 600
    },
    {
        title: '4:3',
        x: 4,
        y: 3,
        h: 720
    },
    {
        title: '5:4',
        x: 5,
        y: 4,
        h: 600
    },
    {
        title: '5:9',
        x: 5,
        y: 9,
        h: 600
    },
    {
        title: '8:5',
        x: 8,
        y: 5,
        h: 600
    },
    {
        title: '16:9',
        x: 16,
        y: 9,
        h: 1080
    },
    {
        title: '16:10',
        x: 16,
        y: 10,
        h: 1440
    },
    {
        title: 'Cinema Film (US)',
        x: 1.85,
        y: 1,
        h: 1080
    },
    {
        title: 'Cinemascope',
        x: 2.35,
        y: 1,
        h: 1080
    },
    {
        title: 'iPhone X',
        x: 375,
        y: 812,
        h: 1624
    },
    {
        title: 'iPhone 8 Plus',
        x: 414,
        y: 736,
        h: 1472
    },
    {
        title: 'iPhone 8',
        x: 375,
        y: 667,
        h: 1334
    },
    {
        title: 'iPhone SE',
        x: 320,
        y: 568,
        h: 1136
    },
    {
        title: 'Google Pixel 2',
        x: 360,
        y: 640,
        h: 1280
    },
    {
        title: 'Google Pixel 2 XL',
        x: 360,
        y: 720,
        h: 1440
    },
    {
        title: 'iPad Mini/9.7"',
        x: 768,
        y: 1024,
        h: 2048
    },
    {
        title: 'iPad Pro 10.5"',
        x: 834,
        y: 1112,
        h: 2224
    },
    {
        title: 'iPad Pro 12.9"',
        x: 1024,
        y: 1366,
        h: 2732
    },
    {
        title: 'Surface Pro 3',
        x: 1440,
        y: 990,
        h: 1980
    },
    {
        title: 'Surface Pro 4',
        x: 1368,
        y: 912,
        h: 1824
    },
]

contextMenu({
    menu: actions => [
        actions.separator(),
        actions.copy({
            transform: content => `modified_copy_${content}`
        }),
        {
            label: 'Invisible',
            visible: false
        },
        actions.paste({
            transform: content => `modified_paste_${content}`
        })
    ],
    prepend: (defaultActions, params, browserWindow) => [
        {
            label: 'Save template as png',
            visible: isPositionInside(params.x, params.y, 'rect'),
            click: () => {
                let dialogResult = dialog.showSaveDialogSync(browserWindow, {
                    title: "Save image",
                    defaultPath: generateImageFileName(),
                    filters: [
                        { name: 'Images', extensions: ['png'] },
                    ]
                })
                if (typeof dialogResult !== 'undefined') {
                    saveImageAsPng(dialogResult)
                } else {
                    Toastify({
                        text: "Canceled!",
                        duration: 2000,
                        gravity: "bottom",
                        position: 'right',
                        backgroundColor: "rgba(1,0,0,0.9)",
                    }).showToast();
                }
            }
        },
        {
            label: 'Load preset',
            visible: isPositionInChilds(params.x, params.y, 'ratio-list'),
            click: () => {
                let el = getElementChildInPosition(params.x, params.y, 'ratio-list')
                loadPreset(el.dataset.x, el.dataset.y, el.dataset.h)
            }
        },
        {
            label: 'Remove preset',
            visible: isPositionInChilds(params.x, params.y, 'ratio-list'),
            click: () => {
                let el = getElementChildInPosition(params.x, params.y, 'ratio-list')
                removePresetFromList(el.dataset.index)
            }
        }
    ]
});

function isPositionInChilds(x, y, id) {
    let element = document.getElementById(id)

    for (i = 0; i < element.childNodes.length; i++) {
        let child = element.childNodes[i]
        if (((y >= child.getBoundingClientRect().top && y <= child.getBoundingClientRect().bottom)
            && (x >= child.getBoundingClientRect().left && x <= child.getBoundingClientRect().right))) {
            //console.log(child.dataset.index)
            return true
        }
    }

    return false
}

function getElementChildInPosition(x, y, id) {
    let element = document.getElementById(id)

    for (i = 0; i < element.childNodes.length; i++) {
        let child = element.childNodes[i]
        if (((y >= child.getBoundingClientRect().top && y <= child.getBoundingClientRect().bottom)
            && (x >= child.getBoundingClientRect().left && x <= child.getBoundingClientRect().right))) {
            return child
        }
    }

    return null
}

function isPositionInside(x, y, id) {
    let element = document.getElementById(id)
    return ((y >= element.getBoundingClientRect().top && y <= element.getBoundingClientRect().bottom)
        && (x >= element.getBoundingClientRect().left && x <= element.getBoundingClientRect().right))
}

window.fs = fs
window.readPresetsFromDisk = new Promise((resolve, reject) => {
    let presetsFromDisk = store.get('presets')
    if (typeof presetsFromDisk !== 'undefined') {
        // Loading stored presets from disk
        presets = presetsFromDisk
        resolve(presetsFromDisk)
    } else {
        // Load default presets
        console.log('Loading default presets...')
        presets = defaultPresets
        resolve(defaultPresets)
    }
})
window.savePresetsOnDisk = function () {
    store.set('presets', presets)
}
window.remoteCopyToClipboard = function (value) {
    clipboard.writeText(value)
}

console.log("Preload file loaded!")