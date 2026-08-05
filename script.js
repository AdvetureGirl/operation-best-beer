
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
