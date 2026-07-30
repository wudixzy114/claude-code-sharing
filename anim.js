// ===================================================================
// SlideAnim — the interactive demos.
// Demo slide indices (0-based, match onShow): 5=loop, 10=budget,
// 13=compression, 27=permission. If you reorder slides, fix onShow().
// Each demo is a small state machine driven by clicks; onShow() resets
// the demo whose slide just became visible.
// ===================================================================
(function(){

  // ---- helpers ----
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const el = (cls, html) => { const d=document.createElement('div'); d.className=cls; d.innerHTML=html; return d; };

  // ============================================================
  // 1) LOOP demo (slide 03) — run "重构 parsePath" round by round
  // ============================================================
  const LoopDemo = (function(){
    const ring = $('#loopRing');
    if(!ring) return {reset(){}};
    const steps = $$('.rstep', ring);
    const roundEl = $('#loopRound');
    const verdictEl = $('#loopVerdict');
    const log = $('#loopLog');
    const nextBtn = $('#loopNext');
    const resetBtn = $('#loopReset');
    const status = $('#loopStatus');

    // scripted transcript: each entry = one message appended to the log,
    // tagged with which ring-step it belongs to.
    const script = [
      {step:0, round:1, kind:'user',  title:'你',     text:'重构 parsePath，保持兼容，跑测试验证'},
      {step:1, round:1, kind:'model', title:'模型',   text:'我先看看这个函数现在长什么样 → 要调 Read'},
      {step:2, round:1, kind:'tool',  title:'工具 Read', text:'parsePath(): 42 行，3 处正则拼接，无测试注释'},
      {step:3, round:1, kind:'model', title:'模型',   text:'看懂了，用 URL 解析重写，然后改文件 → 要调 Edit'},
      {step:2, round:2, kind:'tool',  title:'工具 Edit', text:'已改写 parsePath，diff：-31 / +18 行'},
      {step:3, round:2, kind:'model', title:'模型',   text:'改完了，跑测试确认没改坏 → 要调 Bash'},
      {step:2, round:3, kind:'tool',  title:'工具 Bash', text:'npm test → 1 个失败：query 为空时返回 null'},
      {step:3, round:3, kind:'model', title:'模型',   text:'边界没处理，补一个空值分支 → 再调 Edit'},
      {step:2, round:4, kind:'tool',  title:'工具 Bash', text:'npm test → 全部 12 项通过 ✓'},
      {step:4, round:4, kind:'done',  title:'收工',   text:'测试通过，没有新的工具调用 → 结束，汇报结果'},
    ];

    let ptr = 0;
    const stepLabel = ['准备','问模型','跑工具','收结果','判断'];

    function highlight(stepIdx){
      steps.forEach(s => s.classList.toggle('on', Number(s.dataset.step)===stepIdx));
    }

    function reset(){
      ptr = 0;
      log.innerHTML = '';
      highlight(-1);
      roundEl.textContent = '第 0 轮';
      verdictEl.textContent = '点"下一步"开始';
      status.textContent = '看左边高亮走到哪一步，右边记录怎么变长';
      nextBtn.disabled = false;
      nextBtn.textContent = '下一步 ▶';
    }

    function step(){
      if(ptr >= script.length) return;
      const e = script[ptr++];
      highlight(e.step);
      roundEl.textContent = '第 '+e.round+' 轮 · '+stepLabel[e.step];
      const m = el('msg '+e.kind, '<b>'+e.title+'</b>'+e.text);
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;

      if(e.kind==='tool' && e.text.indexOf('失败')>=0){
        verdictEl.innerHTML = '测试挂了 —— <b style="color:var(--orange)">不是崩溃</b>，报错回到下一轮';
      } else if(e.kind==='done'){
        verdictEl.innerHTML = '<b style="color:var(--teal)">达成，停下</b>';
        status.textContent = '一共 4 轮。注意：模型每轮看到的，都是右边这份越来越长的记录';
        nextBtn.disabled = true;
        nextBtn.textContent = '已完成 ✓';
      } else if(e.kind==='model'){
        verdictEl.textContent = '有新动作 → 继续下一轮';
      } else {
        verdictEl.textContent = stepLabel[e.step]+'…';
      }
    }

    nextBtn.addEventListener('click', step);
    resetBtn.addEventListener('click', reset);
    return {reset};
  })();

  // ============================================================
  // 2) BUDGET demo (slide 06) — what fills the window, visible vs
  //    invisible, and rough proportions. Bar animates; rows light up.
  // ============================================================
  const BudgetDemo = (function(){
    const track = $('#budgetTrack');
    if(!track) return {reset(){}};
    const rows = $$('.brow', $('#budgetRows'));
    const segs = $$('.bseg', track);
    const btn = $('#budgetPlay');
    const resetBtn = $('#budgetReset');
    const status = $('#budgetStatus');

    let timer = null;

    function clearTimer(){ if(timer){ clearInterval(timer); timer=null; } }

    function reset(){
      clearTimer();
      segs.forEach(s => {
        s.style.width = '0';
        s.classList.remove('revealed');
      });
      rows.forEach(r => r.classList.remove('lit'));
      status.textContent = '点一下，按进入顺序区分启动注入、对话产生和动态回填';
      btn.disabled = false;
      btn.textContent = '填充看看 ▶';
    }

    function fill(){
      clearTimer();
      segs.forEach(s => {
        s.style.width = '0';
        s.classList.remove('revealed');
      });
      rows.forEach(r => r.classList.remove('lit'));
      btn.disabled = true;
      let i = 0;
      // reveal segments one by one so the invisible fixed overhead
      // (front blocks) is seen landing *before* messages/tool results.
      timer = setInterval(() => {
        if(i >= segs.length){
          clearTimer();
          btn.disabled = false;
          btn.textContent = '再看一次 ▶';
          status.textContent = '看清了吗：橙色「工具结果」独占约 38%，是最容易把目标挤出去的一块';
          return;
        }
        const seg = segs[i];
        seg.classList.add('revealed');
        requestAnimationFrame(() => { seg.style.width = seg.dataset.w + '%'; });
        if(rows[i]) rows[i].classList.add('lit');
        i++;
      }, 620);
    }

    btn.addEventListener('click', fill);
    if(resetBtn) resetBtn.addEventListener('click', reset);
    return {reset};
  })();

  // ============================================================
  // 3) COMPRESSION demo (slide 13) — the FIVE real narrowing passes, on ONE
  //    context. Two modes on the same left rail (5 stage boxes):
  //    (a) 压一步: step passes 1..5; each visibly transforms a DIFFERENT block
  //        so you can see what that pass actually does. Meter drops each step.
  //    (b) 看动态压缩: a transcript grows past the threshold; the runtime
  //        escalates cheap→expensive, cheap passes first, model call last.
  //    Both advance one click at a time, each with a one-line caption.
  // ============================================================
  const CompDemo = (function(){
    const layersWrap = $('#compLayers');
    if(!layersWrap) return {reset(){}};
    const layers = $$('.comp-layer', layersWrap);   // now 5 stage boxes
    const list = $('#ctxList');
    const usedFill = $('#compUsed');
    const usedLabel = $('#compUsedLabel');
    const freeLabel = $('#compFreeLabel');
    const nextBtn = $('#compNext');
    const autoBtn = $('#compAuto');
    const resetBtn = $('#compReset');
    const status = $('#compStatus');
    const meter = $('#compMeter');

    // ---- ONE starting context that carries a distinct "target" for EACH of
    //      the five passes, so every step visibly changes a different block:
    //        · stale bulky output    → pass 1 budget 削减 drops it whole
    //        · one over-long output  → pass 2 snip keeps head/tail
    //        · repeated tool results → pass 3 microcompact dedups + refs
    //        · long exploration arc  → pass 4 collapse folds into one block
    //        · old history + recent  → pass 5 auto-compact summarizes (LLM)
    const initial = () => ([
      {cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
      {cls:'stale bulky', tag:'工具结果 · 20 轮前的构建日志', lines:[
        '&gt; webpack --mode production',
        'vendor.js 3.2 MiB · 210 行 chunk 哈希',
        '（很多轮前的，早就用不上了）']},
      {cls:'long bulky', tag:'工具结果 · 测试 stdout（超长单条）', lines:[
        'PASS  src/router/parse.test.ts',
        '…（共 900 行，中间大量逐用例输出）…',
        '1 项失败：空 query 返回 null']},
      {cls:'dup bulky', tag:'工具结果 · Grep ×3（重复）', lines:[
        'grep parsePath → 12 命中',
        'grep parsePath → 12 命中',
        'grep parsePath → 12 命中']},
      {cls:'arc', tag:'探索历史 · 早期 20 轮来回', lines:[
        '读 parse.ts → 试方案 A → 回退 → 试方案 B …',
        '（一大段试错对话，结论已定）']},
      {cls:'keep',  tag:'最近原文', lines:['最后一轮：补空 query 分支，准备再跑测试']},
    ]);

    // ---- manual mode: the five passes, in escalation order. Each returns the
    //      new block list. Passes 1..4 are local (green cut.local / drops);
    //      pass 5 is the only model call (yellow cut.llm).
    const passes = [
      // 1 · budget 削减 — drop the stale bulky output whole.
      (blocks) => blocks.filter(b => !b.cls.includes('stale')),
      // 2 · snip — the over-long single output keeps head + tail, mid elided.
      (blocks) => blocks.map(b => b.cls.includes('long')
        ? {cls:'shrunk', tag:b.tag, lines:[
            'PASS  src/router/parse.test.ts',
            '<span class="cut local">… 中间 896 行已省略 …</span>',
            '1 项失败：空 query 返回 null']}
        : b),
      // 3 · microcompact — dedup the 3 identical greps, swap for one reference.
      (blocks) => blocks.map(b => b.cls.includes('dup')
        ? {cls:'shrunk', tag:b.tag, lines:[
            'grep parsePath → 12 命中 <span class="cut local">×3 已去重</span>',
            '↳ 完整命中已存引用 <span class="cut local">换引用</span>']}
        : b),
      // 4 · context collapse — fold the long exploration arc into one compact block.
      (blocks) => blocks.map(b => b.cls==='arc'
        ? {cls:'shrunk', tag:'探索历史（已折叠）', lines:[
            '↳ 20 轮试错 → 结论：采用方案 B（URL 解析） <span class="cut local">折叠</span>']}
        : b),
      // 5 · auto-compact — one model call folds old history into summary + boundary,
      //     keeps the most recent turn verbatim. Only model-calling path.
      (blocks) => [
        {cls:'keep', tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
        {cls:'summary', tag:'全量压缩 · 一次模型调用', lines:['读 parsePath → 改写为 URL 解析 → 构建通过 → 测试补空 query 分支 → 12 项全过；细节按引用回查 <span class="cut llm">摘要+边界</span>']},
        {cls:'keep', tag:'最近原文（保留）', lines:['最后一轮：补空 query 分支，准备再跑测试']},
      ],
    ];

    // used% after: [start, after1, after2, after3, after4, after5]
    const usedByStep = [92, 82, 70, 60, 50, 30];
    const stratNames = ['budget 削减','snip 裁剪','microcompact 微压缩','context collapse 折叠','auto-compact 全量'];
    const stratCaps = [
      '按预算把很多轮前那块用不上的大工具输出整块丢掉 —— 本地、不调模型',
      '把那条 900 行的超长输出裁成头尾、中间省略 —— 本地、不调模型',
      '3 条重复 Grep 去重、完整命中换成一行引用 —— 本地、不调模型',
      '早期 20 轮试错历史折叠成一句结论 —— 本地、代价很低',
      '前四道都腾不出空间了，才调一次模型把旧历史压成摘要 + 边界，最近原文原样保留',
    ];

    let step = 0;              // manual pass step (0..5)
    let blocks = initial();

    function renderBlock(b){
      const block = el('block '+b.cls, '<span class="btag">'+b.tag+'</span>');
      block.insertAdjacentHTML('beforeend', b.lines.join('<br>'));
      return block;
    }

    // .ctx-list has no overflow; the scrolling container is its parent .ctx.
    const scroller = list.closest('.ctx') || list;
    function render(scrollBottom){
      list.innerHTML = '';
      blocks.forEach(b => list.appendChild(renderBlock(b)));
      if(scrollBottom) requestAnimationFrame(() => { scroller.scrollTop = scroller.scrollHeight; });
    }

    function setUsed(used){
      usedFill.style.width = used+'%';
      usedLabel.textContent = '已用 '+used+'%';
      freeLabel.textContent = '空余 '+(100-used)+'%';
    }

    // light pass i as active; earlier ones done (all 5 boxes are real passes).
    function markLayers(){
      layers.forEach((l,i) => {
        l.classList.toggle('done', i < step);
        l.classList.toggle('on', i === step-1);
      });
    }

    // ---- manual pass stepping ----
    function next(){
      exitDynamic();
      if(step >= passes.length) return;
      const prev = usedByStep[step];
      blocks = passes[step](blocks);
      step++;
      render();
      setUsed(usedByStep[step]);
      markLayers();
      status.textContent = '第 '+step+' 道「'+stratNames[step-1]+'」：'+stratCaps[step-1]
        + ' · 占用 '+prev+'%→'+usedByStep[step]+'%';
      if(step >= passes.length){
        nextBtn.disabled = true;
        nextBtn.textContent = '五道走完 ✓';
        status.textContent = '五道按序过完：前四道都在本地(92→50%)、能省的先省，实在不够才动第 5 道那次模型调用(50→30%)。多数时候前几道就够了';
      }
    }

    // ---- dynamic mode: transcript grows; the runtime escalates through the
    //      SAME five passes, cheap first, stopping as soon as it's under line.
    //      First trigger: cheap passes 1–3 already bring it down. Later, after
    //      more growth and the cheap targets are gone, it must escalate to
    //      collapse (4) and finally the model call (5).
    let inDyn = false, dynIdx = 0, dynBlocks = [];
    const dynSteps = [
      {kind:'add', block:{cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']}, used:30, over:false, lit:[], cap:'起点：只有用户目标，占用 30%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['先看看这个函数 → 调 Read']}, used:36, over:false, lit:[], cap:'① 模型发起：要调 Read'},
      {kind:'add', block:{cls:'stale bulky', tag:'工具结果 · Read', lines:['parsePath(): 42 行源码','3 处正则拼接']}, used:52, over:false, lit:[], cap:'② Read 结果回填 → 36%→52%'},
      {kind:'add', block:{cls:'long bulky', tag:'工具结果 · 构建日志', lines:['webpack 900 行输出','vendor 3.2 MiB … 大量 chunk 哈希']}, used:78, over:false, lit:[], cap:'③ 构建日志回填 → 52%→78%'},
      {kind:'add', block:{cls:'dup bulky', tag:'工具结果 · 测试 stdout', lines:['96 行 stdout','1 项失败：空 query 返回 null']}, used:93, over:true, lit:[], cap:'④ 测试结果又回填 → 涨到 93%，越过阈值线，开始压'},
      // first trigger: cheap passes 1→2→3 handle it; stop once under line.
      {kind:'compact', passes:[0,1,2], used:54, over:false, lit:[0,1,2], cap:'⑤ 触发：先上最便宜的前三道——budget 丢旧输出、snip 裁超长、microcompact 去重换引用（都不调模型）→ 93%→54%，够了就停'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['补空值分支 → 再跑测试']}, used:60, over:false, lit:[], cap:'⑥ 接着往下跑，占用又开始涨'},
      {kind:'add', block:{cls:'arc', tag:'又一批探索来回', lines:['再试两个边界 case','逐步逼近最终写法']}, used:78, over:false, lit:[], cap:'⑦ 又积累一段探索历史 → 60%→78%'},
      {kind:'add', block:{cls:'long bulky', tag:'工具结果 · 测试 stdout', lines:['又一份 900 行 stdout','12 项全过 ✓']}, used:94, over:true, lit:[], cap:'⑧ 新的大结果再回填 → 94%，再次越线'},
      // second trigger: cheap targets mostly gone; escalate to collapse (4)…
      {kind:'compact', passes:[0,1,2,3], used:72, over:true, lit:[3], cap:'⑨ 这次前三道能压的已不多，升级到第 4 道 context collapse：把大段探索历史折叠成结论 → 只降到 72%，仍超线'},
      // …still over → finally the model call (5).
      {kind:'compact', passes:[4], used:34, over:false, lit:[4], cap:'⑩ 本地五道里前四道都压无可压却仍超限 → 才升级到第 5 道全量压缩：调一次模型做摘要 + 边界 → 94→34%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['12 项全过，准备交付']}, used:40, over:false, lit:[], cap:'⑪ 埋个坑：第 5 道那次是独立的模型请求，万一失败，会话不会瘦、反而继续涨到 Prompt too long'},
    ];

    function lightDynLayers(indices){
      layers.forEach((l,i) => {
        l.classList.toggle('on', indices.indexOf(i) >= 0);
        l.classList.remove('done');
      });
    }

    // apply a set of manual passes (by index) to the current dyn transcript.
    function applyPasses(indices){
      indices.forEach(i => { dynBlocks = passes[i](dynBlocks); });
    }

    function enterDynamic(){
      inDyn = true;
      dynIdx = 0;
      dynBlocks = [];
      step = 0;
      lightDynLayers([]);
      list.innerHTML = '';
      setUsed(30);
      meter.classList.remove('over');
      nextBtn.disabled = true;
      autoBtn.textContent = '动态 · 下一步 ▶';
      status.textContent = '点「下一步」：看上下文一轮轮长起来，越过阈值线就按五道顺序压，便宜的先上、够了就停，不够再升级';
    }

    function exitDynamic(){
      if(!inDyn) return;
      inDyn = false;
      meter.classList.remove('over');
      lightDynLayers([]);
      autoBtn.textContent = '▶ 看动态压缩';
    }

    function dynNext(){
      if(dynIdx >= dynSteps.length){   // finished → restart dynamic run
        enterDynamic();
        return;
      }
      const e = dynSteps[dynIdx++];
      if(e.kind==='add'){
        dynBlocks.push(e.block);
        // an add that crosses the line lights the passes it's about to trigger? no —
        // lighting happens on the compact step. here just show growth.
        lightDynLayers(e.lit || []);
      } else { // compact: run the named passes on the transcript, light those boxes
        applyPasses(e.passes);
        lightDynLayers(e.lit || e.passes);
      }
      blocks = dynBlocks;
      render(true);
      setUsed(e.used);
      meter.classList.toggle('over', !!e.over);
      status.textContent = e.cap;
      if(dynIdx >= dynSteps.length){
        autoBtn.textContent = '动态跑完 · 再看一次 ▶';
      }
    }

    function autoClick(){
      if(!inDyn){ enterDynamic(); dynNext(); }
      else dynNext();
    }

    function reset(){
      exitDynamic();
      step = 0;
      blocks = initial();
      render();
      setUsed(usedByStep[0]);
      markLayers();
      status.textContent = '五道按顺序过：前四道都在本地(不调模型或代价极低)，够了就停；实在腾不出空间，才升级到第 5 道那次真正的模型调用';
      nextBtn.disabled = false;
      nextBtn.textContent = '压一步 ▼';
      autoBtn.disabled = false;
      autoBtn.textContent = '▶ 看动态压缩';
    }

    nextBtn.addEventListener('click', next);
    autoBtn.addEventListener('click', autoClick);
    resetBtn.addEventListener('click', reset);
    return {reset};
  })();

  // ============================================================
  // 4) PERMISSION demo (slide 16) — a tiny REAL rule engine.
  //    Left: pick a mode + a settings.json preset. Right: 7 commands
  //    are ALL re-judged in parallel whenever you change either side.
  //    Click a command card to see which step it stopped at.
  // ============================================================
  const PermDemo = (function(){
    const modesWrap = $('#pjModes');
    if(!modesWrap) return {reset(){}};
    const modeBtns = $$('.pj-opt', modesWrap);
    const presetBtns = $$('.pj-opt', $('#pjPresets'));
    const configBox = $('#pjConfig');
    const cmdsWrap = $('#pjCmds');
    const status = $('#pjStatus');

    // ---- rule presets (what a settings.json would carry) ----
    const presets = {
      empty: { allow:[], ask:[], deny:[] },
      team: {
        allow:['Bash(npm test:*)','Bash(ls:*)','Edit(src/**)'],
        ask:['Bash(git push:*)'],
        deny:['Read(./.env)','Bash(rm:*)'],
      },
    };

    // ---- the commands judged in parallel ----
    // each: label + a describe() of what the engine sees
    const commands = [
      {id:'read',  text:'Read src/parse.ts',      kind:'read',  ro:true,  path:'src/parse.ts'},
      {id:'ls',    text:'ls -la',                  kind:'bash',  base:'ls', ro:true},
      {id:'test',  text:'npm test',                kind:'bash',  base:'npm test'},
      {id:'push',  text:'git push origin main',    kind:'bash',  base:'git push'},
      {id:'rmfile',text:'rm build/output.js',      kind:'bash',  base:'rm', del:true, path:'build/output.js', inScope:true},
      {id:'rmroot',text:'rm -rf /',                kind:'bash',  base:'rm', fuse:true},
      {id:'envcat',text:'echo "$(cat .env)"',      kind:'bash',  base:'echo', reads:'.env', compound:true},
    ];

    // read-only builtins that never need a prompt (unless compounded w/ danger)
    const READONLY = ['ls','cat','echo','pwd','head','tail','grep','find','wc','which','diff','stat','du'];
    // fs commands acceptEdits auto-approves inside the working dir
    const FS_CMDS = ['mkdir','touch','rm','rmdir','mv','cp','sed'];

    let mode = 'default';
    let preset = 'empty';

    // glob-ish match: rule "Bash(npm test:*)" vs a base string
    function ruleMatchesBash(rule, base){
      const m = rule.match(/^Bash\((.+)\)$/); if(!m) return false;
      let body = m[1];
      if(body.endsWith(':*')){ const pfx = body.slice(0,-2); return base===pfx || base.startsWith(pfx+' ') || base.startsWith(pfx); }
      return base===body;
    }
    function ruleMatchesRead(rule, path){
      const m = rule.match(/^Read\((.+)\)$/); if(!m || !path) return false;
      let body = m[1].replace(/^\.\//,'');
      return path===body || path.endsWith('/'+body) || path===('./'+body).replace(/^\.\//,'');
    }

    // returns {cls, verdict, step, why}
    function judge(cmd){
      const rules = presets[preset];
      const bypass = mode==='bypassPermissions';

      // step 1: hard fuse — rm -rf / ~ , even under bypass
      if(cmd.fuse) return {cls:'deny', verdict:'拦', step:'熔断', why:'撞死 rm -rf / 熔断 —— 任何模式都拦，bypass 也拦', locked:true};

      // gather the "effective" match targets (compound → each segment)
      // deny check (any source, any segment) — highest precedence
      // .env read via cat inside $() counts as a Read(.env)
      const denyHit = rules.deny.find(r => {
        if(cmd.kind==='bash' && ruleMatchesBash(r, cmd.base)) return true;
        if(cmd.reads && ruleMatchesRead(r, cmd.reads)) return true; // echo "$(cat .env)"
        if(cmd.kind==='read' && ruleMatchesRead(r, cmd.path)) return true;
        return false;
      });
      if(denyHit) return {cls:'deny', verdict:'拦', step:'deny 规则', why:'命中 deny '+denyHit+(cmd.reads?'（内联 $(cat .env) 被拆出来单独判）':'')};

      // step 2: explicit ask rule — locked, even bypass must prompt
      const askHit = rules.ask.find(r => cmd.kind==='bash' && ruleMatchesBash(r, cmd.base));
      if(askHit) return {cls:'ask', verdict:'问', step:'ask 规则', why:'命中 ask '+askHit+' —— 带锁，bypass 也照样问你', locked:true};

      // step 3: allow rule
      const allowHit = rules.allow.find(r => {
        if(cmd.kind==='bash' && ruleMatchesBash(r, cmd.base)) return true;
        if(cmd.kind==='read') return true; // reads are trivially allowed
        return false;
      });
      if(allowHit && cmd.kind==='bash') return {cls:'allow', verdict:'放', step:'allow 规则', why:'命中 allow '+allowHit};

      // read-only file read: always fine
      if(cmd.kind==='read') return {cls:'allow', verdict:'放', step:'只读', why:'只读文件、范围内，直接放'};

      // read-only builtin bash (not compounded with danger)
      if(cmd.kind==='bash' && READONLY.indexOf(cmd.base)>=0 && !cmd.compound && !cmd.del)
        return {cls:'allow', verdict:'放', step:'只读内建', why:cmd.base+' 是只读内建命令，直接放'};

      // bypass mode放行 (after the two locked gates above)
      if(bypass) return {cls:'allow', verdict:'放', step:'bypass', why:'bypass 模式在模式放行这步直接放'};

      // acceptEdits: fs commands inside working dir
      if(mode==='acceptEdits' && cmd.del && cmd.inScope)
        return {cls:'allow', verdict:'放', step:'acceptEdits', why:'工作目录内的 fs 命令（'+cmd.base+'），acceptEdits 自动放'};

      // compound with a would-be-read that isn't denied → still just runs echo,
      // but the inner read is unknown-scope → ask
      if(cmd.compound) return {cls:'ask', verdict:'问', step:'灰区', why:'含命令替换，拆出的子命令没有明确规则 → 问你'};

      // everything else: gray zone → ask (Manual/acceptEdits non-fs/plan)
      return {cls:'ask', verdict:'问', step:'灰区', why:'没命中任何规则、非只读 → 普通模式问你一句'};
    }

    function renderConfig(){
      const r = presets[preset];
      const line = (k,arr,cls) => arr.length
        ? '<span class="k">"'+k+'"</span>: ['+arr.map(x=>'<span class="'+cls+'">"'+x+'"</span>').join(', ')+']'
        : '<span class="k">"'+k+'"</span>: []';
      if(preset==='empty'){
        configBox.innerHTML = '<span class="c">// 没配任何规则，全看模式</span>\n<span class="k">"permissions"</span>: { <span class="k">"allow"</span>:[], <span class="k">"ask"</span>:[], <span class="k">"deny"</span>:[] }';
      } else {
        configBox.innerHTML = '<span class="k">"permissions"</span>: {\n  '+line('allow',r.allow,'s')+',\n  '+line('ask',r.ask,'s')+',\n  '+line('deny',r.deny,'cmd')+'\n}';
      }
    }

    function renderCmds(){
      cmdsWrap.innerHTML = '';
      commands.forEach(cmd => {
        const v = judge(cmd);
        const card = el('pj-card '+v.cls, '');
        card.innerHTML = '<code>'+cmd.text+'</code>'
          + '<span class="pj-verdict">'+v.verdict+'</span>'
          + '<span class="pj-why">'+v.step+(v.locked?' 🔒':'')+'</span>';
        card.addEventListener('click', () => {
          $$('.pj-card', cmdsWrap).forEach(c => c.classList.remove('open'));
          card.classList.add('open');
          status.innerHTML = '<code>'+cmd.text+'</code> → <b>'+v.verdict+'</b>：'+v.why;
        });
        cmdsWrap.appendChild(card);
      });
    }

    function recompute(){ renderConfig(); renderCmds(); }

    modeBtns.forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode;
      modeBtns.forEach(x => x.classList.toggle('sel', x===b));
      recompute();
      status.innerHTML = '切到 <b>'+b.textContent+'</b> 模式，右边整列一起重算 —— 看哪几条变了、哪几条<b>仍然拦着</b>';
    }));
    presetBtns.forEach(b => b.addEventListener('click', () => {
      preset = b.dataset.preset;
      presetBtns.forEach(x => x.classList.toggle('sel', x===b));
      recompute();
      status.innerHTML = '换成 <b>'+b.textContent+'</b> 规则集，七条命令的结局一起变';
    }));

    function reset(){
      mode = 'default'; preset = 'empty';
      modeBtns.forEach(x => x.classList.toggle('sel', x.dataset.mode==='default'));
      presetBtns.forEach(x => x.classList.toggle('sel', x.dataset.preset==='empty'));
      recompute();
      status.innerHTML = '先切到"团队常用 + Manual"看一遍，再切 bypass 看哪几条<b>仍然拦着</b>；点命令牌看理由';
    }

    return {reset};
  })();

  // ============================================================
  // wire up onShow -> reset the demo for the slide being shown
  // slide indices: 5=loop, 10=budget, 13=compress, 24=permission
  // ============================================================
  function onShow(index){
    if(index===5) LoopDemo.reset();
    if(index===10) BudgetDemo.reset();
    if(index===13) CompDemo.reset();
    if(index===27) PermDemo.reset();
  }

  window.SlideAnim = {
    init(){ /* nothing global yet */ },
    onShow,
  };
})();
