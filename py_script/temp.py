import win32gui
import time

# Get the handle of the desktop window
desktop_hwnd = win32gui.GetDesktopWindow()

# Get the initial size of the desktop window
last_size = win32gui.GetWindowRect(desktop_hwnd)

while True:
    # Wait for a short period of time
    time.sleep(0.1)

    # Get the current size of the desktop window
    current_size = win32gui.GetWindowRect(desktop_hwnd)

    # Check if the size of the desktop window has changed
    if current_size != last_size:
        print("Screenshot taken!")

        # Do something here, such as playing a sound or sending a notification

        # Update the last_size variable
        last_size = current_size
