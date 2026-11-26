/* Clubsport France — intro « Engine Start »
   Usage : <script src="clubsport-intro.js" defer></script>
   Options (attributs data- sur la balise <script>) :
     data-once="session|always"   session = une fois par visite (défaut), always = à chaque chargement
     data-duration="3300"         délai (ms) entre le clic et l'ouverture du site
     data-sound="on|off"          bruit de moteur synthétique (défaut on)
   Évènement émis à la fin : document 'clubsport:intro-end'                       */
(function(){
  var me=document.currentScript, base=me.src.replace(/[^\/]*$/,'');
  var opt=function(k,d){return me.getAttribute('data-'+k)||d};
  var once=opt('once','session'), dur=+opt('duration',3300), sound=opt('sound','on')!=='off';
  var KEY='cs-intro-seen', html=document.documentElement;

  try{ if(once==='session' && sessionStorage.getItem(KEY)) return; }catch(e){}
  if(location.hash==='#no-intro') return;
  /* Clubsport : pas d'intro sur un lien direct (fiche, catalogue…) */
  if(location.hash.length>1) return;

  var A=base+'assets/';
  var el=document.createElement('div');
  el.className='cs-intro'; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Introduction Clubsport France');
  el.innerHTML=
    '<video class="cs-intro__video" muted playsinline preload="auto">'+
      '<source src="'+A+'intro.webm" type="video/webm"><source src="'+A+'intro.mp4" type="video/mp4"></video>'+
    '<img class="cs-intro__logo" src="'+A+'logo.png" alt="Clubsport France">'+
    '<div class="cs-intro__stage">'+
      '<button class="cs-intro__btn" type="button" aria-label="Entrer sur le site"><div class="cs-intro__face"><i></i><small>ENGINE</small><b>START</b><small>STOP</small></div></button>'+
      '<div class="cs-intro__cta" aria-hidden="true">Entrer sur le site</div></div>'+
    '<button class="cs-intro__skip" type="button">Passer l’intro</button>'+
    '<div class="cs-intro__flash"></div>';
  html.classList.add('cs-intro-lock');
  document.body.appendChild(el);

  var vid=el.querySelector('video'), btn=el.querySelector('.cs-intro__btn'), started=false, timer;

  function engine(){
    try{
      var C=new (window.AudioContext||window.webkitAudioContext)(),t=C.currentTime,g=C.createGain();
      g.connect(C.destination);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+.15);g.gain.exponentialRampToValueAtTime(.001,t+3.2);
      [55,110,165].forEach(function(f,i){
        var o=C.createOscillator(),lp=C.createBiquadFilter();
        o.type=i?'sawtooth':'square';
        o.frequency.setValueAtTime(f*.6,t);
        o.frequency.exponentialRampToValueAtTime(f*1.9,t+.5);
        o.frequency.exponentialRampToValueAtTime(f*.9,t+2.2);
        lp.type='lowpass';lp.frequency.value=380;
        o.connect(lp);lp.connect(g);o.start(t);o.stop(t+3.3);
      });
    }catch(e){}
  }
  function finish(){
    clearTimeout(timer);
    el.classList.add('is-done'); html.classList.remove('cs-intro-lock');
    try{sessionStorage.setItem(KEY,'1')}catch(e){}
    document.dispatchEvent(new CustomEvent('clubsport:intro-end'));
    setTimeout(function(){el.remove()},1400);
  }
  /* Phares : la vidéo joue jusqu'au pic d'allumage (1,6 s) au survol du bouton, puis s'arrête phares allumés */
  var PEAK=1.6, want=false, raf=0;
  function tick(){ raf=0;
    if(want){ if(vid.currentTime>=PEAK){ vid.pause(); el.classList.add('is-lit'); return; } raf=requestAnimationFrame(tick); }
  }
  function lightsOn(){ if(want) return; want=true; el.classList.remove('is-dim');
    if(vid.currentTime>=PEAK){ el.classList.add('is-lit'); return; }
    var p=vid.play(); if(p&&p.catch)p.catch(function(){}); if(!raf) raf=requestAnimationFrame(tick); }
  function lightsOff(){ if(started||!want) return; want=false; vid.pause(); el.classList.remove('is-lit'); el.classList.add('is-dim');
    setTimeout(function(){ if(!want&&!started){ vid.currentTime=0; el.classList.remove('is-dim'); } },650); }
  btn.addEventListener('mouseenter',lightsOn); btn.addEventListener('focus',lightsOn);
  btn.addEventListener('mouseleave',lightsOff); btn.addEventListener('blur',lightsOff);
  btn.addEventListener('touchstart',lightsOn,{passive:true});
  try{ if(matchMedia('(hover: none)').matches) setTimeout(lightsOn,1400); }catch(e){}

  function start(){
    if(started) return; started=true;
    el.classList.add('is-go','is-playing'); el.classList.remove('is-dim');
    want=false; lightsOn();
    if(sound) engine();
    timer=setTimeout(finish,dur);
  }
  btn.addEventListener('click',start);
  el.querySelector('.cs-intro__skip').addEventListener('click',function(){started=true;finish()});
  document.addEventListener('keydown',function k(e){
    if(!document.body.contains(el)){document.removeEventListener('keydown',k);return}
    if(e.key==='Enter'||e.key===' '){e.preventDefault();start()}
    if(e.key==='Escape'){started=true;finish()}
  });
})();
