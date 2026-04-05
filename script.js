const statusEl = document.getElementById('status');
const buttonEl = document.getElementById('listenBtn');
const songTitleEl = document.getElementById('songTitle');
const songArtistEl = document.getElementById('songArtist');
const audioPlayer = document.getElementById('player');

const RECORD_MS = 4500;

function setStatus(text, isError = false) {
  statusEl.textContent = `Status: ${text}`;
  statusEl.classList.toggle('error', isError);
}

async function recordAudioClip() {
  // Ask for mic access and record a short clip.
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event) => {
      reject(event.error || new Error('Recording failed'));
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve(new Blob(chunks, { type: 'audio/webm' }));
    };

    recorder.start();
    setTimeout(() => recorder.stop(), RECORD_MS);
  });
}

async function recognizeSong(audioBlob) {
  const form = new FormData();
  form.append('audio', audioBlob, 'sample.webm');

  const response = await fetch('/recognize', {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Recognition failed');
  }

  return response.json();
}

function playSong(result) {
  songTitleEl.textContent = result.title || 'Unknown';
  songArtistEl.textContent = result.artist || 'Unknown';

  // Prefer direct preview audio URL for automatic playback.
  if (result.preview_url) {
    audioPlayer.src = result.preview_url;
    audioPlayer.play().catch(() => {
      setStatus('Detected song, but browser blocked autoplay. Press play.', true);
    });
    return;
  }

  if (result.youtube_link) {
    window.open(result.youtube_link, '_blank', 'noopener');
  }

  setStatus('Song detected, no in-app preview URL available.', false);
}

async function startListening() {
  buttonEl.disabled = true;
  songTitleEl.textContent = '-';
  songArtistEl.textContent = '-';
  audioPlayer.removeAttribute('src');

  try {
    setStatus('Listening…');
    const audioBlob = await recordAudioClip();

    setStatus('Processing…');
    const result = await recognizeSong(audioBlob);

    if (!result?.title && !result?.artist) {
      setStatus('No song match found. Try again.', true);
      return;
    }

    setStatus('Playing…');
    playSong(result);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      setStatus('Microphone permission denied.', true);
    } else {
      setStatus(error.message || 'Something went wrong.', true);
    }
  } finally {
    buttonEl.disabled = false;
  }
}

buttonEl.addEventListener('click', startListening);

// Optional enhancement: auto-start once on page load.
window.addEventListener('load', () => {
  setStatus('Idle');
  startListening().catch(() => {
    // If auto-start fails, user can click button.
  });
});
