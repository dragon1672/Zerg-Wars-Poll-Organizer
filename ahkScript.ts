

export const ahkScriptContent = `
; Zerg Wars Poll Organizer - Discord Poll Helper
; Version 2.0.1
;
; This AutoHotKey script automates the creation of polls in Discord as standard messages
; with automatic emoji reactions, using a text file from the Zerg Wars Poll Organizer.
;
; INSTRUCTIONS:
; 1. In the Poll Organizer app, click "Export" > "Export for AutoHotKey (.txt)" and save the file.
; 2. Double-click this script file ("DiscordPollHelper.ahk") to run it.
; 3. A file selection dialog will appear. Choose the .txt file you just exported.
; 4. A message box will appear. After you click "OK", you will have 5 seconds.
; 5. During these 5 seconds, switch to Discord and click inside the chat input box where you want the polls to be created.
; 6. The script will automatically post each poll as a formatted message and then add numbered emoji reactions (1️⃣, 2️⃣, etc.).
; 7. Please do not use your mouse or keyboard while the script is running.
;
; REQUIREMENTS:
; - AutoHotKey v1.1 or later must be installed (https://www.autohotkey.com/).
; - The Discord desktop application.
; - The '+' key must be the shortcut to 'Add Reaction' on a selected message (this is the default).

#SingleInstance Force
#Warn
SendMode Input

; --- Script Configuration ---
timeToFocus := 5000     ; Time to wait for user to focus Discord window (in milliseconds)
shortDelay := 200       ; Delay between sending commands to Discord (allows UI to update)
longDelay := 700        ; Delay between submitting one poll and starting the next one
threadOptionInMenu := 8 ; How many "up" arrows to get to "create thread"

; --- Main Script ---

; 1. Ask the user for the poll data file
FileSelectFile, pollFile, 3, %A_ScriptDir%, Select Polls File, Text Documents (*.txt)
if not pollFile
{
    MsgBox, 0, Script Canceled, No file selected. Exiting script.
    ExitApp
}

; 2. Give the user time to switch to the Discord window
MsgBox, 4, Begin Automation, Ready to start creating polls.\`n\`nClick OK, then you will have %timeToFocus% / 1000 " seconds to click on the Discord chat box."
IfMsgBox, Cancel
    ExitApp

Sleep, %timeToFocus%

; 3. Define the emoji names for reactions
emojiNames := ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten"]

; 4. Read the file and process each poll
FileRead, fileContents, %pollFile%
pollsArray := StrSplit(fileContents, "\`n---\`n")

Loop, % pollsArray.MaxIndex()
{
    currentLine := RTrim(pollsArray[A_Index], "\`r\`n ") ; Trim whitespace and newlines

    if (Trim(currentLine) == "")
    {
        continue
    }

    pollParts := StrSplit(currentLine, "|")

    if (pollParts.Length() < 2)
    {
        MsgBox, 0, Warning, Found an invalid line in the poll file:\`n\`n%currentLine%\`n\`nSkipping this line.
        continue
    }

    question := pollParts[1]
    optionsCount := pollParts.Length() - 1

    ; --- Build and Send the Poll Message ---
    pollMessage := question ; Descriptions can now contain Discord markdown
    pollMessage .= "\`n"
    Loop, %optionsCount%
    {
        optionIndex := A_Index + 1
        currentOption := pollParts[optionIndex]
        pollMessage .= "\`n  " . A_Index . ". " . currentOption
    }

    ; Use clipboard for reliability with special characters and multi-line content
    Clipboard := pollMessage
    Send, ^v
    Sleep, %shortDelay%
    Send, {Enter}
    Sleep, %longDelay%

    ; --- Add Emoji Reactions ---
    Send, {Up}       ; Selects the last message for editing
    Sleep, %shortDelay%
    Send, {Escape}   ; Exits edit mode but keeps the message focused
    Sleep, %shortDelay%

    Loop, %optionsCount%
    {
        if (A_Index > emojiNames.MaxIndex())
        {
            break ; Stop if there are more than 10 options
        }

        Send, {+} ; This opens the 'Add Reaction' menu on the focused message.
        Sleep, %shortDelay%

        emojiName := emojiNames[A_Index]
        Send, :%emojiName%:
        Sleep, %shortDelay%
        
        Send, {Enter} ; Select the emoji from the list
        Sleep, %shortDelay%
    }
    
    Sleep, %longDelay% ; Wait before starting the next poll
}

MsgBox, 0, Finished, All polls from the file have been created.
ExitApp
`;

export const ahkThreadScriptContent = `
; Zerg Wars Poll Organizer - Discord Poll Helper (with Threads)
; Version 2.2.0
;
; This AutoHotKey script automates the creation of polls in Discord.
;
; SCRIPT BEHAVIOR:
; 1. Posts a poll message.
; 2. Creates a new Discord thread from that message using the provided thread title.
; 3. Adds number emoji reactions (1️⃣, 2️⃣, etc.) to the original message.
;
; INSTRUCTIONS:
; 1. In the Poll Organizer, click "Export" > "Export for AutoHotKey with Threads (.txt)".
; 2. Run this script. It will ask you to select the exported .txt file.
; 3. Click OK on the next dialog and then you will have 5 seconds to focus the Discord chat box.
; 4. The script will run automatically. Do not use your mouse or keyboard until it is finished.
;
; NAVIGATION WARNING:
; This script relies on keyboard navigation (Tab, Shift+Tab, Arrow Keys) to create threads.
; Discord updates can break this. The current navigation sequence is:
; - Shift+Tab (3 times) from a focused message to reach the 'More' menu.
; - Up Arrow (10 times) within the menu to select 'Create Thread'.
; If this fails, you may need to adjust the number of key presses in the script.

#SingleInstance Force
#Warn
SendMode Input

; --- Script Configuration ---
timeToFocus := 5000
shortDelay := 200
longDelay := 1000 ; Increased delay to allow Discord UI to keep up with thread creation
threadNavDelay := 500
keyPressDelay := 50 ; Short delay between individual key presses for reliability

; --- Main Script ---

; 1. Ask the user for the poll data file
FileSelectFile, pollFile, 3, %A_ScriptDir%, Select Polls File (for Threads), Text Documents (*.txt)
if not pollFile
{
    MsgBox, 0, Script Canceled, No file selected. Exiting script.
    ExitApp
}

; 2. Give the user time to switch to the Discord window
MsgBox, 4, Begin Automation, Ready to start creating polls with threads.\`n\`nClick OK, then you will have %timeToFocus% / 1000 " seconds to click on the Discord chat box."
IfMsgBox, Cancel
    ExitApp

Sleep, %timeToFocus%

; 3. Define the emoji names for reactions
emojiNames := ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten"]

; 4. Read the file and process each poll
FileRead, fileContents, %pollFile%
pollsArray := StrSplit(fileContents, "\`n---\`n")

Loop, % pollsArray.MaxIndex()
{
    currentLine := RTrim(pollsArray[A_Index], "\`r\`n ")

    if (Trim(currentLine) == "")
    {
        continue
    }

    pollParts := StrSplit(currentLine, "|")

    if (pollParts.Length() < 3)
    {
        MsgBox, 0, Warning, Found an invalid line for thread format:\`n\`n%currentLine%\`n\`nSkipping this line. It must contain a thread title, description, and at least one option.
        continue
    }

    threadTitle := pollParts[1]
    question := pollParts[2]
    optionsCount := pollParts.Length() - 2

    ; --- Step 1: Build and Send the Poll Message ---
    pollMessage := question
    pollMessage .= "\`n"
    Loop, %optionsCount%
    {
        optionIndex := A_Index + 2
        currentOption := pollParts[optionIndex]
        pollMessage .= "\`n  " . A_Index . ". " . currentOption
    }

    Clipboard := pollMessage
    Send, ^v
    Sleep, %shortDelay%
    Send, {Enter}
    Sleep, %longDelay%

    ; --- Step 2: Create Thread ---
    Send, {Up}       ; Select the last message to normalize navigating to "more"
    Sleep, %shortDelay%
    Send, {Escape}   ; Exits edit mode but keeps the message focused
    Sleep, %shortDelay%
    Send, +{Tab 3} ; Navigate to the 'More' (...) menu on the focused message
    Sleep, %threadNavDelay%
    Send, {Enter} ; Open the menu
    Sleep, %threadNavDelay%

    ; Navigate up to 'Create Thread' with delays for reliability
    Loop, %threadOptionInMenu%
    {
        Send, {Up}
        Sleep, %keyPressDelay%
    }
    
    Sleep, %threadNavDelay%
    Send, {Enter} ; Select 'Create Thread'
    Sleep, %longDelay% ; Wait for 'Create Thread' modal

	Sleep, %shortDelay%
    Send, . ; Send a period as the starting message
    Sleep, %shortDelay%
    
    Send, +{Tab 2} ; Navigate to thread title
    Sleep, %shortDelay%

    Clipboard := threadTitle
    Send, ^v ; Paste thread title
    Sleep, %shortDelay%
    
    Send, {Enter} ; Create the thread
    Sleep, %longDelay%

    Send, {Escape} ; Close the thread pane on the right to return to the main channel
    Sleep, %longDelay%

    ; --- Step 3: Add Emoji Reactions ---
    Send, {Up} ; Re-select the poll message as focus is lost after thread creation
    Sleep, %shortDelay%
    Send, {Escape}
    Sleep, %shortDelay%

    Loop, %optionsCount%
    {
        if (A_Index > emojiNames.MaxIndex())
        {
            break
        }
        Send, {+}
        Sleep, %shortDelay%
        emojiName := emojiNames[A_Index]
        Send, :%emojiName%:
        Sleep, %shortDelay%
        Send, {Enter}
        Sleep, %shortDelay%
    }
    
    Sleep, %longDelay% ; Wait before starting the next poll
}

MsgBox, 0, Finished, All polls from the file have been created.
ExitApp
`;
