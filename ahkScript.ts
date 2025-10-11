
export const ahkScriptContent = `
; Zerg Wars Poll Organizer - Discord Poll Helper by AHarmlessTaco's request
; Version 1.0.0
;
; This AutoHotKey script automates the creation of polls in Discord using a specially formatted text file
; exported from the Zerg Wars Poll Organizer web application.
;
; INSTRUCTIONS:
; 1. In the Poll Organizer app, click "Export" > "Export for AutoHotKey (.txt)" and save the file.
; 2. Double-click this script file ("DiscordPollHelper.ahk") to run it.
; 3. A file selection dialog will appear. Choose the .txt file you just exported.
; 4. A message box will appear. After you click "OK", you will have 5 seconds.
; 5. During these 5 seconds, switch to Discord and click inside the chat input box where you want the polls to be created.
; 6. The script will then begin typing out and submitting each poll automatically.
; 7. Please do not use your mouse or keyboard while the script is running.
;
; REQUIREMENTS:
; - AutoHotKey v1.1 or later must be installed (https://www.autohotkey.com/).
; - The Discord desktop application with the cursor ready in a chat box.

#SingleInstance Force
#Warn
SendMode Input

; --- Script Configuration ---
; Time to wait for user to focus Discord window (in milliseconds)
timeToFocus := 5000
; Delay between sending commands to Discord (allows UI to update)
shortDelay := 500
; Delay between submitting one poll and starting the next one
longDelay := 2000

; --- Main Script ---

; 1. Ask the user for the poll data file
FileSelectFile, pollFile, 3, %A_ScriptDir%, Select Polls File, Text Documents (*.txt)
if not pollFile
{
    MsgBox, 0, Script Canceled, No file selected. Exiting script.
    ExitApp
}

; 2. Give the user time to switch to the Discord window
MsgBox, 4, Begin Automation, Ready to start creating polls.\`n\`nClick OK, then you will have % timeToFocus / 1000 " seconds to click on the Discord chat box."
IfMsgBox, Cancel
    ExitApp

Sleep, %timeToFocus%

; 3. Read the file and process each poll
FileRead, fileContents, %pollFile%
pollsArray := StrSplit(fileContents, "\`n---\`n")

Loop, % pollsArray.MaxIndex()
{
    currentLine := pollsArray[A_Index]

    ; Ignore empty lines
    if (Trim(currentLine) == "")
    {
        continue
    }

    ; Split the line into question and options. The delimiter is "|"
    pollParts := StrSplit(currentLine, "|")

    if (pollParts.Length() < 2)
    {
        MsgBox, 0, Warning, Found an invalid line in the poll file (less than 2 parts):\`n\`n%currentLine%\`n\`nSkipping this line.
        continue ; Skip invalid lines
    }

    question := pollParts[1]
    
    ; Start the Discord /poll command
    Send, /poll{Tab}
    Sleep, %shortDelay%

    ; Enter the poll question
    SendRaw, %question%
    Send, {Tab}
    Sleep, %shortDelay%

    ; Loop through and enter each option
    Loop, % pollParts.Length() - 1
    {
        optionIndex := A_Index + 1
        currentOption := pollParts[optionIndex]
        SendRaw, %currentOption%
        Send, {Tab}
        Sleep, %shortDelay%
    }

    ; Submit the poll by sending Enter
    Send, {Enter}
    Sleep, %longDelay% ; Wait for Discord to process before starting the next poll
}

MsgBox, 0, Finished, All polls from the file have been created.
ExitApp
`;
