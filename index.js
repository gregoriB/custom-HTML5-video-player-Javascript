const controls     = document.querySelector('.controls'),
      play         = document.querySelector('.play'),
      player       = document.querySelector('.player'),
      speedSelect  = document.querySelector('select'),
      timeCounter  = document.querySelector('time'),
      timeBar      = document.querySelector('.time-bar'),
      video        = document.querySelector('video'),
      volumeSlider = document.querySelector('.volume-bar'),
      fullscreen   = document.querySelector('.fullscreen-button');

let isMouseDown     = false,
    uiTimeout       = '',
    timeTotal       = 0,
    videoStatus     = 'paused';

function onKeyDown(e) {
  switch(e.key) {
    case 'ArrowLeft':
    case 'ArrowRight':
      skip(e);
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      adjustVolume(e);
      break;
    case ' ':
      playVideo(e);
      break;
  }
  showUI();
}

function showUI() {
  if (uiTimeout) clearTimeout(uiTimeout);
  controls.classList.add('active');
  video.style.cursor = 'default';
}

function hideUI() {
  if (uiTimeout) clearTimeout(uiTimeout);
  if (video.paused) return; 

  uiTimeout = setTimeout(() => {
    controls.classList.remove('active');
    setTimeout(() => video.style.cursor = 'none', 1000);
  }, 2000);
}


function onMouseDown() {
  isMouseDown = true;
  showUI();
}

function onMouseUp() {
  isMouseDown = false;
  if (videoStatus === 'paused') return;

  hideUI();
  video.play();
}

function updatePlayState() {
  play.classList.toggle('start');
  play.classList.toggle('pause');
  video.paused ? showUI() : hideUI();
}

const updatetimeBar = (e) => {
  if (!isMouseDown && e.type === 'mousemove') return;

  video.currentTime = timeBar.value;
  if (!isMouseDown) return;

  video.pause();
  showUI();
  hideUI();
}

function updateCurrentTime() {
  let seconds = Math.floor(video.currentTime % 60);
  let minutes = Math.floor(video.currentTime / 60);
  seconds = seconds >= 10 ? seconds : '0' + seconds;
  minutes = minutes >= 10 ? minutes : '0' + minutes;
  timeCounter.innerText = `${minutes}:${seconds} / ${timeTotal}`;
  if (isMouseDown) return;

  timeBar.value = video.currentTime;
}

function playVideo(e) {
  e.preventDefault();
  if (!video.readyState) return;

  if (video.paused) {
    video.play();
    videoStatus = 'playing';
  } else {
    video.pause(); 
    videoStatus = 'paused';
  }
}

function adjustVolume(e) {
  if (e.type === 'mousemove' && !isMouseDown) return;

  if (e.key === 'ArrowUp' || e.wheelDelta > 0) {
      video.volume = video.volume + .1 >= 1 ? 1 : video.volume + .1;
      volumeSlider.value = video.volume * 100;
      return;
  }
  if (e.key === 'ArrowDown' || e.wheelDelta < 0) {
      video.volume = video.volume - .1 <= 0 ? 0 : video.volume - .1;
      volumeSlider.value = video.volume * 100;
      return;
  }
  if (e.which === 1 ) return video.volume = volumeSlider.value / 100;

  video.volume = volumeSlider.value / 100;  
  e.preventDefault();
}

function skip(e) {
  e.preventDefault();
  switch(e.key) {
    case 'ArrowLeft':
      video.currentTime -= 10;
      break;
    case 'ArrowRight':
      video.currentTime += 10;
      break;
  }
  timeBar.value = video.currentTime;
}

function setVideoData() {
  if (video.readyState) {
    let seconds = Math.floor(video.duration % 60);
    let minutes = Math.floor(video.duration / 60);
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    minutes = minutes >= 10 ? minutes : '0' + minutes;
    timeTotal = `${minutes}:${seconds}`;
    timeBar.max = video.duration;
    timeCounter.innerText = `00:00 / ${timeTotal}`;
    updateCurrentTime();
  }
  video.volume = volumeSlider.value / 100;
}

function toggleFullScreen () {
  player.requestFullscreen ? player.requestFullscreen() :
    player.mozRequestFullscreen ? player.mozRequestFullscreen() :
    player.webkitRequestFullscreen ? player.webkitRequestFullscreen() : 
    player.msRequestFullscreen ? player.msRequestFullscreen() : 
    console.error('fullscreen is not available');

  document.exitFullscreen ? document.exitFullscreen() :
    document.mozExitFullscreen ? document.mozExitFullscreen() :
    document.webkitExitFullscreen ? document.webkitExitFullscreen() :
    document.msExitFullscreen ? document.msExitFullscreen() :   
    console.error('cannot exit fullscreen mode');
}

controls.addEventListener('mousemove', () => { showUI(), hideUI() });
controls.addEventListener('mouseout', hideUI);
controls.addEventListener('mouseup', onMouseUp);

controls.childNodes.forEach(control => control.addEventListener('mousedown', onMouseDown));
controls.childNodes.forEach(control => control.addEventListener('mouseup', onMouseUp));
controls.childNodes.forEach(control => control.addEventListener('touchstart', onMouseDown));
controls.childNodes.forEach(control => control.addEventListener('touchend', onMouseUp));

fullscreen.addEventListener('click', toggleFullScreen);

play.addEventListener('click', playVideo);

player.addEventListener('fullscreenchange', () => controls.classList.toggle('fullscreen'));
player.addEventListener('mozfullscreenchange', () => controls.classList.toggle('fullscreen'));
player.addEventListener('webkitfullscreenchange', () => controls.classList.toggle('fullscreen'));
player.addEventListener('msfullscreenchange', () => controls.classList.toggle('fullscreen'));

speedSelect.addEventListener('click', () => video.playbackRate = speedSelect.value);

timeBar.addEventListener('change', updatetimeBar);
timeBar.addEventListener('mousemove', updatetimeBar);

video.addEventListener('mouseup', playVideo);
video.addEventListener('touchstart', playVideo);
video.addEventListener('loadedmetadata', setVideoData);
video.addEventListener('play', updatePlayState);
video.addEventListener('pause', updatePlayState);
video.addEventListener('timeupdate', updateCurrentTime);
video.addEventListener('mouseout', hideUI);
video.addEventListener('mousemove', () => { showUI(), hideUI() });
video.addEventListener('dblclick', toggleFullScreen)

volumeSlider.addEventListener('change', adjustVolume);
volumeSlider.addEventListener('mousemove', adjustVolume);
volumeSlider.addEventListener('wheel', adjustVolume);

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', hideUI);