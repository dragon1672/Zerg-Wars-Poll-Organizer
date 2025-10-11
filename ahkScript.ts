
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
timeToFocus := 5000  ; Time to wait for user to focus Discord window (in milliseconds)
shortDelay := 500    ; Delay between sending commands to Discord (allows UI to update)
longDelay := 1000    ; Delay between submitting one poll and starting the next one

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
    pollMessage := "**" . question . "**"
    Loop, %optionsCount%
    {
        optionIndex := A_Index + 1
        currentOption := pollParts[optionIndex]
        pollMessage .= "\`n" . A_Index . ". " . currentOption
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

        ; FIX: In AHK v1, 'Send +' is for the Shift modifier. '{+}' must be used to send a literal plus sign.
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