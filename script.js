const loginScreen = document.getElementById("login-screen");
    const transitionScreen = document.getElementById("transition-screen");
    const dashboardScreen = document.getElementById("dashboard-screen");
    const form = document.getElementById("agent-form");
    const nameInput = document.getElementById("agent-name");
    const status = document.getElementById("status");
    const transitionName = document.getElementById("transition-name");
    const progressBar = document.getElementById("progress-bar");
    const systemLog = document.getElementById("system-log");
    const welcomeMessage = document.getElementById("welcome-message");

    const steps = [
      { text: "Authenticating minion credentials...", progress: 18 },
      { text: "Verifying deployment zone...", progress: 38 },
      { text: "Loading mission files...", progress: 61 },
      { text: "Syncing bonus objectives...", progress: 82 },
      { text: "Connection established.", progress: 100 }
    ];

    function addSystemLine(text) {
      const line = document.createElement("div");
      line.className = "system-line";
      line.textContent = "> " + text;
      systemLog.appendChild(line);
    }

    function runTransition(name) {
      loginScreen.classList.add("hidden");
      transitionScreen.classList.remove("hidden");
      transitionName.textContent = `Minion ${name} registered.`;
      systemLog.innerHTML = "";
      progressBar.style.width = "0%";

      steps.forEach((step, index) => {
        setTimeout(() => {
          addSystemLine(step.text);
          progressBar.style.width = step.progress + "%";

          if (index === steps.length - 1) {
            setTimeout(() => {
              transitionScreen.classList.add("hidden");
              showDashboardFor(name, false);
            }, 850);
          }
        }, 650 * (index + 1));
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const minionName = nameInput.value.trim();

      if (!minionName) {
        status.style.display = "block";
        status.textContent = "Minion identification required.";
        nameInput.focus();
        return;
      }

      localStorage.setItem("gruMinionName", minionName);
      runTransition(minionName);
    });

    document.querySelectorAll(".section-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const contentId = toggle.getAttribute("aria-controls");
        const content = document.getElementById(contentId);
        const isOpen = content.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.querySelector(".toggle-symbol").textContent = isOpen ? "−" : "+";
      });
    });


    const objectiveCheckboxes = Array.from(
      document.querySelectorAll('.objective-item input[type="checkbox"]')
    );
    const missionPointsDisplay = document.getElementById("mission-points");

    function getCurrentMinionName() {
      return localStorage.getItem("gruMinionName") || "guest";
    }

    function getProgressStorageKey() {
      return `gruMissionProgress_v2:${getCurrentMinionName()}`;
    }

    function updateMissionPoints() {
      const total = objectiveCheckboxes.reduce((sum, checkbox) => {
        return sum + (checkbox.checked ? Number(checkbox.dataset.points || 0) : 0);
      }, 0);

      missionPointsDisplay.textContent = String(total);

      const checkedStates = objectiveCheckboxes.map((checkbox) => checkbox.checked);
      localStorage.setItem(
        getProgressStorageKey(),
        JSON.stringify({ checkedStates, total })
      );
    }

    function loadMissionProgress() {
      const saved = localStorage.getItem(getProgressStorageKey());
      if (!saved) {
        updateMissionPoints();
        return;
      }

      try {
        const progress = JSON.parse(saved);
        if (Array.isArray(progress.checkedStates)) {
          objectiveCheckboxes.forEach((checkbox, index) => {
            checkbox.checked = Boolean(progress.checkedStates[index]);
          });
        }
      } catch (error) {
        console.warn("Unable to restore saved mission progress.", error);
      }

      updateMissionPoints();
    }

    objectiveCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateMissionPoints);
    });

  

    function showDashboardFor(name, returning = false) {
      loginScreen.classList.add("hidden");
      transitionScreen.classList.add("hidden");
      dashboardScreen.classList.remove("hidden");
      welcomeMessage.textContent = returning
        ? `Welcome back, Minion ${name}. Your mission is still active.`
        : `Welcome, Minion ${name}. Your mission is now active.`;
      loadMissionProgress();
    }

    function clearActiveMinion() {
      const currentName = localStorage.getItem("gruMinionName");
      if (currentName) {
        localStorage.removeItem(`gruMissionProgress_v2:${currentName}`);
      }
      localStorage.removeItem("gruMinionName");

      dashboardScreen.classList.add("hidden");
      transitionScreen.classList.add("hidden");
      loginScreen.classList.remove("hidden");

      nameInput.value = "";
      status.style.display = "none";
      missionPointsDisplay.textContent = "0";
      objectiveCheckboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });
    }

    const switchMinionButton = document.getElementById("switch-minion-btn");
    if (switchMinionButton) {
      switchMinionButton.addEventListener("click", clearActiveMinion);
    }

    const savedMinionName = localStorage.getItem("gruMinionName");
    if (savedMinionName) {
      showDashboardFor(savedMinionName, true);
    }


const scarletOverlay=document.getElementById("scarlet-call-overlay");
const incomingCallView=document.getElementById("incoming-call-view");
const activeCallView=document.getElementById("active-call-view");
const testScarletCallButton=document.getElementById("test-scarlet-call");
const answerCallButton=document.getElementById("answer-call");
const declineCallButton=document.getElementById("decline-call");
const endCallButton=document.getElementById("end-call");
const speakerToggle=document.getElementById("speaker-toggle");
const readyForScarletButton=document.getElementById("ready-for-scarlet");
const callTimer=document.getElementById("call-timer");
const callStatusText=document.getElementById("call-status-text");
let callTimerInterval=null,callSeconds=0,declineTimeout=null;
function fmt(t){return `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;}
function resetCallUI(){clearInterval(callTimerInterval);clearTimeout(declineTimeout);callSeconds=0;callTimer.textContent="00:00";callStatusText.textContent="INCOMING TRANSMISSION";incomingCallView.classList.remove("hidden");activeCallView.classList.add("hidden");speakerToggle.classList.remove("active");speakerToggle.setAttribute("aria-pressed","false");speakerToggle.textContent="🔊 Speaker Off";readyForScarletButton.disabled=true;readyForScarletButton.textContent="Ready for Scarlet";}
function openScarletCall(){resetCallUI();scarletOverlay.classList.remove("hidden");scarletOverlay.setAttribute("aria-hidden","false");if(navigator.vibrate)navigator.vibrate([450,250,450,250,700]);}
function closeScarletCall(){clearInterval(callTimerInterval);clearTimeout(declineTimeout);if(navigator.vibrate)navigator.vibrate(0);scarletOverlay.classList.add("hidden");scarletOverlay.setAttribute("aria-hidden","true");}
function answerScarletCall(){if(navigator.vibrate)navigator.vibrate(0);incomingCallView.classList.add("hidden");activeCallView.classList.remove("hidden");callStatusText.textContent="CONNECTED";callSeconds=0;callTimerInterval=setInterval(()=>{callSeconds++;callTimer.textContent=fmt(callSeconds)},1000);}
function declineScarletCall(){closeScarletCall();declineTimeout=setTimeout(openScarletCall,1800);}
function toggleSpeaker(){const on=speakerToggle.classList.toggle("active");speakerToggle.setAttribute("aria-pressed",String(on));speakerToggle.textContent=on?"🔊 Speaker Enabled":"🔊 Speaker Off";readyForScarletButton.disabled=!on;}
function markReady(){readyForScarletButton.textContent="Scarlet Is Ready";readyForScarletButton.disabled=true;callStatusText.textContent="AWAITING MESSAGE";}
if(testScarletCallButton)testScarletCallButton.addEventListener("click",openScarletCall);
if(answerCallButton)answerCallButton.addEventListener("click",answerScarletCall);
if(declineCallButton)declineCallButton.addEventListener("click",declineScarletCall);
if(speakerToggle)speakerToggle.addEventListener("click",toggleSpeaker);
if(readyForScarletButton)readyForScarletButton.addEventListener("click",markReady);
if(endCallButton)endCallButton.addEventListener("click",closeScarletCall);


/* Scarlet Call Phase 2: browser voice + generated ringtone */
(function(){
  const p2Caption=document.getElementById("scarlet-caption");
  const p2Test=document.getElementById("test-scarlet-call");
  const p2Answer=document.getElementById("answer-call");
  const p2Decline=document.getElementById("decline-call");
  const p2End=document.getElementById("end-call");
  const p2Speaker=document.getElementById("speaker-toggle");
  const p2Ready=document.getElementById("ready-for-scarlet");
  const p2ActivePhoto=document.querySelector("#active-call-view .caller-image-wrap");
  let p2Ctx=null,p2RingTimer=null,p2Busy=false;
  let p2Sequence=Number(localStorage.getItem("scarletCallSequence")||"0");

  const scripts=[
    {
      before:[["Jennifer...",700],["Before I continue...",650],["Put me on speaker.",0]],
      after:[
        ["Well hello, Minions!",400],
        ["I hope you are enjoying your beer so far.",400],
        ["It's me... Scarlet Overkill.",400],
        ["I'm here to kill the buzz.",300],
        ["You get the joke?",300],
        ["Anywho...",300],
        ["I've selected my first victim.",650],
        ["Their name is...",1500],
        ["Kevin",550],
        ["Open your mission page.",300],
        ["Take a photo of the group and that hijack screen will go away.",400],
        ["You'll hear from me again very soon.",300],
        ["Now... back to ruining Gru's day.",0]
      ]
    },
    {
      before:[["Jennifer...",450],["Put me on speaker.",0]],
      after:[
        ["Hello again!",300],
        ["Did you miss me?",300],
        ["I'm back, just as promised.",400],
        ["I've located another Minion.",500],
        ["Their name is...",1500],
        ["Kevin",500],
        ["Go check your phone and take a group photo now.",400],
        ["Try not to miss me too much.",0]
      ]
    },
    {
      before:[["Jennifer...",450],["Put me on speaker.",0]],
      after:[
        ["Honestly...",350],
        ["How do I keep doing this?",400],
        ["Ha... ha... ha...",400],
        ["Is Gru taking a nap?",400],
        ["Either way, I've found another Minion.",500],
        ["Their name is...",1500],
        ["Kevin",500],
        ["Time to interrupt their mission.",300],
        ["Gru should really change his passwords.",0]
      ]
    },
    {
      before:[["Jennifer...",450],["Put me on speaker.",0]],
      after:[
        ["Gru really should update his security.",400],
        ["Breaking in is becoming far too easy.",450],
        ["I've found another Minion.",500],
        ["Their name is...",1500],
        ["Kevin",500],
        ["Tell them to check their phone.",300],
        ["I have another assignment waiting.",300],
        ["Scarlet Overkill... out.",0]
      ]
    },
    {
      before:[["Jennifer...",450],["Put me on speaker.",0]],
      after:[
        ["Don't worry, Minions.",300],
        ["Every single one of you will be targeted at some point.",500],
        ["Today's lucky contestant is...",1500],
        ["Kevin",500],
        ["Better check your mission page.",300],
        ["Don't go anywhere. I'll be calling again.",0]
      ]
    }
  ];

  function p2Script(){
    if(p2Sequence===0)return scripts[0];
    return scripts[1+((p2Sequence-1)%4)];
  }

  function p2Voice(){
    const voices=speechSynthesis.getVoices();
    return voices.find(v=>/samantha|victoria|ava|serena/i.test(v.name))
      || voices.find(v=>/^en/i.test(v.lang))
      || voices[0]||null;
  }

  function p2Speak(text){
    return new Promise(resolve=>{
      if(!("speechSynthesis" in window)){
        p2Caption.textContent=text;
        setTimeout(resolve,Math.max(700,text.length*45));
        return;
      }
      const u=new SpeechSynthesisUtterance(text);
      const v=p2Voice(); if(v)u.voice=v;
      u.rate=.88;u.pitch=.84;u.volume=1;
      u.onstart=()=>{p2Caption.textContent=text;p2ActivePhoto?.classList.add("speaking")};
      u.onend=()=>{p2ActivePhoto?.classList.remove("speaking");resolve()};
      u.onerror=()=>{p2ActivePhoto?.classList.remove("speaking");resolve()};
      speechSynthesis.cancel();speechSynthesis.speak(u);
    });
  }

  async function p2Play(lines,finish){
    if(p2Busy)return;
    p2Busy=true;
    for(const [text,pause] of lines){
      await p2Speak(text);
      if(pause)await new Promise(r=>setTimeout(r,pause));
    }
    p2Busy=false;
    if(finish){
      p2Caption.textContent="Scarlet has ended the transmission.";
      p2Sequence+=1;
      localStorage.setItem("scarletCallSequence",String(p2Sequence));
      setTimeout(()=>p2End?.click(),1500);
    }else{
      p2Caption.textContent='Enable speaker, then tap "Continue Call".';
      if(p2Ready)p2Ready.textContent="Continue Call";
    }
  }

  function p2Audio(){
    if(!p2Ctx)p2Ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(p2Ctx.state==="suspended")p2Ctx.resume();
  }

  function p2Chime(){
    p2Audio();
    const now=p2Ctx.currentTime;
    [659.25,523.25,783.99].forEach((f,i)=>{
      const o=p2Ctx.createOscillator(),g=p2Ctx.createGain();
      o.type="sine";o.frequency.value=f;
      g.gain.setValueAtTime(.0001,now+i*.18);
      g.gain.exponentialRampToValueAtTime(.18,now+i*.18+.02);
      g.gain.exponentialRampToValueAtTime(.0001,now+i*.18+.16);
      o.connect(g).connect(p2Ctx.destination);
      o.start(now+i*.18);o.stop(now+i*.18+.18);
    });
  }

  function p2StartRing(){
    p2StopRing();p2Chime();p2RingTimer=setInterval(p2Chime,2200);
  }
  function p2StopRing(){
    if(p2RingTimer){clearInterval(p2RingTimer);p2RingTimer=null}
  }
  function p2StopAll(){
    p2StopRing();
    if("speechSynthesis" in window)speechSynthesis.cancel();
    p2Busy=false;
    p2ActivePhoto?.classList.remove("speaking");
  }

  p2Test?.addEventListener("click",()=>{p2Caption.textContent="Incoming secure transmission...";p2StartRing()});
  p2Answer?.addEventListener("click",()=>{p2StopRing();setTimeout(()=>p2Play(p2Script().before,false),500)});
  p2Decline?.addEventListener("click",()=>{p2StopAll();setTimeout(p2StartRing,1900)});
  p2End?.addEventListener("click",p2StopAll);
  p2Speaker?.addEventListener("click",()=>{
    setTimeout(()=>{
      if(p2Speaker.classList.contains("active")){
        p2Caption.textContent='Speaker enabled. Tap "Continue Call" when everyone is ready.';
        p2Ready.textContent="Continue Call";
      }
    },0);
  });
  p2Ready?.addEventListener("click",()=>p2Play(p2Script().after,true));

  if("speechSynthesis" in window){
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();
  }
})();
