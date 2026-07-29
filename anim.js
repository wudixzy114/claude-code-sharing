// ===================================================================
// SlideAnim — the interactive demos.
// Demo slide indices (0-based, match onShow): 2=loop, 7=budget,
// 10=compression, 16=permission. If you reorder slides, fix onShow().
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
  // 3) COMPRESSION demo (slide 09) — two manual modes on ONE tool result:
  //    (a) 压一层: step the 4 compaction layers; each visibly transforms
  //        the SAME build-log block (换引用 ≠ 清冗余截断), meter drops.
  //    (b) 动态压缩: step through a growing transcript; near the threshold
  //        the tail auto-compacts. Both modes advance one click at a time,
  //        each with a one-line caption of what just happened.
  // ============================================================
  const CompDemo = (function(){
    const layersWrap = $('#compLayers');
    if(!layersWrap) return {reset(){}};
    const layers = $$('.comp-layer', layersWrap);
    const list = $('#ctxList');
    const usedFill = $('#compUsed');
    const usedLabel = $('#compUsedLabel');
    const freeLabel = $('#compFreeLabel');
    const nextBtn = $('#compNext');
    const autoBtn = $('#compAuto');
    const resetBtn = $('#compReset');
    const status = $('#compStatus');
    const meter = $('#compMeter');

    // ---- ONE bulky tool result so you can watch exactly what each strategy
    //      does to it. Build log carries obvious redundancy (3 identical
    //      WARNING lines) + a big tail, so microcompact's edits are visible.
    const initial = () => ([
      {cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
      {cls:'bulky', tag:'工具结果 · 构建日志', lines:[
        '&gt; webpack --mode production',
        'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
        'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
        'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
        './src/router/parse.ts 2.4 KiB [built]',
        'webpack compiled with 3 warnings in 8421 ms',
        '… 余下 210 行输出（大量 chunk 哈希）']},
      {cls:'keep',  tag:'已验证事实', lines:['新实现基于 URL 解析；空 query 已补分支']},
    ]);

    // ---- manual mode walks the TWO real strategies, in the order the runtime
    //      escalates: microcompact (local, no LLM) first; if still over-limit,
    //      full compact (one LLM call). Left panel: layer 0 = microcompact,
    //      layer 1 = full compact, layer 2 = the trigger (never "stepped").
    const passes = [
      // strategy 1 — microcompact: dedup the 3 identical WARNINGs, truncate the
      // long tail, and swap the oversized payload out for a one-line reference.
      // All local, no model call. Same block, now much shorter.
      (blocks) => blocks.map(b => b.tag==='工具结果 · 构建日志'
        ? {cls:'shrunk', tag:b.tag, lines:[
            '&gt; webpack --mode production',
            'WARNING  vendor.js 超过体积上限 (3.2 MiB) <span class="cut local">×3 已去重</span>',
            'webpack compiled with 3 warnings in 8421 ms',
            '↳ 完整 216 行已存 /tmp/cc-build.log <span class="cut local">截断·换引用</span>']}
        : b),
      // strategy 2 — full compact: one LLM call folds the old history into a
      // summary + boundary marker, KEEPS the most recent turn verbatim, and
      // would reinject key files. This is the only model-calling path.
      (blocks) => [
        {cls:'summary', tag:'全量压缩 · 一次模型调用', lines:['读 parsePath → 改写为 URL 解析 → 构建通过(3 警告) → 测试补空 query 分支 → 12 项全过。细节按引用回查。 <span class="cut llm">摘要+边界</span>']},
        {cls:'keep', tag:'最近原文（保留）', lines:['最后一轮：npm test 全过，准备交付']},
      ],
    ];

    const usedByStep = [88, 52, 30];
    const stratNames = ['微压缩 microcompact','全量压缩 compact'];
    const stratCaps = [
      '3 条重复 WARNING 去重、长尾截断、大块换成一行引用 —— 全程本地、不调模型',
      '一次模型调用把旧历史压成摘要 + 边界标记，最近一轮原文原样保留',
    ];

    let step = 0;              // manual strategy step (0..2)
    let blocks = initial();

    function renderBlock(b){
      const block = el('block '+b.cls, '<span class="btag">'+b.tag+'</span>');
      block.insertAdjacentHTML('beforeend', b.lines.join('<br>'));
      return block;
    }

    function render(scrollBottom){
      list.innerHTML = '';
      blocks.forEach(b => list.appendChild(renderBlock(b)));
      if(scrollBottom) list.scrollTop = list.scrollHeight;
    }

    function setUsed(used){
      usedFill.style.width = used+'%';
      usedLabel.textContent = '已用 '+used+'%';
      freeLabel.textContent = '空余 '+(100-used)+'%';
    }

    // light layer i as active; earlier ones done. Layer 2 (trigger) never lit here.
    function markLayers(){
      layers.forEach((l,i) => {
        l.classList.toggle('done', i < step && i < 2);
        l.classList.toggle('on', i === step-1 && i < 2);
      });
    }

    // ---- manual strategy stepping ----
    function next(){
      exitDynamic();
      if(step >= passes.length) return;
      const prev = usedByStep[step];
      blocks = passes[step](blocks);
      step++;
      render();
      setUsed(usedByStep[step]);
      markLayers();
      status.textContent = '「'+stratNames[step-1]+'」：'+stratCaps[step-1]
        + ' · 占用 '+prev+'%→'+usedByStep[step]+'%';
      if(step >= passes.length){
        nextBtn.disabled = true;
        nextBtn.textContent = '压到头了 ✓';
        status.textContent = '先做本地微压缩(88→52%)，还超才升级到全量 LLM 压缩(52→30%)。大多数时候只做前者，全量较少触发';
      }
    }

    // ---- dynamic mode: transcript grows; autoCompact watches the threshold
    //      and drives escalation, mapped to the SAME two strategies on the left:
    //        · first over-limit → microcompact (layer 0). No model call. Common.
    //        · grows again, old results already shrunk, still over → full
    //          compact (layer 1). One model call. Rarer.
    //      Each click advances one event and lights the strategy it uses.
    let inDyn = false, dynIdx = 0, dynBlocks = [];
    const dynSteps = [
      {kind:'add', block:{cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']}, used:30, over:false, cap:'起点：只有用户目标，占用 30%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['先看看这个函数 → 调 Read']}, used:34, over:false, cap:'① 模型发起：要调 Read'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · Read', lines:['parsePath(): 42 行源码','3 处正则拼接']}, used:48, over:false, cap:'② Read 结果回填 → 34%→48%'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 构建日志', lines:['webpack 218 行输出','vendor 3.2 MiB … 大量 chunk 哈希']}, used:76, over:false, cap:'③ 构建日志回填 → 48%→76%'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['96 行 stdout','1 项失败：空 query 返回 null']}, used:90, over:true, cap:'④ 测试结果又回填 → 涨到 90%，autoCompact 发现越过阈值线'},
      {kind:'compact', mode:'local', layer:0, used:56, over:false, cap:'⑤ 先做最便宜的微压缩(左边第 1 类)：旧工具结果去重、截断、换引用 —— 本地、不调模型，90%→56%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['补空值分支 → 再跑测试']}, used:60, over:false, cap:'⑥ 接着往下跑，占用又开始涨'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['又一份 96 行 stdout','12 项全过 ✓']}, used:92, over:true, cap:'⑦ 新的大结果再回填 → 涨回 92%，再次越过阈值线'},
      {kind:'compact', mode:'full', layer:1, used:34, over:false, cap:'⑧ 旧结果早已被微压过、本地压无可压却仍超限 → 升级到全量压缩(左边第 2 类)：调一次模型做摘要 + 边界，92%→34%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['12 项全过，准备交付']}, used:40, over:false, cap:'⑨ 埋个坑：全量那次是独立的模型请求，万一失败，会话不会瘦、反而继续涨到 Prompt too long'},
    ];

    function lightDynLayers(indices){
      layers.forEach((l,i) => {
        l.classList.toggle('on', indices.indexOf(i) >= 0);
        l.classList.remove('done');
      });
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
      status.textContent = '点「下一步」：看上下文一轮轮长起来，autoCompact 越过阈值线先做本地微压缩，不够再升级到全量';
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
        // any add near/over threshold is the trigger noticing → light layer 2
        lightDynLayers(e.over ? [2] : []);
      } else if(e.mode==='local'){
        // microcompact: bulky tool results → shrunk one-line references
        dynBlocks = dynBlocks.map(b => b.cls==='bulky'
          ? {cls:'shrunk', tag:b.tag, lines:['↳ 引用（已折叠，可展开） <span class="cut local">微压缩</span>']}
          : b);
        lightDynLayers([e.layer]);
      } else { // full compact: fold everything old into one model-made summary
        dynBlocks = [
          {cls:'keep', tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
          {cls:'summary', tag:'全量压缩 · 一次模型调用', lines:['读 parsePath → 改写为 URL 解析 → 构建通过 → 测试补空 query 分支 → 12 项全过；细节按引用回查 <span class="cut llm">摘要+边界</span>']},
          {cls:'keep', tag:'最近原文（保留）', lines:['最后一轮：npm test 全过，准备交付']},
        ];
        lightDynLayers([e.layer]);
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
      status.textContent = '两类做法：本地微压缩(不调模型) → 不够再升级全量压缩(调一次模型)；autoCompact 只管何时压';
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
  // slide indices: 2=loop, 7=budget, 10=compress, 16=permission
  // ============================================================
  function onShow(index){
    if(index===2) LoopDemo.reset();
    if(index===7) BudgetDemo.reset();
    if(index===10) CompDemo.reset();
    if(index===16) PermDemo.reset();
  }

  window.SlideAnim = {
    init(){ /* nothing global yet */ },
    onShow,
  };
})();
