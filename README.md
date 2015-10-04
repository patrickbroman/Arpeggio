# Arpeggio

Arpeggio is a javascript library and a set of web apps used to visualize and teach music theory developed by [@patrickbroman].

## Usage

In any of the apps directories, you'll need to copy the config.js.example to to a file named config.js in the same directory. Then, just open the index.html file in your browser.

Note that the resolution is 1920x1080, so you might need to zoom out a bit in your browser to fit the canvas in you window.

If you enable recording in the config file, things will be very slow, as each frame will be rendered to video in 1920x1080 at 60 fps. When the number of seconds of video specified in the config file have been rendered, recording will stop and the video url will be opened. 

[@patrickbroman]: <https://twitter.com/patrickbroman>
