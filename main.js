var recorder;
var recording = false;
var pause = false;
var staves = [];
var chunks = [];

var musicData = 
//{"ID": "A002", "clef": "treble", "timeSignature": "4/4", "notes": ["A/3.q", "B/3.q", "B/3.q", "C/4.q", "C/4.q", "B/3.q", "B/3.q", "A/3.q", "A/3.q", "B/3.q", "B/3.q", "C/4.q", "C/4.q", "A/3.q", "C/4.h", "A/3.q", "B/3.q", "B/3.q", "C/4.q", "C/4.q", "B/3.q", "B/3.q", "A/3.q", "A/3.q", "B/3.q", "B/3.q", "C/4.q", "A/3.q", "C/4.q", "A/3.h"], "text": ["la", "si", "si", "do", "do", "si", "si", "la", "la", "si", "si", "do", "do", "la", "do", "la", "si", "si", "do", "do", "si", "si", "la", "la", "si", "si", "do", "la", "do", "la"],  "colors": ["", "", "", "", "", "", "", "red", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]};
//{"ID": "A007", "clef": "treble", "timeSignature": "4/4", "notes": ["E/4.q", "F#/4.q", "F#/4.q", "G/4.q", "G/4.q", "F#/4.q", "F#/4.q", "E/4.q", "E/4.q", "F#/4.q", "F#/4.q", "G/4.q", "G/4.q", "E/4.q", "G/4.h", "E/4.q", "F#/4.q", "F#/4.q", "G/4.q", "G/4.q", "F#/4.q", "F#/4.q", "E/4.q", "E/4.q", "F#/4.q", "F#/4.q", "G/4.q", "E/4.q", "G/4.q", "E/4.h"], "text": ["mi", "fa", "fa", "sol", "sol", "fa", "fa", "mi", "mi", "fa", "fa", "sol", "sol", "mi", "sol", "mi", "fa", "fa", "sol", "sol", "fa", "fa", "mi", "mi", "fa", "fa", "sol", "mi", "sol", "mi"],  "colors": ["", "", "", "", "", "", "", "red", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]};
{"ID": "A010", "clef": "treble", "timeSignature": "4/4", "notes": ["Bb/4.q", "C/5.q", "C#/5.q", "D/5.q", "D/5.q", "C/5.q", "C/5.q", "Bb/4.q", "Bb/4.q", "C/5.q", "C/5.q", "D/5.q", "D/5.q", "Bb/4.q", "D/5.h", "Bb/4.q", "C/5.q", "C/5.q", "D/5.q", "D/5.q", "C/5.q", "C/5.q", "Bb/4.q", "Bb/4.q", "C/5.q", "C/5.q", "D/5.q", "Bb/4.q", "D/5.q", "Bb/4.h"], "text": ["si", "do", "do", "re", "re", "do", "do", "si", "si", "do", "do", "re", "re", "si", "re", "si", "do", "do", "re", "re", "do", "do", "si", "si", "do", "do", "re", "si", "re", "si"],  "noteColors": ["red", "", "", "", "", "", "", "red", "", "", "", "", "red", "", "", "", "", "", "", "red", "", "", "", "", "red", "", "", "", "", ""], "textColors": ["blue", "", "", "", "", "", "", "blue", "", "", "", "", "red", "", "", "", "", "", "", "red", "", "", "", "", "red", "", "", "", "", ""]};


$(document).ready(function(){

  activateMedia();

  registerEvents();  
  
  requestAnimationFrame(frame);              
        
});

function activateMedia() {
  //getting data from user microphone

  navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices = devices.filter((d) => d.kind === 'audioinput');
  
    navigator.getUserMedia({audio: {
      deviceId: devices[devices.length - 1].deviceId
    }}, function(stream) {
      $('#record').removeAttr('disabled');
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = e => {
        chunks.push(e.data);
        if(recorder.state == 'inactive')  makeLink();
      }
    }, function(){console.log('error with user input')});
  });
}

function makeLink(){
  
  let blob = new Blob(chunks, {type: 'audio.wav'}),
    url = URL.createObjectURL(blob),
    mt = document.createElement('audio');
    mt.controls = true;
    mt.src = url;
    $('#recording-container').html('');
    $('#recording-container').append(mt);
}

function registerEvents() {

  $('#display-score').on('click', function(){
    renderScore();
    $(this).hide();
    $('#play-audio').show();
    $('#record').show();
    $('#canvas-container').show();    
  });

  $('#play-audio').on('click', function(){
    pause = !pause;
    var audio = document.querySelector("#vocals");
    if (pause) {
       audio.play();
       $(this).html('pause');
    } else {
       $(this).html('play');
       audio.pause();
   }
  });

  $('#record').on('click', function(){
    var vocals = document.querySelector("#vocals");
    var organ = document.querySelector("#organ");

    if (recording) {
      recording = false;
      $('#record').html('start recording');
     recorder.stop();
     organ.pause();
     organ.currentTime = 0;
    } else {
      recording = true;
      $('#play-audio').html('play');
      pause = false;
      vocals.pause();
      vocals.currentTime = 0;
      $('#record').html('stop recording');
      chunks=[];
     recorder.start();
      organ.play();
   }
  });
}

function newAnnotation(text) {
  return (
     new VF.Annotation(text)).
      setFont("Times", 12).
     setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
}  

function renderScore() {
  VF = Vex.Flow;

  // Create a canvas renderer and attach it to the DIV.
  var div = document.getElementById("vf-renderer");
  var renderer = new VF.Renderer(div, VF.Renderer.Backends.CANVAS);

  // Size our canvas:
  //TODO custom size. for demo purposes supports only 4 lines of 2 staves each.
  renderer.resize(565, 1000);

  // And get a drawing context:
  var context = renderer.getContext();


  var notes = [];

  var j = -1;  
  var voices = [];  
  var measure = 0;
  var duration = '';

  for (var i = 0; i < musicData.notes.length; i++) {
    if (i == 0 || measure == 1) {
      measure = 0;
      notes.push([]);
      j++;

      var stave = new VF.Stave(j % 2 == 0 ? 10 : 310, 5 + (Math.floor(j/2) * 90), j % 2 == 0 ? 300 : 250);
      if (j % 2 == 0) stave.addClef(musicData.clef).addTimeSignature(musicData.timeSignature);
      stave.setContext(context).draw();
      staves.push(stave);
   }

   var sigSplit = musicData.timeSignature.split('/');
   var noteString;

   if (musicData.notes[i].includes('.')) {
     noteString = musicData.notes[i].split('.')[0];
     duration = musicData.notes[i].split('.')[1];
    } else {
     noteString = musicData.notes[i];
    }

    var note = new VF.StaveNote({clef: musicData.clef, keys: [musicData.notes[i]], duration: duration });
    note.addAnnotation(0, newAnnotation(musicData.text[i]));
   if (musicData.notes[i].includes('#'))  note.addAccidental(0, new VF.Accidental("#"));
   if (musicData.notes[i].includes('b'))  note.addAccidental(0, new VF.Accidental("b"));        
   note.setStyle({fillStyle: musicData.noteColors[i] == '' ? 'black' : musicData.noteColors[i], strokeStyle: musicData.noteColors[i] == '' ? 'black' : musicData.noteColors[i]});
   note.textColor = musicData.textColors[i];

 
   notes[j].push(note);
   measure+= getNoteLength(duration);

   if (measure == 1 || (i <=  musicData.notes.length - 2 && measure + getNoteLength(duration) > 1) || i == musicData.notes.length  - 1) {
      var voice = new VF.Voice({
        num_beats: parseInt(sigSplit[0]),
        beat_value: parseInt(sigSplit[1])
      });

     if (i == musicData.notes.length  - 1) {
       while(measure < 1) {
          var rest = new VF.StaveNote({clef: "treble", keys: ['B/4'], duration: 'qr' });
         notes[j].push(rest);
         measure += 1/4;
        }
     }

     voice.addTickables(notes[j]);

     voices.push(voice);
   }
  }

  for (var i = 0; i < notes.length; i++) {
   VF.Formatter.FormatAndDraw(context, staves[i], notes[i]);
  }   
}

function frame() {
  //move cursor
  //TODO custom size. for demo purposes supports only 4 lines of 2 staves each.
  var audio = recording ? document.querySelector("#organ") : document.querySelector("#vocals");

  var lines = staves.length / 2;
  var containerWidth = document.querySelector("#cursor-container").clientWidth;
  var percentPlayed = audio.currentTime / (audio.duration);
  var xPos = ((percentPlayed * 100) % (100 / lines)) * (containerWidth / (100 / lines));
  var yPos = Math.floor(percentPlayed * lines) * 90;

  if (percentPlayed == 1) {
    $('#music-cursor').css('transform', '');
  } else {
    $('#music-cursor').css('transform', 'translate(' + xPos + 'px, ' + yPos + 'px)');
  }
 

  requestAnimationFrame(frame);
} 

function getNoteLength (duration) {
  var noteLength;
  switch (duration) {
    case 'h':
    case 'hr':
      noteLength = 0.5;
      break;
    case 'q':
    case 'qr':
      noteLength = 0.25;
      break;
    case '8':
    case '8r':
    case '16':
    case '32':
    case '16r':
    case '32r':
      noteLength = 1 / parseInt(duration);
      break;
  }

  return noteLength; 
}  
  
