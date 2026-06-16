// NXT STEP NAVIGATOR — Shared JS
// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const el=document.getElementById(a.getAttribute('href').slice(1));
    if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});

// ── Scroll fade-in ──
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';}});
},{threshold:0.07});
document.querySelectorAll('.card,.counselor-card,.support-card,.dl-row,.wtt-card,.ql-item').forEach(el=>{
  el.style.opacity='0';el.style.transform='translateY(14px)';
  el.style.transition='opacity 0.38s ease,transform 0.38s ease';
  io.observe(el);
});

// ── Audience toggle ──
function switchView(v){
  ['student','parent'].forEach(w=>{
    const el=document.getElementById(w+'-view');
    const tab=document.getElementById('tab-'+w);
    if(el)el.classList.toggle('active',w===v);
    if(tab)tab.classList.toggle('active',w===v);
  });
}

// ── Chat widget ──
const WHS_SYSTEM=`You are the NextStep Navigator AI Assistant for Wellington Community High School (WHS), Palm Beach County School District (SY 2026-27). You help students and parents navigate counseling, college planning, and school resources. Be warm, concise, and encouraging. Use bullet points for lists.

COUNSELORS (SY26-27):
9th Grade: Mr. Travis Gray (A-L) travis.gray@palmbeachschools.org Calendly: calendly.com/travis-gray-13/30min | Mr. Andrew Saperstein (M-Z) andrew.saperstein@palmbeachschools.org Calendly: calendly.com/andrew-saperstein/15min
9th Grade support: AP Mr. Michael Kozlowski | Dean Mrs. Catalina Toledo | Associate Deans Mr. Brockton Boretti & Mr. Mark Dubois | Admin Asst Ms. Janet Leon 561-795-4933

BIG BLUE 10-12 (A-G): Mrs. Julia Saye (A-C) julia.saye@palmbeachschools.org | Dr. Rosemyrtle Louis (D-G) Rosemyrtle.louis@palmbeachschools.org
Big Blue support: AP Dr. Eric Moore | Dean Mr. Lee Tanton | Admin Asst Ms. Kimberly Ellis 561-791-9323

GREENVIEW 10-12 (H-M): Mrs. Danielle Fairclough/Director (H-J) danielle.fairclough@palmbeachschools.org Calendly: calendly.com/danielle-fairclough/appointment | Mrs. Laquania Morgan (K-M) laquania.morgan@palmbeachschools.org
Greenview support: APs Dr. Elizabeth Calvente-Torres & Ms. Magda Dominique | Admin Asst Ms. Yvette Thomas 561-795-4920

SOUTHSHORE 10-12 (N-Z): Mr. Timothy Mickens (N-R) timothy.mickens@palmbeachschools.org | Mrs. Terry Roberto (S-Z) terry.roberto@palmbeachschools.org Calendly: calendly.com/terry-roberto
Southshore support: AP Mrs. Tonya Grant | Dean Ms. Malissa McAuley | Admin Asst Ms. Dalia Khalil 561-795-4915

ESOL Counselor: Mrs. Claudia Gallardo Claudia.Gallardo@palmbeachschools.org | ESOL Coordinator: Mr. Christian Carrera
Wellness Center: Ms. Allyson Joseph (BHP/Mental Health Coord 9-10) allyson.joseph@palmbeachschools.org | Ms. Christina Ranieri (DATA/LMHC) Christina.Ranieri@palmbeachschools.org
Transcripts: Ms. Lori Gelobter Lori.Gelobter@palmbeachschools.org (5-7 business days)
AP Coordinator: Mr. Lee Tanton | AICE Coordinator: Ms. Mierka Drucker
Principal: Mrs. Cara A. Gorham | Admin: Mrs. Marisol Ramos

APPOINTMENTS ARE FOR STUDENTS ONLY. Parents contact counseling office for a conference.
BRIGHT FUTURES: FAS=3.5GPA+1290SAT/29ACT+100hrs(100% tuition) | FMS=3.0GPA+1170SAT/26ACT+75hrs(75% tuition). Senior hours deadline Dec 1.
KEY DATES: Jul 1 Common App opens | Oct PSAT at WHS | Nov 1 EA/ED | Dec 1 Bright Futures hours | Jan 1 RD | May 1 Decision Day
CRISIS: 988 call/text | Text HOME to 741741 | Campus: Ms. Joseph or Ms. Ranieri at Wolverine Wellness Center

DISCLAIMER: NXT Step Navigator is an independent informational resource. It is not the official WHS or PBCSD website. Always verify information with official sources.

If someone describes a crisis or emergency: immediately provide 988 and campus wellness contacts. Never make up staff info.`;

let chatOpen=false,chatTyping=false,chatHistory=[];

function toggleChat(){
  chatOpen=!chatOpen;
  const win=document.getElementById('chat-window');
  const btn=document.getElementById('chat-launcher');
  if(win)win.classList.toggle('open',chatOpen);
  const ic=document.getElementById('icon-chat');
  const ix=document.getElementById('icon-close');
  if(ic)ic.style.display=chatOpen?'none':'block';
  if(ix)ix.style.display=chatOpen?'block':'none';
  if(chatOpen){
    const badge=document.getElementById('chat-badge');
    if(badge)badge.style.display='none';
    setTimeout(()=>{const inp=document.getElementById('cw-input');if(inp)inp.focus();},300);
  }
}

function initChat(){
  const msgs=document.getElementById('cw-messages');
  if(!msgs)return;
  msgs.innerHTML=`<div class="msg bot"><div class="msg-av bot-av">🧭</div><div><div class="msg-bub"><strong>Hey Wolverine! 👋</strong><br><br>I'm your <strong>NXT Step Navigator</strong> assistant — here to help with counselors, college planning, Bright Futures, deadlines, and more!<div class="qr-chips"><button class="qr-chip" onclick="sendTopic('Who is my counselor?')">Find my counselor</button><button class="qr-chip" onclick="sendTopic('Bright Futures requirements')">Bright Futures</button><button class="qr-chip" onclick="sendTopic('How do I request a transcript?')">Transcripts</button></div></div><div class="msg-time">Just now</div></div></div>`;
}

async function sendMessage(t){
  if(chatTyping)return;
  const inp=document.getElementById('cw-input');
  const txt=(t||inp.value).trim();
  if(!txt)return;
  inp.value='';inp.style.height='auto';
  appendMsg('user',txt);
  chatHistory.push({role:'user',content:txt});
  showTyping();
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:WHS_SYSTEM,messages:chatHistory})});
    const d=await r.json();
    hideTyping();
    const reply=d.content?.[0]?.text||"I'm having trouble connecting. Please email danielle.fairclough@palmbeachschools.org.";
    chatHistory.push({role:'assistant',content:reply});
    appendMsg('bot',reply);
  }catch(e){
    hideTyping();
    appendMsg('bot',"⚠️ Connection issue. Please contact your counselor directly.");
  }
}
function sendTopic(t){sendMessage(t);}
function appendMsg(role,text){
  const msgs=document.getElementById('cw-messages');
  const isBot=role==='bot';
  const time=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  let html=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>')
    .replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
  const d=document.createElement('div');
  d.className=`msg ${role}`;
  d.innerHTML=`<div class="msg-av ${isBot?'bot-av':'usr-av'}">${isBot?'🧭':'ME'}</div><div><div class="msg-bub">${html}</div><div class="msg-time">${time}</div></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function showTyping(){
  chatTyping=true;
  const send=document.getElementById('cw-send');if(send)send.disabled=true;
  const msgs=document.getElementById('cw-messages');
  const d=document.createElement('div');d.className='msg bot';d.id='typing-msg';
  d.innerHTML=`<div class="msg-av bot-av">🧭</div><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function hideTyping(){
  chatTyping=false;
  const send=document.getElementById('cw-send');if(send)send.disabled=false;
  const el=document.getElementById('typing-msg');if(el)el.remove();
}
function handleCwKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}}
function cwResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,90)+'px';}
function clearChat(){chatHistory=[];initChat();}
document.addEventListener('DOMContentLoaded',initChat);
