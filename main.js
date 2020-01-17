const { selection, Text, Color } = require("scenegraph");
const fs = require("uxp").storage.localFileSystem;
let commands = require("commands");
let panel;

function create() {
    const HTML =
        `<style>
            .break {
                flex-wrap: wrap;
            }
            label.row > span {
                color: #8E8E8E;
                width: 20px;
                text-align: right;
                font-size: 9px;
            }
            label.row input {
                flex: 1 1 auto;
            }
            .show {
                display: block;
            }
            .hide {
                display: none;
            }
        </style>
        <form method="dialog" id="main">
            <footer><button id="load" type="submit" uxp-variant="cta">Load Data</button></footer>
            <footer><button id="create" type="submit" uxp-variant="cta">Create</button></footer>
        </form>
        <p id="warning">This plugin requires you to select a rectangle in the document. Please select a rectangle.</p>
        `

    function createTable() {
        const { editDocument } = require("application");
        // const textInput = document.querySelector("#txtInput").value;
        
        // console.log('data>>>>>>>>>>>>>>>>>>>>>>\n', data[0]);

        editDocument({ editLabel: "Increase rectangle size" },  async function (selection) {
            // console.log(selection.items.length + " items are selected");
            
            const data = await insertTextFromFileHandler();
            // console.log('data<><><><><><><><><><><>\n', data[0]);
        
            const selectedRectangle = selection.items[0];
            const widthRectangle = selectedRectangle.width;
            const heightRectangle = selectedRectangle.height;
            
            commands.group();
            const group = selection.items[0];
        
            // Create original Text

            // console.log('data[0][0]>>>>>>>:::', data[0][0]);
            
            const textInputed = new Text();
            textInputed.fill = new Color("#000000");
            textInputed.fontSize = 11;
            textInputed.text = data[0][0];

            group.addChildAfter(textInputed, selectedRectangle);
            
            selection.items = [textInputed, selectedRectangle];
            commands.alignRight();
            commands.alignLeft();
            commands.alignVerticalCenter();
            textInputed.moveInParentCoordinates(16,0);
            
            const texts = data[0];
            // console.log('texts:::' + texts)
            selectedRectangle.width = widthRectangle * texts.length;
            // console.log('texts', texts);
            
            texts.forEach((e, i) => {
                if (e === "") {
                    e = "___"
                }
                // console.log('e::: ', e);
                // console.log('i::: ', i);
                selection.items = textInputed;
                commands.duplicate();
                selection.items[0].text = e;
                selection.items[0].name = e;
                group.addChildAfter(selection.items[0], selectedRectangle);
                selection.items = [selection.items[0], selectedRectangle];
                if (i == 0){
                    selection.items[0].moveInParentCoordinates(16,0);
                } else {
                    selection.items[0].moveInParentCoordinates(Number( widthRectangle * (i+1) ),0);
                }
            });
            
            textInputed.removeFromParent();

            selection.items = group;
            commands.duplicate();
            selection.items[0].moveInParentCoordinates(0,heightRectangle-1);

            // const newGroup = selection.items[0];
            // commands.duplicate();
            // newGroup.moveInParentCoordinates(heightRectangle -1,0);
            
        })
    }

    panel = document.createElement("div");
    panel.innerHTML = HTML;
    panel.querySelector("#load").addEventListener('click', insertTextFromFileHandler);
    panel.querySelector("#create").addEventListener('click', createTable);

    return panel;
}

function show(event) {
    if (!panel) event.node.appendChild(create());
}

function update() {
    // console.log(selection.items.length + " items are selected");
    // console.log('update');
    console.log(selection.items);
    const { Rectangle } = require("scenegraph");
    let form = document.querySelector("form");
    let warning = document.querySelector("#warning");
    if (!selection || !(selection.items[0] instanceof Rectangle)) {
        form.className = "hide";
        warning.className = "show";
    } else {
        form.className = "show";
        warning.className = "hide";
    }
}

async function insertTextFromFileHandler() {
    // console.log('>>> insertTextFromFileHandler');
    const aFile = await fs.getFileForOpening({ types: ["csv"] });
    if (!aFile)
        return;

    const contents = await aFile.read();

    if (!contents)
        return;
    
    // console.log('contents:', contents);
    // console.log('\n');

    const data = {};
    const rows = contents.split('\n');
    
    // console.log('rows', rows);
    // console.log('\n');
    
    rows.forEach((e, i) => {
        // console.log('i::::::::::::::::', i);
        const row = e.split(',');
        // console.log('row: ', row);
        
        data[i] = row;
        // console.log('data[i] : ', data[i]);
    });
    // console.log('data::::::::::::::::::::::::::::::::::::::::::::::: ', data , '\n');
    return data;
    
}

module.exports = {
    panels: {
        enlargeRectangle: {
            show,
            update
        }
    },
};
