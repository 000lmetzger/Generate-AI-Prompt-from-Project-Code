document.addEventListener('DOMContentLoaded', () => {
    const browseButton = document.getElementById('browseButton');
    const filePathInput = document.getElementById('filePath');
    const copyButton = document.querySelector('#copyPrompt');
    const copyFeedback = document.getElementById('copyFeedback');
    const prompt = document.querySelector('#promptWrapper textarea');
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settings');
    const aboveInput = document.getElementById('aboveInput');
    const saveButton = document.getElementById('saveButton');

    let aboveInputDefault = "Here is the code of my entire Project. Please check for any errors in my code.";
    let fullPrompt = "";

    const printPromptToScreen = () => {
        prompt.value = fullPrompt;
    }

    const readPath = async (pathAbs, pathRel) => {
        const directoryContents = await window.electronAPI.listDirectoryContents(pathAbs);
        const fileContents = await window.electronAPI.readFileContents(pathAbs);

        for (const content of directoryContents) {
            const newPathAbs = pathAbs + "\\" + content;
            const newPathRel = ((pathRel.length > 0) ? (pathRel + ".") : (pathRel + "")) + content;

            if (fileContents.hasOwnProperty(content)) {
                fullPrompt += "\n\n" + newPathRel + "\n\n" + fileContents[content];
            }
            else {
                await readPath(newPathAbs, newPathRel);
            }
        }
    };

    browseButton.addEventListener('click', async () => {
        fullPrompt += aboveInputDefault;
        const result = await window.electronAPI.openFileDialog();
        if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
            fullPrompt = aboveInputDefault;
            filePathInput.value = result.filePaths[0];
            const generalPath = result.filePaths[0] + "\\main\\java";
            console.log("Root path:", generalPath);
            await readPath(generalPath, "");
            printPromptToScreen();
        } else {
            console.log('Ordnerauswahl abgebrochen.');
        }
    });

    copyButton.addEventListener('click', () => {
        
        navigator.clipboard.writeText(fullPrompt);
        if (fullPrompt.length > aboveInputDefault.length){
            copyFeedback.textContent = "Prompt copied into clipboard";
            copyFeedback.style.backgroundColor = 'rgb(59, 59, 59)';
        }
        else{
            copyFeedback.textContent = "Please select a path first.";
            copyFeedback.style.backgroundColor = 'rgb(175, 4, 4)';
        }
        copyFeedback.style.visibility = "visible";
        copyFeedback.style.opacity = 1;

        const showCopyFeedback = setTimeout(() => {
            copyFeedback.style.opacity = 0;
            setTimeout(() => {
                copyFeedback.style.visibility = 'hidden';
                copyFeedback.textContent = "";
            }, 500);
        }, 1300);
    });

    // If user edits the prompt by himself
    prompt.addEventListener('input', () => {
        fullPrompt = prompt.value;
    })

    // Open settings modal
    settingsButton.addEventListener('click', () => {
        // Disable all the other buttons
        settingsButton.border = 'none';
        settingsButton.disabled = true;
        browseButton.disabled = true;
        copyButton.disabled = true;
        settingsModal.style.display = 'flex';
        aboveInput.value = aboveInputDefault;
    })

    // Close settings modal
    saveButton.addEventListener('click', function (event) {
        event.preventDefault();
        settingsModal.style.display = 'none';
        settingsButton.border = '1px solid black';
        settingsButton.disabled = false;
        browseButton.disabled = false;
        copyButton.disabled = false;
        aboveInputDefault = aboveInput.value;
        console.log(aboveInputDefault);
        console.log('Settings saved');
    });
});