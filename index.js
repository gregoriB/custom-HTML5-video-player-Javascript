const controls     = document.querySelector('.controls'),
      fileChooser  = document.querySelector('.file-chooser'),
      fullscreen   = document.querySelector('.fullscreen-button'),
      playButton   = document.querySelector('.play'),
      player       = document.querySelector('.player'),
      speedSelect  = document.querySelector('select'),
      timeCounter  = document.querySelector('time'),
      timeBar      = document.querySelector('.time-bar'),
      video        = document.querySelector('video'),
      volumeSlider = document.querySelector('.volume-bar');

let isMouseDown     = false,
    timeTotal       = 0,
    uiTimeout       = '',
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
  video.paused ? 
    (playButton.classList.add('start'), playButton.classList.remove('pause')) :
    (playButton.classList.add('pause'), playButton.classList.remove('start'));

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
  const minutes = Math.floor(video.currentTime / 60);
  seconds = seconds >= 10 ? seconds : '0' + seconds;
  timeCounter.innerText = `${minutes}:${seconds} / ${timeTotal}`;
  if (isMouseDown) return;

  timeBar.value = video.currentTime;
}

function playVideo(e) {
  e.preventDefault();
  if (!video.readyState >= 2) return;

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
  if (e.which === 1 ) return video.volume = volumeSlider.value / 100;

  e.preventDefault();
  if (e.key === 'ArrowUp' || e.wheelDelta > 0) {
      video.volume = video.volume + .1 >= 1 ? 1 : video.volume + .1;
      return volumeSlider.value = video.volume * 100;
  }
  if (e.key === 'ArrowDown' || e.wheelDelta < 0) {
      video.volume = video.volume - .1 <= 0 ? 0 : video.volume - .1;
      return volumeSlider.value = video.volume * 100;
  }

  video.volume = volumeSlider.value / 100;  
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
    
  setVideoSize();
}

function selectVideoFile() {
  const file = this.files[0];
  const fileUrl = URL.createObjectURL(file);
  video.type = file.type;
  video.src = fileUrl + '#t=0.5';
  video.poster = '';
  video.play();
  videoStatus = 'playing';
  setTimeout(() => setVideoData(), 50);  //timeout to prevent empty load of videos
}

function setVideoSize() {
  const aspectRatio = video.offsetWidth / video.offsetHeight;
  controls.style.width = player.offsetWidth + 'px';
  if (video.offsetHeight >= player.clientHeight) {
    video.style.width = window.innerHeight * aspectRatio + 'px';
  } else {
    video.style.width = player.offsetWidth + 'px';
  }
  const margin = (player.offsetHeight - video.offsetHeight) / 2 + 'px';
  video.style.marginTop = margin;
}

function setVideoData() {
  if (video.readyState) {
    let seconds = Math.floor(video.duration % 60);
    const minutes = Math.floor(video.duration / 60);
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    timeTotal = `${minutes}:${seconds}`;
    timeBar.max = video.duration;
    timeCounter.innerText = `0:00 / ${timeTotal}`;
    updateCurrentTime();
  } 
  video.volume = volumeSlider.value / 100;
  setVideoSize();
}

setVideoData();

controls.addEventListener('mousemove', () => { showUI(), hideUI() });
controls.addEventListener('mouseout', hideUI);

controls.childNodes.forEach(control => control.addEventListener('mousedown', onMouseDown));
controls.childNodes.forEach(control => control.addEventListener('mouseup', onMouseUp));
controls.childNodes.forEach(control => control.addEventListener('touchstart', onMouseDown));
controls.childNodes.forEach(control => control.addEventListener('touchend', onMouseUp));

fileChooser.addEventListener('change', selectVideoFile);

fullscreen.addEventListener('click', toggleFullScreen);

playButton.addEventListener('click', playVideo);

player.addEventListener('fullscreenchange', setVideoSize);
player.addEventListener('msfullscreenchange', setVideoSize);

speedSelect.addEventListener('click', () => video.playbackRate = speedSelect.value);

timeBar.addEventListener('change', updatetimeBar);
timeBar.addEventListener('mousemove', updatetimeBar);

video.addEventListener('mouseup', playVideo);
video.addEventListener('touchend', playVideo);
video.addEventListener('loadedmetadata', setVideoData);
video.addEventListener('play', updatePlayState);
video.addEventListener('pause', updatePlayState);
video.addEventListener('timeupdate', updateCurrentTime);
video.addEventListener('mouseout', hideUI);
video.addEventListener('dblclick', toggleFullScreen);
video.addEventListener('mousemove', () => { showUI(), hideUI() });

volumeSlider.addEventListener('change', adjustVolume);
volumeSlider.addEventListener('mousemove', adjustVolume);
volumeSlider.addEventListener('wheel', adjustVolume);

window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', hideUI);
window.addEventListener('resize', setVideoSize);
window.addEventListener('mouseup', onMouseUp);