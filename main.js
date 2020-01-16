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
            <div class="row break">
                <label class="row">
                    <span>↕︎</span>
                    <input type="text" uxp-quiet="true" id="txtInput" value="" placeholder="List" />
                </label>
            </div>
            <footer><button id="load" type="submit" uxp-variant="cta">Load Data</button></footer>
            <footer><button id="create" type="submit" uxp-variant="cta">Create</button></footer>
        </form>
        <p id="warning">This plugin requires you to select a rectangle in the document. Please select a rectangle.</p>
        `

    function createTable() {
        const { editDocument } = require("application");
        const textInput = document.querySelector("#txtInput").value;

        editDocument({ editLabel: "Increase rectangle size" }, function (selection) {
            console.log(selection.items.length + " items are selected");
        
            // console.log('data::: ', data);
        
            const selectedRectangle = selection.items[0];
            // const widthRectangle = selectedRectangle.width;
            commands.group();
            const group = selection.items[0];
        
            // Create original Text
            
            const textInputed = new Text();
            textInputed.fill = new Color("#000000");
            textInputed.fontSize = 11;
            textInputed.width = 100;
            textInputed.text = textInput;
            group.addChildAfter(textInputed, selectedRectangle);
            
            selection.items = [textInputed, selectedRectangle];
            commands.alignRight();
            commands.alignLeft();
            commands.alignVerticalCenter();
            textInputed.moveInParentCoordinates(20,0);
            
            const texts = [textInput, textInput, textInput, textInput];
            // selectedRectangle.width = widthRectangle * texts.length;
            console.log('texts', texts);
            
            texts.forEach((e, i) => {
                console.log('e::: ', e);
                console.log('i::: ', i);
                selection.items = textInputed;
                commands.duplicate();
                selection.items[0].text = e;
                selection.items[0].name = e;
                group.addChildAfter(selection.items[0], selectedRectangle);
                selection.items = [selection.items[0], selectedRectangle];
                console.log('mode -> ', Number(100*(i+1)));
                selection.items[0].moveInParentCoordinates(Number(100*(i+1)),0);
            });
            
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
    console.log(selection.items.length + " items are selected");
    console.log('update');
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
    console.log('insertTextFromFileHandler');
    const aFile = await fs.getFileForOpening({ types: ["csv"] });
    if (!aFile)
        return;

    const contents = await aFile.read();

    if (!contents)
        return;
    
    console.log('contents:', contents);
    console.log('\n');

    const data = {};
    const rows = contents.split('\n');
    
    console.log('rows', rows);
    console.log('\n');
    
    rows.forEach((e, i) => {
        console.log('i::::::::::::::::', i);
        const row = e.split(',');
        console.log('row: ', row);
        
        data[i] = row;
        console.log('data[i] : ', data[i]);
    });
    
}

module.exports = {
    panels: {
        enlargeRectangle: {
            show,
            update
        }
    },
};
