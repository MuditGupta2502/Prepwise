const toast = document.getElementById('toast');
let toastTimer;
const dateLabel = document.querySelector('.eyebrow');
dateLabel.lastChild.textContent = ` ${new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date()).toUpperCase()}`;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const view = link.dataset.view;
    document.querySelectorAll('.nav-link').forEach(item => item.classList.toggle('active', item === link));
    document.getElementById('crumbCurrent').textContent = link.textContent.trim();
    if (view === 'learn') {
      document.getElementById('pathsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (view === 'practice') {
      openPracticeHub();
    } else if (view === 'library') {
      openLibrary();
    } else if (view === 'tutor') {
      openTutor();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('globalSearch').addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  let matches = 0;
  document.querySelectorAll('.path-card').forEach(card => {
    const visible = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
    card.hidden = !visible;
    if (visible) matches++;
  });
  document.getElementById('explorePaths').hidden = Boolean(query);
  if (query) document.getElementById('pathsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (query && matches === 0) showToast('No learning paths found. Try “design” or “AI”.');
});

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    document.getElementById('globalSearch').focus();
  }
  if (event.key === 'Escape') {
    document.getElementById('globalSearch').blur();
    document.querySelector('.quiz-overlay,.lesson-overlay,.library-overlay,.track-overlay,.practice-overlay,.problem-overlay,.tutor-overlay')?.remove();
  }
});

document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function openLesson() {
  if (document.querySelector('.lesson-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'lesson-overlay';
  overlay.innerHTML = `<article class="lesson-dialog" role="dialog" aria-modal="true" aria-labelledby="lessonTitle"><header class="lesson-toolbar"><span class="lesson-breadcrumb">DATA STRUCTURES &amp; ALGORITHMS <span>›</span> ARRAYS</span><button class="lesson-close" aria-label="Close lesson">×</button></header><div class="lesson-body"><div class="lesson-progress"><span>LESSON 4 OF 8</span><div><i></i></div><b>50%</b></div><div class="section-eyebrow">CORE PATTERN · 8 MIN READ</div><h1 id="lessonTitle">Sliding window</h1><p class="lesson-lead">A simple way to work with a contiguous range without recomputing everything from scratch.</p><div class="lesson-callout"><span class="callout-icon">✳</span><div><b>The idea</b><p>Keep a window over part of an array. Move its edges as you scan, updating only what entered or left the window.</p></div></div><h2>When it helps</h2><p>Look for problems about a <strong>contiguous</strong> subarray or substring: a longest span, a shortest span, or a rolling total. If each step can update the current range in constant time, the technique often turns a nested-loop solution into a linear scan.</p><div class="lesson-code"><div class="lesson-code-head"><span>MAX SUM OF K CONSECUTIVE VALUES</span><span>PYTHON</span></div><pre><code><em>window_sum</em> = sum(nums[:k])\n<strong>best</strong> = window_sum\n\n<strong>for</strong> right <strong>in</strong> range(k, len(nums)):\n    window_sum += nums[right] - nums[right - k]\n    best = max(best, window_sum)</code></pre></div><div class="lesson-tip"><b>Keep this in mind</b><span>For a fixed-size window, add the new right value and remove the value just left of the window. That keeps each move O(1).</span></div><div class="lesson-check"><div class="section-eyebrow">QUICK CHECK</div><h2>What makes this approach efficient?</h2><div class="lesson-answers"><button data-correct="false">It sorts the array before scanning.</button><button data-correct="true">It updates the range using only the values that enter or leave.</button><button data-correct="false">It checks every possible pair of indices.</button></div><div class="lesson-answer-feedback" aria-live="polite"></div></div><footer class="lesson-footer"><span>About 12 minutes left in this lesson</span><button class="button button-dark lesson-complete" disabled>Complete lesson <span>→</span></button></footer></div></article>`;
  document.body.append(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.lesson-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  overlay.querySelectorAll('.lesson-answers button').forEach(answer => answer.addEventListener('click', () => {
    const correct = answer.dataset.correct === 'true';
    overlay.querySelectorAll('.lesson-answers button').forEach(button => button.disabled = true);
    answer.classList.add(correct ? 'answer-correct' : 'answer-wrong');
    if (!correct) overlay.querySelector('[data-correct="true"]').classList.add('answer-correct');
    overlay.querySelector('.lesson-answer-feedback').textContent = correct
      ? 'Exactly. Reusing the previous window state avoids recalculating the whole range.'
      : 'The key is reusing the previous range: update it with only the values that enter or leave.';
    overlay.querySelector('.lesson-complete').disabled = false;
  }));
  overlay.querySelector('.lesson-complete').addEventListener('click', () => {
    localStorage.setItem('prepwise-sliding-window-complete', 'true');
    document.querySelector('.continue-card .card-kicker').innerHTML = '<span class="live-dot"></span> LESSON COMPLETE · NEXT UP';
    document.querySelector('.continue-card h2').innerHTML = 'Longest substring<br/>without repeats';
    document.querySelector('.continue-desc').textContent = 'Great work. Keep going with a classic variable-size window problem.';
    document.querySelector('.lesson-meta').innerHTML = '<span>Next lesson</span><span class="meta-sep">·</span><span>Lesson 5 of 8</span>';
    close();
    showToast('Lesson complete. Your progress has been saved.');
  });
}

async function openLibrary() {
  if (document.querySelector('.library-overlay')) return;
  let curriculum;
  try{curriculum=await getCurriculum();}catch(error){showToast(error.message);return;}
  const overlay = document.createElement('div');
  overlay.className = 'library-overlay';
  overlay.innerHTML = `<section class="library-dialog" role="dialog" aria-modal="true" aria-labelledby="libraryTitle"><header class="library-toolbar"><div><div class="section-eyebrow">YOUR STUDY LIBRARY · 37 GUIDES</div><h2 id="libraryTitle">Study guides</h2></div><button class="library-close" aria-label="Close library">×</button></header><div class="library-content"><div class="library-selectors"><label>TRACK<select class="library-track"></select></label><label>LESSON<select class="library-lesson-select"></select></label></div><div class="library-intro"><span class="library-cover"><span>PW</span><i>✳</i></span><div><span class="guide-tag"></span><h3></h3><p></p><div class="guide-details"><span class="guide-minutes"></span><span>·</span><span>Prepwise course guide</span></div></div></div><div class="guide-preview"><div class="section-eyebrow">LESSON NOTES</div><div class="library-note markdown-body"></div><h3>Worked example</h3><p class="library-example-explanation"></p><div class="preview-code"><span class="library-code-label"></span><pre></pre></div><div class="preview-takeaway"><b>Quick check</b><span class="library-check"></span></div><div class="preview-takeaway library-practice"><b>Practice prompt</b><span class="library-exercise"></span></div><details class="library-solution"><summary>Show hint and sample solution</summary><p class="library-hint"></p><p class="library-solution-text"></p></details></div><footer class="library-footer"><span>Choose a guide and save it as a PDF for offline study.</span><button class="button button-dark pdf-button"><svg viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/></svg>Save as PDF</button></footer></div></section>`;
  document.body.append(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.library-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  const trackSelect=overlay.querySelector('.library-track');
  const lessonSelect=overlay.querySelector('.library-lesson-select');
  trackSelect.innerHTML=curriculum.tracks.map(track=>`<option value="${track.id}">${escapeHtml(track.title)}</option>`).join('');
  const showLesson=()=>{
    const track=curriculum.tracks.find(item=>item.id===trackSelect.value);
    lessonSelect.innerHTML=track.lessons.map((lesson,index)=>`<option value="${index}">${String(index+1).padStart(2,'0')} · ${escapeHtml(lesson.title)}</option>`).join('');
    lessonSelect.value=String(Math.min(Number(lessonSelect.dataset.index||0),track.lessons.length-1));
    const lesson=track.lessons[Number(lessonSelect.value)];
    overlay.querySelector('.guide-tag').textContent=track.title.toUpperCase();
    overlay.querySelector('.library-intro h3').textContent=lesson.title;
    overlay.querySelector('.library-intro p').textContent=lesson.summary;
    overlay.querySelector('.guide-minutes').textContent=`${lesson.minutes} min read`;
    renderAssistantMarkdown(overlay.querySelector('.library-note'),lesson.content);
    overlay.querySelector('.library-example-explanation').textContent=lesson.example.explanation;
    overlay.querySelector('.library-code-label').textContent=`WORKED EXAMPLE · ${lesson.example.language.toUpperCase()}`;
    overlay.querySelector('.preview-code pre').textContent=lesson.example.code;
    overlay.querySelector('.library-check').textContent=`${lesson.check.question} Answer: ${lesson.check.options[lesson.check.answerIndex]}. ${lesson.check.explanation}`;
    overlay.querySelector('.library-exercise').textContent=lesson.exercise.prompt;
    overlay.querySelector('.library-hint').textContent=`Hint: ${lesson.exercise.hint}`;
    overlay.querySelector('.library-solution-text').textContent=`Sample solution: ${lesson.exercise.solution}`;
  };
  trackSelect.addEventListener('change',()=>{lessonSelect.dataset.index='0';showLesson();});
  lessonSelect.addEventListener('change',()=>{lessonSelect.dataset.index=lessonSelect.value;showLesson();});
  overlay.querySelector('.pdf-button').addEventListener('click',()=>{const oldTitle=document.title;document.title=`Prepwise - ${overlay.querySelector('.library-intro h3').textContent} Study Guide`;overlay.querySelector('.library-solution').open=true;window.print();overlay.querySelector('.library-solution').open=false;document.title=oldTitle;});
  showLesson();
}

function openTutor() {
  if(document.querySelector('.tutor-overlay'))return;
  const overlay=document.createElement('div');overlay.className='tutor-overlay';
  overlay.innerHTML=`<section class="tutor-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorTitle"><header class="tutor-header"><div><div class="section-eyebrow">YOUR AI STUDY COMPANION</div><h2 id="tutorTitle">Ask Prepwise</h2></div><span class="tutor-mode"><i></i> GROUNDED IN YOUR STUDY LIBRARY</span><button class="tutor-close" aria-label="Close tutor">×</button></header><div class="tutor-chat"><div class="tutor-welcome"><span class="tutor-orb">✳</span><h3>What are you learning today?</h3><p>Ask for an explanation, a hint, or help understanding a concept. I’ll use your study material and point you to sources.</p><div class="tutor-prompts"><button>Explain sliding window simply</button><button>When should I use RAG?</button><button>How do I estimate system capacity?</button></div></div><div class="tutor-messages" aria-live="polite"></div></div><form class="tutor-form"><select aria-label="Choose a topic"><option value="all">All topics</option><option value="dsa">LeetCode &amp; DSA</option><option value="competitive">Competitive programming</option><option value="lld">Low-level design</option><option value="hld">High-level design</option><option value="ai">AI engineering</option></select><div class="tutor-input-wrap"><textarea maxlength="1200" rows="2" placeholder="Ask a question about your prep..." required></textarea><button type="submit" aria-label="Send question">↑</button></div><small>Prepwise teaches from your course library. It does not conduct mock interviews.</small></form></section>`;
  document.body.append(overlay);const close=()=>overlay.remove();
  overlay.querySelector('.tutor-close').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  const input=overlay.querySelector('textarea');const messages=overlay.querySelector('.tutor-messages');
  overlay.querySelectorAll('.tutor-prompts button').forEach(button=>button.addEventListener('click',()=>{input.value=button.textContent;input.focus();}));
  const addMessage=(role,text,sources=[])=>{const item=document.createElement('article');item.className=`tutor-message ${role}`;const label=document.createElement('b');label.textContent=role==='user'?'You':'Prepwise';const body=document.createElement('div');body.className=role==='assistant'?'tutor-message-content markdown-body':'tutor-message-content';if(role==='assistant')renderAssistantMarkdown(body,text);else body.textContent=text;item.append(label,body);if(sources.length){const citations=document.createElement('div');citations.className='tutor-citations';sources.forEach(source=>{const tag=document.createElement('span');tag.textContent=`${source.title} · ${source.source}`;citations.append(tag);});item.append(citations);}messages.append(item);messages.scrollTop=messages.scrollHeight;return item;};
  overlay.querySelector('.tutor-form').addEventListener('submit',async event=>{
    event.preventDefault();const question=input.value.trim();if(!question)return;
    const history=[...messages.querySelectorAll('.tutor-message')].slice(-6).map(message=>({role:message.classList.contains('user')?'user':'assistant',content:message.querySelector('.tutor-message-content')?.textContent.slice(0,1200)||''}));
    input.value='';overlay.querySelector('.tutor-welcome').hidden=true;addMessage('user',question);
    const pending=addMessage('assistant','Searching your study library and preparing an explanation…');
    const submit=overlay.querySelector('.tutor-input-wrap button');submit.disabled=true;
    try{const apiBase=String(window.PREPWISE_API_BASE||'').replace(/\/$/,'');const response=await fetch(`${apiBase}/api/tutor`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,track:overlay.querySelector('select').value,history})});const result=await response.json();if(!response.ok)throw new Error(result.error||result.detail||'Tutor request failed.');pending.remove();addMessage('assistant',result.answer,result.sources||[]);if(result.mode==='demo')showToast('Demo tutor · add an API key to enable generated answers.');}
    catch(error){pending.remove();addMessage('assistant',`${error.message} Make sure the FastAPI server is running with python -m uvicorn server:app --reload --port 8001.`);}
    finally{submit.disabled=false;input.focus();}
  });
  input.focus();
}

function renderAssistantMarkdown(container,text){
  const formulas=[];
  const masked=String(text).replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([^\n]+?)\\\)|\$([^$\n]+?)\$/g,(match,displayDollar,displayBracket,inlineParen,inlineDollar)=>{
    const display=displayDollar!==undefined||displayBracket!==undefined;
    const tex=displayDollar??displayBracket??inlineParen??inlineDollar;
    const token=`PREPWSEMATHPLACEHOLDER${formulas.length}END`;
    formulas.push({token,tex,display});
    return token;
  });
  let html=window.DOMPurify.sanitize(window.marked.parse(masked,{gfm:true,breaks:true}));
  for(const formula of formulas){
    const stack=[];
    for(let i=0;i<formula.tex.length;i++){
      if(formula.tex[i]==='\\'){i++;continue;}
      const ch=formula.tex[i];
      if(ch==='(')stack.push(')');else if(ch==='{')stack.push('}');else if(ch==='[')stack.push(']');
      else if(ch===')'||ch==='}'||ch===']'){if(stack.at(-1)===ch)stack.pop();}
    }
    const tex=formula.tex+stack.reverse().join('');
    const math=window.katex.renderToString(tex,{displayMode:formula.display,throwOnError:false,trust:false});
    html=html.replace(formula.token,math);
  }
  container.innerHTML=window.DOMPurify.sanitize(html);
}

document.getElementById('resumeButton').addEventListener('click', openLesson);
if (localStorage.getItem('prepwise-sliding-window-complete') === 'true') {
  document.querySelector('.continue-card .card-kicker').innerHTML = '<span class="live-dot"></span> LESSON COMPLETE · NEXT UP';
  document.querySelector('.continue-card h2').innerHTML = 'Longest substring<br/>without repeats';
  document.querySelector('.continue-desc').textContent = 'Great work. Keep going with a classic variable-size window problem.';
  document.querySelector('.lesson-meta').innerHTML = '<span>Next lesson</span><span class="meta-sep">·</span><span>Lesson 5 of 8</span>';
}
document.getElementById('planButton').addEventListener('click', openStudyPlanner);
document.getElementById('todayButton').addEventListener('click', openStudyPlanner);
document.getElementById('addFocus').addEventListener('click', () => showToast('Choose a learning path below to add it to your focus.'));
document.getElementById('explorePaths').addEventListener('click', () => {
  document.getElementById('pathsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('Explore all five learning paths above.');
});

document.querySelectorAll('.path-card').forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role','button');
  card.addEventListener('click', () => {
    const key = card.classList.contains('path-cp') ? 'competitive' : ['dsa','lld','hld','ai'].find(track => card.classList.contains(`path-${track}`));
    openTrack(key);
  });
  card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click();}});
});

function refreshDashboardProgress(){
  const courses={dsa:['path-dsa'],competitive:['path-cp'],lld:['path-lld'],hld:['path-hld'],ai:['path-ai']};
  const curriculum=window.PREPWISE_CURRICULUM;
  for(const [key,[className]] of Object.entries(courses)){
    const card=document.querySelector(`.${className}`);if(!card)continue;
    const total=curriculum?.tracks.find(track=>track.id===key)?.lessons.length||window.PREPWISE_TRACKS[key].lessons.length;
    const count=Math.min(total,Number(localStorage.getItem(`prepwise-${key}-completed`)||0));
    card.querySelector('.path-card-bottom>span').innerHTML=`${count} <small>/ ${total} lessons</small>`;
    card.querySelector('.mini-progress i').style.width=`${count/total*100}%`;
  }
}
let curriculumPromise;
function getCurriculum(){
  if(!curriculumPromise)curriculumPromise=fetch('/content/curriculum.json').then(response=>{if(!response.ok)throw new Error('Could not load the lesson library.');return response.json();}).then(data=>{window.PREPWISE_CURRICULUM=data;for(const track of data.tracks){if(window.PREPWISE_TRACKS[track.id])window.PREPWISE_TRACKS[track.id].lessons=track.lessons.map(lesson=>[lesson.title,lesson.summary]);}refreshDashboardProgress();return data;});
  return curriculumPromise;
}
getCurriculum().catch(error=>console.error(error));
refreshDashboardProgress();

function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}

async function openTrack(key) {
  let track;
  try{track=(await getCurriculum()).tracks.find(item=>item.id===key);}catch(error){showToast(error.message);return;}
  if (!track || document.querySelector('.track-overlay')) return;
  const done = Number(localStorage.getItem(`prepwise-${key}-completed`) || 0);
  const overlay = document.createElement('div');
  overlay.className = 'track-overlay';
  overlay.innerHTML = `<section class="track-dialog" role="dialog" aria-modal="true"><header class="track-toolbar"><span>${escapeHtml(track.label)}</span><button class="track-close" aria-label="Close">×</button></header><div class="track-body"><div class="section-eyebrow">LEARNING PATH · ${track.lessons.length} LESSONS</div><h2>${escapeHtml(track.title)}</h2><p>${escapeHtml(track.description)}</p><div class="track-summary"><span>${done} of ${track.lessons.length} lessons complete</span><div><i style="width:${Math.min(100,done/track.lessons.length*100)}%"></i></div></div><div class="section-eyebrow track-list-label">START LEARNING</div><div class="track-lessons">${track.lessons.map((lesson,i)=>`<button class="track-lesson" data-lesson="${i}"><span class="track-lesson-num">${i<done?'✓':String(i+1).padStart(2,'0')}</span><span class="track-lesson-copy"><b>${escapeHtml(lesson.title)}</b><small>${escapeHtml(lesson.summary)}</small></span><span>→</span></button>`).join('')}</div><div class="track-footer-note">Every lesson includes a worked example, knowledge check, and practice exercise.</div></div></section>`;
  document.body.append(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('.track-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  overlay.querySelectorAll('.track-lesson').forEach(button => button.addEventListener('click', () => openTrackLesson(key, Number(button.dataset.lesson), close)));
}

async function openTrackLesson(key,index,closeTrack) {
  const track=(await getCurriculum()).tracks.find(item=>item.id===key);
  const lesson=track?.lessons[index];
  if(!lesson)return;
  const {title,summary,minutes,content,example,check,exercise}=lesson;
  const correctIndex=check.answerIndex;
  closeTrack();
  const overlay = document.createElement('div');
  overlay.className = 'lesson-overlay';
  overlay.innerHTML = `<article class="lesson-dialog"><header class="lesson-toolbar"><span class="lesson-breadcrumb">${escapeHtml(track.title.toUpperCase())} <span>›</span> LESSON ${index+1}</span><button class="lesson-close" aria-label="Close">×</button></header><div class="lesson-body"><div class="lesson-progress"><span>LESSON ${index+1} OF ${track.lessons.length}</span><div><i style="width:${(index+1)/track.lessons.length*100}%"></i></div><b>${Math.round((index+1)/track.lessons.length*100)}%</b></div><div class="section-eyebrow">LESSON · ${minutes} MIN</div><h1>${escapeHtml(title)}</h1><p class="lesson-lead">${escapeHtml(summary)}</p><div class="lesson-callout"><span class="callout-icon">✳</span><div><b>Learning note</b><p>Read the concept, study the example, then try the exercise before revealing the solution.</p></div></div><div class="curriculum-content markdown-body"></div><h2>Worked example</h2><p>${escapeHtml(example.explanation)}</p><div class="lesson-code"><div class="lesson-code-head"><span>EXAMPLE</span><span>${escapeHtml(example.language.toUpperCase())}</span></div><pre><code></code></pre></div><div class="lesson-check"><div class="section-eyebrow">QUICK CHECK</div><h2>${escapeHtml(check.question)}</h2><div class="lesson-answers">${check.options.map((choice,i)=>`<button data-choice="${i}">${escapeHtml(choice)}</button>`).join('')}</div><div class="lesson-answer-feedback" aria-live="polite"></div></div><section class="lesson-exercise"><div class="section-eyebrow">PRACTICE · APPLY IT</div><h2>${escapeHtml(exercise.prompt)}</h2><details><summary>Show a hint</summary><p>${escapeHtml(exercise.hint)}</p></details><details><summary>Reveal a sample solution</summary><p>${escapeHtml(exercise.solution)}</p></details></section><footer class="lesson-footer"><span>${escapeHtml(track.title)} · Lesson ${index+1} of ${track.lessons.length}</span><button class="button button-dark lesson-complete" disabled>Complete lesson <span>→</span></button></footer></div></article>`;
  document.body.append(overlay);
  renderAssistantMarkdown(overlay.querySelector('.curriculum-content'),content);
  overlay.querySelector('.lesson-code code').textContent=example.code;
  const close = () => overlay.remove();
  overlay.querySelector('.lesson-close').addEventListener('click', close);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  overlay.querySelectorAll('.lesson-answers button').forEach(answer=>answer.addEventListener('click',()=>{
    const correct=Number(answer.dataset.choice)===correctIndex;
    overlay.querySelectorAll('.lesson-answers button').forEach(button=>{button.disabled=true;if(Number(button.dataset.choice)===correctIndex)button.classList.add('answer-correct');});
    if(!correct)answer.classList.add('answer-wrong');
    overlay.querySelector('.lesson-answer-feedback').textContent=correct?`Correct. ${check.explanation}`:`Not quite. ${check.explanation}`;
    overlay.querySelector('.lesson-complete').disabled=false;
  }));
  overlay.querySelector('.lesson-complete').addEventListener('click',()=>{const n=Number(localStorage.getItem(`prepwise-${key}-completed`)||0);localStorage.setItem(`prepwise-${key}-completed`,String(Math.max(n,index+1)));refreshDashboardProgress();close();showToast(`${title} marked complete. Progress saved.`);});
}

function openPracticeHub() {
  if(document.querySelector('.practice-overlay'))return;
  const overlay=document.createElement('div');overlay.className='practice-overlay';
  overlay.innerHTML=`<section class="practice-dialog" role="dialog" aria-modal="true"><button class="practice-close" aria-label="Close">×</button><div class="section-eyebrow">PRACTICE · YOUR WAY</div><h2>Choose a quick exercise</h2><p class="quiz-helper">Build confidence through short, focused reps.</p><button class="practice-choice" data-kind="quiz"><span class="practice-choice-icon">✓</span><span><b>Knowledge quiz</b><small>5 questions on core concepts · ~5 min</small></span><span>→</span></button><button class="practice-choice" data-kind="problem"><span class="practice-choice-icon code-choice">{ }</span><span><b>Problem-solving exercise</b><small>Try a classic sliding-window problem · ~15 min</small></span><span>→</span></button></section>`;
  document.body.append(overlay);const close=()=>overlay.remove();
  overlay.querySelector('.practice-close').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  overlay.querySelector('[data-kind="quiz"]').addEventListener('click',()=>{close();document.getElementById('quizButton').click();});
  overlay.querySelector('[data-kind="problem"]').addEventListener('click',()=>{close();openProblem();});
}

function openProblem() {
  const overlay=document.createElement('div');overlay.className='problem-overlay';
  overlay.innerHTML=`<section class="problem-dialog" role="dialog" aria-modal="true"><header class="problem-toolbar"><div><div class="section-eyebrow">PROBLEM-SOLVING · ARRAYS</div><h2>Maximum sum of a size-k subarray</h2></div><button class="problem-close" aria-label="Close">×</button></header><div class="problem-body"><div class="problem-difficulty"><span><i></i> Easy</span><span>15 min</span><span>Sliding window</span></div><p>Given an integer array <code>nums</code> and an integer <code>k</code>, find the maximum sum of any contiguous subarray of length <code>k</code>.</p><h3>Example</h3><div class="example-block"><code>nums = [2, 1, 5, 1, 3, 2], k = 3</code><code>Output: 9</code><small>The subarray [5, 1, 3] has the largest sum.</small></div><div class="problem-actions"><button class="hint-toggle">Show a hint</button><button class="solution-toggle">Reveal approach</button></div><div class="problem-hint" hidden>Calculate the first window once. Then slide it one position at a time: add the new value and subtract the value that just left.</div><div class="problem-solution" hidden><b>Approach</b><p>Sum the first k elements. For each next index, update the running sum in O(1), then track the largest sum. Time: O(n). Extra space: O(1).</p><pre>window_sum = sum(nums[:k])&#10;best = window_sum&#10;for right in range(k, len(nums)):&#10;    window_sum += nums[right] - nums[right-k]&#10;    best = max(best, window_sum)</pre></div><div class="self-check"><label><input type="checkbox"> I can explain why each window update takes constant time.</label><button class="button button-dark problem-done" disabled>Mark complete <span>→</span></button></div></div></section>`;
  document.body.append(overlay);const close=()=>overlay.remove();
  overlay.querySelector('.problem-close').addEventListener('click',close);overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  overlay.querySelector('.hint-toggle').addEventListener('click',event=>{const panel=overlay.querySelector('.problem-hint');panel.hidden=!panel.hidden;event.currentTarget.textContent=panel.hidden?'Show a hint':'Hide hint';});
  overlay.querySelector('.solution-toggle').addEventListener('click',event=>{const panel=overlay.querySelector('.problem-solution');panel.hidden=!panel.hidden;event.currentTarget.textContent=panel.hidden?'Reveal approach':'Hide approach';});
  const box=overlay.querySelector('input[type="checkbox"]');box.addEventListener('change',()=>overlay.querySelector('.problem-done').disabled=!box.checked);
  overlay.querySelector('.problem-done').addEventListener('click',()=>{localStorage.setItem('prepwise-problem-complete','true');close();showToast('Exercise complete. Progress saved.');});
}

function openStudyPlanner(){
  if(document.querySelector('.planner-overlay'))return;
  const saved=JSON.parse(localStorage.getItem('prepwise-study-plan')||'null');
  const overlay=document.createElement('div');overlay.className='planner-overlay';
  overlay.innerHTML=`<section class="planner-dialog" role="dialog" aria-modal="true" aria-labelledby="plannerTitle"><header class="planner-header"><div><div class="section-eyebrow">A PLAN THAT FITS YOUR LIFE</div><h2 id="plannerTitle">Build your study plan</h2><p>Pick a focus and a realistic weekly rhythm. You can change it any time.</p></div><button class="planner-close" aria-label="Close planner">×</button></header><div class="planner-config"><label>LEARNING TRACK<select id="planTrack"><option value="dsa">LeetCode &amp; DSA</option><option value="competitive">Competitive programming</option><option value="lld">Low-level design</option><option value="hld">High-level design</option><option value="ai">AI engineering</option></select></label><label>STUDY DAYS<select id="planDays"><option value="3">3 days / week</option><option value="4">4 days / week</option><option value="5">5 days / week</option><option value="6">6 days / week</option></select></label><label>TIME PER DAY<select id="planMinutes"><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></label><button class="button button-dark generate-plan">Preview plan <span>→</span></button></div><div class="planner-preview" aria-live="polite"></div><footer class="planner-footer"><span>Your plan is saved only in this browser.</span><button class="button button-lime save-plan" disabled>Save this plan <span>✓</span></button></footer></section>`;
  document.body.append(overlay);
  const close=()=>overlay.remove();
  overlay.querySelector('.planner-close').addEventListener('click',close);
  overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
  const trackSelect=overlay.querySelector('#planTrack');
  const daysSelect=overlay.querySelector('#planDays');
  const minutesSelect=overlay.querySelector('#planMinutes');
  if(saved){trackSelect.value=saved.track;daysSelect.value=String(saved.daysPerWeek);minutesSelect.value=String(saved.minutesPerDay);}
  let currentPlan=saved;
  const renderPlan=()=>{
    const trackKey=trackSelect.value;
    const track=window.PREPWISE_TRACKS[trackKey];
    const count=Number(daysSelect.value);
    const minutes=Number(minutesSelect.value);
    const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const sessions=Array.from({length:count},(_,index)=>({day:days[index],lesson:track.lessons[index%track.lessons.length][0],minutes}));
    currentPlan={track:trackKey,daysPerWeek:count,minutesPerDay:minutes,sessions};
    overlay.querySelector('.planner-preview').innerHTML=`<div class="planner-preview-heading"><div><div class="section-eyebrow">YOUR WEEKLY RHYTHM</div><h3>${count*minutes/60} hours / week <span>·</span> ${track.title}</h3></div><span class="planner-total">${count} sessions</span></div><div class="planner-session-grid">${sessions.map((session,index)=>`<article class="planner-session"><span class="session-number">0${index+1}</span><div><b>${session.day}</b><span>${session.lesson}</span></div><small>${session.minutes} min</small></article>`).join('')}</div><div class="planner-tip"><span>✳</span><span>Each session pairs a focused lesson with a quick check, so you finish with something you can recall.</span></div>`;
    overlay.querySelector('.save-plan').disabled=false;
  };
  overlay.querySelector('.generate-plan').addEventListener('click',renderPlan);
  if(saved)renderPlan();
  overlay.querySelector('.save-plan').addEventListener('click',()=>{
    if(!currentPlan)return;
    localStorage.setItem('prepwise-study-plan',JSON.stringify(currentPlan));
    updateTodayFocus(currentPlan);
    close();
    showToast('Study plan saved. Today’s focus is updated.');
  });
}

function updateTodayFocus(plan){
  const today=(new Intl.DateTimeFormat('en-US',{weekday:'long'}).format(new Date()));
  const todaySession=plan.sessions.find(session=>session.day===today)||plan.sessions[0];
  const track=window.PREPWISE_TRACKS[plan.track];
  const items=[
    {title:`Learn: ${todaySession.lesson}`,detail:`${track.title} · ${Math.max(10,Math.round(todaySession.minutes*.6))} min`,status:'TODAY'},
    {title:'Practice: quick check',detail:`${track.title} · ${Math.max(5,Math.round(todaySession.minutes*.25))} min`,status:'PRACTICE'},
    {title:'Review your key takeaways',detail:`${track.title} · ${Math.max(1,todaySession.minutes-Math.round(todaySession.minutes*.6)-Math.round(todaySession.minutes*.25))} min`,status:'REVIEW'}
  ];
  const list=document.querySelector('.today-list');
  list.innerHTML=items.map((item,index)=>`<div class="today-item"><div class="task-check ${index===0?'checked':''}">${index===0?'✓':''}</div><div class="task-copy"><b>${item.title}</b><small>${item.detail}</small></div><span class="task-status ${index===0?'status-next':''}">${item.status}</span></div>`).join('');
  const footer=document.querySelector('.today-footer');
  footer.firstChild.textContent=`${today} · ${plan.daysPerWeek} study days / week`;
}

const savedStudyPlan=JSON.parse(localStorage.getItem('prepwise-study-plan')||'null');
if(savedStudyPlan)updateTodayFocus(savedStudyPlan);

const quizQuestions = [
  { q: 'Which technique is most useful when a subarray must be found in a contiguous sequence?', options: ['Depth-first search', 'Sliding window', 'Binary search tree', 'Topological sort'], correct: 1, why: 'Sliding window tracks a contiguous range while moving its boundaries efficiently.' },
  { q: 'For a fixed-size window, what should happen when it moves one position right?', options: ['Recalculate every value in the range', 'Sort the current range', 'Add the new value and remove the value that left', 'Restart the scan from index zero'], correct: 2, why: 'Updating only the entering and leaving values keeps each move constant time.' },
  { q: 'What is the usual time complexity for finding the maximum sum of any k-length subarray with a sliding window?', options: ['O(n)', 'O(n log n)', 'O(n × k)', 'O(2ⁿ)'], correct: 0, why: 'The initial sum takes O(k), then the window moves across the array once: O(n) overall.' },
  { q: 'When is a variable-size window commonly useful?', options: ['When the input is a tree', 'When a contiguous range must satisfy a condition', 'When every pair of values must be compared', 'When the array must be sorted in place'], correct: 1, why: 'Variable-size windows expand and shrink to maintain a condition over a contiguous range.' },
  { q: 'Which clue most strongly suggests trying a sliding-window approach?', options: ['Find a path through a graph', 'Find a contiguous substring with a property', 'Find a node in a balanced tree', 'Order tasks by dependency'], correct: 1, why: 'Contiguous subarrays and substrings are classic signals to consider sliding windows.' }
];

document.getElementById('quizButton').addEventListener('click', () => {
  if (document.querySelector('.quiz-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'quiz-overlay';
  document.body.append(overlay);
  let index = 0;
  let score = 0;
  const close = () => overlay.remove();
  const renderQuestion = () => {
    const item = quizQuestions[index];
    overlay.innerHTML = `<section class="quiz-dialog" role="dialog" aria-modal="true" aria-labelledby="quizTitle"><button class="quiz-close" aria-label="Close quiz">×</button><div class="section-eyebrow">QUICK QUIZ · QUESTION ${index + 1} OF ${quizQuestions.length}</div><div class="quiz-progress"><i style="width:${(index / quizQuestions.length) * 100}%"></i></div><h2 id="quizTitle">${item.q}</h2><p class="quiz-helper">Pick the best answer. You’ll get a short explanation.</p><div class="quiz-options">${item.options.map((option, i) => `<button data-index="${i}">${option}</button>`).join('')}</div><div class="quiz-feedback" aria-live="polite"></div><button class="quiz-next" disabled>Continue <span>→</span></button></section>`;
    overlay.querySelector('.quiz-close').addEventListener('click', close);
    overlay.querySelectorAll('.quiz-options button').forEach(option => option.addEventListener('click', () => {
      const selected = Number(option.dataset.index);
      const correct = selected === item.correct;
      if (correct) score++;
      overlay.querySelectorAll('.quiz-options button').forEach(button => {
        button.disabled = true;
        if (Number(button.dataset.index) === item.correct) button.classList.add('answer-correct');
      });
      if (!correct) option.classList.add('answer-wrong');
      overlay.querySelector('.quiz-feedback').textContent = `${correct ? 'Correct!' : 'Not quite.'} ${item.why}`;
      const next = overlay.querySelector('.quiz-next');
      next.disabled = false;
      next.innerHTML = index === quizQuestions.length - 1 ? 'See my results <span>→</span>' : 'Continue <span>→</span>';
      next.addEventListener('click', () => {
        index++;
        if (index < quizQuestions.length) renderQuestion();
        else renderResults();
      }, { once: true });
    }));
    overlay.querySelector('.quiz-close').focus();
  };
  const renderResults = () => {
    localStorage.setItem('prepwise-last-quiz', JSON.stringify({ score, total: quizQuestions.length, date: new Date().toISOString() }));
    const message = score === quizQuestions.length ? 'Perfect score. You’ve got this pattern down.' : score >= 3 ? 'Nice work. Review the explanations for the ones you missed.' : 'Good start. Revisit the lesson and try again when you’re ready.';
    overlay.innerHTML = `<section class="quiz-dialog quiz-results" role="dialog" aria-modal="true"><button class="quiz-close" aria-label="Close quiz">×</button><div class="result-mark">${score === quizQuestions.length ? '✳' : '✓'}</div><div class="section-eyebrow">QUIZ COMPLETE</div><h2>You got ${score} out of ${quizQuestions.length}</h2><p class="quiz-helper">${message}</p><div class="result-meter"><i style="width:${score / quizQuestions.length * 100}%"></i></div><button class="quiz-next result-done">Back to your dashboard <span>→</span></button></section>`;
    overlay.querySelector('.quiz-close').addEventListener('click', close);
    overlay.querySelector('.result-done').addEventListener('click', () => { close(); showToast(`Quiz result saved: ${score}/${quizQuestions.length}.`); });
  };
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  renderQuestion();
});
