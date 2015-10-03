var gAllNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function Key(index) {
    var steps = [2, 2, 1, 2, 2, 2, 1];
    var triadSuffixes = ["", "m", "m", "", "", "m", "dim"];
    var seventhSuffixes = ["maj7", "m7", "7m", "7", "maj7", "m7", "dim7"];
    this.name = gAllNotes[index];
    this.notes = [];
    this.chords = [];
    // Compute all the notes in the key
    for(var i = 0; i < 7; i++) {
        var note = gAllNotes[index];
        this.notes[i] = note;
        index += steps[i];
        index %= gAllNotes.length;
    }

    for(var i = 0; i < 7; i++) {
        var tonic = this.notes[i];
        var third = this.notes[(i+2)%7];
        var fifth = this.notes[(i+4)%7];
        var seventh = this.notes[(i+6)%7];
        this.chords.push({
            triadName: tonic + triadSuffixes[i],
            seventhName: tonic + seventhSuffixes[i],
            notes: [tonic, third, fifth, seventh]
        });
    }
}

Key.prototype.indexOfNote = function(note) {
    return this.notes.indexOf(note);
}

Key.prototype.isKeyNote = function(note) {
    return this.indexOfNote(note) != -1;
}
