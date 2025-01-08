#!/bin/bash

# Recursively search for all files named "config.js.example" and create a "config.js" copy.
find . -type f -name "config.js.example" | while read -r file; do
    # Get the directory of the file
    dir=$(dirname "$file")
    # Set the target file name
    target="$dir/config.js"
    # Check if the target file already exists
    if [ -e "$target" ]; then
        echo "Skipping: $target already exists"
    else
        # Copy the example file to config.js
        cp "$file" "$target"
        echo "Created: $target"
    fi
done
