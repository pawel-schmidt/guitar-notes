import React, { useCallback, useEffect, useState } from "react";
import { render } from "react-dom";
import classNames from "classnames";
import "./style.scss";

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const chordNoteIndexes = [1, 3, 5];

const calcOffsetNote = (note, offset) => {
  const index = notes.indexOf(note);
  const newIndex = (index + offset) % notes.length;
  return notes[newIndex];
}

const createScale = (name, intervals) => {
  const intervalsSum = intervals.reduce((acc, i) => acc + i);
  if (intervalsSum !== notes.length) {
    throw new Error(
      `Intervals ${intervals.join(", ")} don't sum up to ${notes.length} in ${name} scale.`
    );
  }
  return {
    name,
    intervals
  };
};

const scales = [
  createScale("chromatic", [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]),
  createScale("major", [2, 2, 1, 2, 2, 2, 1]),
  createScale("minor", [2, 1, 2, 2, 1, 2, 2]),
  createScale("major pentatonic", [2, 2, 3, 2, 3]),
  createScale("minor pentatonic", [3, 2, 2, 3, 2]),
  createScale("root notes only", [12]),
];

const getNotesFromScale = (key, intervals) => {
  let totalInterval = 0;
  return intervals.map(interval => {
    const note = calcOffsetNote(key, totalInterval);
    totalInterval += interval;
    return note;
  });
}

const createTuning = (name, firstNotes) => {
  return {
    name,
    firstNotes,
  }
}

const tunings = [
  createTuning('standard', ["E", "A", "D", "G", "B", "E"]),
  createTuning('new standard', ["C", "G", "D", "A", "E", "G"]),
  createTuning('low D', ["D", "A", "D", "G", "B", "E"]),
]

const getStringNotes = startingNote => {
  const index = notes.indexOf(startingNote);
  return [...notes.slice(index), ...notes, ...notes.slice(0, index)];
};

const Note = ({ note, isRootNote, isScaleNote, isChordNote }) => {
  const className = classNames({
    note: true,
    "note--root-note": isRootNote,
    "note--scale-note": isScaleNote,
    "note--chord-note": isChordNote,
  });
  return <span className={className}>{note}</span>;
};

const App = () => {
  const [key, setKey] = useState();
  const [scale, setScale] = useState();
  const [tuning, setTuning] = useState(tunings[0]);

  const fretboardNotes = [...tuning.firstNotes].reverse().map(note => getStringNotes(note));
  const scaleNotes = key && scale && getNotesFromScale(key, scale.intervals);
  const chordNotes = scaleNotes && chordNoteIndexes.map(index => scaleNotes[index - 1]);
  console.log({ scaleNotes, chordNotes })

  const selectKey = useCallback(event => setKey(event.target.value), []);
  const selectScale = useCallback(event => setScale(scales.find(scale => scale.name === event.target.value)), []);
  const selectTuning = useCallback(event => setTuning(tunings.find(tuning => tuning.name === event.target.value)), []);

  useEffect(() => {
    setKey('C');
    setScale(scales[1]);
    setTuning(tunings[0]);
  }, []);
  return (
    <div>
      <div>
        <h3>Key</h3>
        <select onChange={selectKey} value={key}>
          <option disabled selected value> -- select a key -- </option>
          {notes.map(note => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>Scale</h3>
        <select onChange={selectScale} value={scale && scale.name}>
          <option disabled selected value> -- select a scale -- </option>
          {scales.map(scale => (
            <option key={scale.name} value={scale.name}>
              {scale.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>Tuning</h3>
        <select onChange={selectTuning} value={tuning && tuning.name}>
          <option disabled selected value> -- select a tuning -- </option>
          {tunings.map(tuning => (
            <option key={tuning.name} value={tuning.name}>
              {tuning.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <h3>Fretboard notes</h3>
        {fretboardNotes.map(stringNotes => (
          <div>
            {stringNotes.map(note => (
              <Note
                key={note}
                note={note}
                isRootNote={note === key}
                isScaleNote={scaleNotes && scaleNotes.includes(note)}
                isChordNote={chordNotes && chordNotes.includes(note)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

render(<App />, document.getElementById("root"));
