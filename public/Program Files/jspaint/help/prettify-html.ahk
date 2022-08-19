; AutoHotkey script for formatting HTML with DirtyMarkup
; They actually have an API, but I decided to go this route instead of... looking for a CLI... which does exist

; Usage:
; * Open https://www.10bestdesign.com/dirtymarkup/
; * Check "Allow proprietary attributes"
; * Switch to your editor where you have some HTML
; * Press F12

F12::
; SetKeyDelay, 69, 69
; (extra) delays are needed only for interacting with the webpage
; so I've done sleeps below instead
; (they might also be needed if the editor is a webpage)
OriginalClipboard := ClipboardAll
Clipboard :=
WinGet, CodeEditorWinID, ID, A
Send, ^a
Send, ^c
ClipWait, 1
If ErrorLevel
{
	MsgBox, Failed to copy from code editor (no change to clipboard in timeout period)
	Goto, ResetAndEnd
}
If Trim(Clipboard) =
{
	MsgBox, Failed to copy from code editor (clipboard empty)
	Goto, ResetAndEnd
}
WinActivate, DirtyMarkup
WinWaitActive, DirtyMarkup, , 1
If ErrorLevel
{
	MsgBox, Failed to activate DirtyMarkup; I'm not gonna open it for u just open it lol (and focus the tab)
	Goto, ResetAndEnd
}
Click, 420, 420
Sleep, 50
Send, ^a
Sleep, 150 ; not sure this needs to be higher
Send, ^v
Sleep, 150 ; not sure this needs to be higher
Click, 69, 420
Clipboard :=
Click, 420, 420
Sleep, 50
Send, ^a
Sleep, 50
Send, ^c
ClipWait, 1
If ErrorLevel
{
	MsgBox, Failed to copy from DirtyMarkup
	Goto, ResetAndEnd
}
WinActivate ahk_id %CodeEditorWinID%
Send, ^a
Send, ^v
ResetAndEnd:
Clipboard := OriginalClipboard
Return

; Shortcut to move to next file
; This could be set up in your editor instead
F11::
Send ^0 ; Ctrl+0 focuses the sidebar in VS Code
Send {Down}{Enter}
Return
