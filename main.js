const songs = Array.from({ length: 11 }, (_, i) => `/songs/song${i + 1}.mp3`);
const audio = new Audio(songs[0]); audio.preload = 'metadata';
const ipod = document.getElementById('ipod');
const songTitle = document.getElementById('songTitle');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const notesBtn = document.getElementById('notes');
const glowBtn = document.getElementById('glow');
const overlay = document.getElementById('notesOverlay');
const closeNotesBtn = document.getElementById('closeNotes');
const editNoteBtn = document.getElementById('editNote');
const saveNoteBtn = document.getElementById('saveNote');
const noteText = document.getElementById('noteText');
const noteEdit = document.getElementById('noteEdit');
let index = 0, shuffled = false, seeking = false, lastFocused = null;
const THEME_KEY='romanticTheme', NOTE_KEY='specialNote';
if (localStorage.getItem(THEME_KEY)==='1') document.body.classList.add('romantic');
const savedNote = localStorage.getItem(NOTE_KEY); if(savedNote){ noteText.textContent=savedNote; noteEdit.value=savedNote; }
const formatTime = (sec)=> (isNaN(sec)?'0:00':`${Math.floor(sec/60)}:${Math.floor(sec%60).toString().padStart(2,'0')}`);
const setPlayingUI=(p)=>{ ipod.classList.toggle('is-playing',p); playBtn.textContent=p?'⏸':'▶'; playBtn.setAttribute('aria-label',p?'Pause':'Play'); };
function loadSong(i){ index=(i+songs.length)%songs.length; audio.src=songs[index]; songTitle.textContent=`Song ${index+1}`; progress.value=0; currentTimeEl.textContent='0:00'; durationEl.textContent='0:00'; }
async function play(){ try{ await audio.play(); setPlayingUI(true);}catch(e){ console.warn('Play blocked:', e?.message||e);} }
function pause(){ audio.pause(); setPlayingUI(false); }
function togglePlay(){ audio.paused?play():pause(); }
function nextSong(){ if(shuffled){ let n=Math.floor(Math.random()*songs.length); if(songs.length>1) while(n===index) n=Math.floor(Math.random()*songs.length); loadSong(n);} else { loadSong(index+1);} play(); }
function prevSong(){ loadSong(index-1); play(); }
playBtn.addEventListener('click',togglePlay); nextBtn.addEventListener('click',nextSong); prevBtn.addEventListener('click',prevSong);
shuffleBtn.addEventListener('click',()=>{ shuffled=!shuffled; shuffleBtn.setAttribute('aria-pressed', String(shuffled)); });
audio.addEventListener('loadedmetadata',()=>{ durationEl.textContent=formatTime(audio.duration); });
audio.addEventListener('timeupdate',()=>{ if(seeking||!isFinite(audio.duration)) return; progress.value=(audio.currentTime/audio.duration)*100||0; currentTimeEl.textContent=formatTime(audio.currentTime); });
audio.addEventListener('play',()=>setPlayingUI(true)); audio.addEventListener('pause',()=>setPlayingUI(false)); audio.addEventListener('ended',nextSong);
progress.addEventListener('input',()=>{ seeking=true; const t=(progress.value/100)*(audio.duration||0); currentTimeEl.textContent=formatTime(t); });
const commitSeek=()=>{ const t=(progress.value/100)*(audio.duration||0); if(isFinite(t)) audio.currentTime=t; seeking=false; };
['change','pointerup','touchend','mouseup'].forEach(ev=>progress.addEventListener(ev,commitSeek));
function openNotes(){ lastFocused=document.activeElement; overlay.classList.remove('hidden'); noteEdit.value=noteText.textContent.trim(); editNoteBtn.focus(); }
function closeNotes(){ overlay.classList.add('hidden'); lastFocused?.focus?.(); }
notesBtn.addEventListener('click',openNotes); closeNotesBtn.addEventListener('click',closeNotes);
overlay.addEventListener('click',(e)=>{ if(e.target===overlay) closeNotes(); });
editNoteBtn.addEventListener('click',()=>{ noteEdit.classList.remove('hidden'); saveNoteBtn.classList.remove('hidden'); editNoteBtn.classList.add('hidden'); noteEdit.focus(); });
saveNoteBtn.addEventListener('click',()=>{ const v=(noteEdit.value||'').trim() || 'Hey Love, this is your special note 💜✨'; noteText.textContent=v; localStorage.setItem(NOTE_KEY,v); noteEdit.classList.add('hidden'); saveNoteBtn.classList.add('hidden'); editNoteBtn.classList.remove('hidden'); });
glowBtn.addEventListener('click',()=>{ const on=document.body.classList.toggle('romantic'); localStorage.setItem(THEME_KEY, on?'1':'0'); });
document.addEventListener('keydown',(e)=>{ if(['INPUT','TEXTAREA'].includes(e.target.tagName)) return; if(e.code==='Space'){e.preventDefault();togglePlay();} if(e.code==='ArrowRight') nextSong(); if(e.code==='ArrowLeft') prevSong(); if((e.key||'').toLowerCase()==='s'){ shuffled=!shuffled; shuffleBtn.setAttribute('aria-pressed', String(shuffled)); } });
loadSong(index);