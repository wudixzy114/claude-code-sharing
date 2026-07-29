// ===================================================================
// SlideAnim — the interactive demos.
// Demo slide indices (0-based, match onShow): 3=loop, 6=budget,
// 9=compression, 14=permission. If you reorder slides, fix onShow().
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

    // ---- keep just ONE bulky tool result so you can watch exactly what
    //      happens to it at each layer. The build log carries obvious
    //      redundancy (3 identical WARNING lines) + a big tail, so 换引用
    //      and 清冗余截断 produce visibly different edits on it.
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

    // Each layer returns a NEW blocks array. The build-log block keeps the
    // same tag through L1/L2 so you track one result being progressively cut.
    const passes = [
      // L1 换引用: the oversized tail payload → a one-line path reference.
      // The block does NOT collapse; only the bulk moves out to a file.
      (blocks) => blocks.map(b => b.tag==='工具结果 · 构建日志'
        ? {cls:'bulky', tag:b.tag, lines:[
            '&gt; webpack --mode production',
            'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
            'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
            'WARNING  vendor.js 超过体积上限 (3.2 MiB)',
            './src/router/parse.ts 2.4 KiB [built]',
            'webpack compiled with 3 warnings in 8421 ms',
            '↳ 余下 210 行已存 /tmp/cc-build.log <span class="cut local">换引用</span>']}
        : b),
      // L2 清冗余截断: the 3 identical WARNING lines merge into one; the
      // reference tail gets truncated. Same block, now several lines shorter.
      (blocks) => blocks.map(b => b.tag==='工具结果 · 构建日志'
        ? {cls:'bulky', tag:b.tag, lines:[
            '&gt; webpack --mode production',
            'WARNING  vendor.js 超过体积上限 (3.2 MiB) <span class="cut local">×3 已去重</span>',
            './src/router/parse.ts 2.4 KiB [built]',
            'webpack compiled with 3 warnings in 8421 ms',
            '↳ /tmp/cc-build.log <span class="cut local">已截断</span>']}
        : b),
      // L3 记结构化摘要 (LLM): fold the whole process into ONE record.
      (blocks) => {
        const keep = blocks.filter(b => b.cls==='keep');
        return [
          keep[0],
          {cls:'summary', tag:'会话摘要 · 一次模型调用', lines:['已读 parsePath → 改写为 URL 解析 → 构建通过(3 警告) → 测试补空 query 分支 → 12 项全过。下一步：交付。']},
          keep[1] || {cls:'keep', tag:'已验证事实', lines:['空 query 已补分支']},
        ];
      },
      // L4 折叠整段历史 (LLM): everything old → one summary + recent原文.
      (blocks) => [
        {cls:'summary', tag:'折叠摘要 · 一次模型调用', lines:['目标 + 关键约束 + 已验证结论，压成一段；细节按引用回查']},
        {cls:'keep', tag:'最近原文', lines:['最后一轮：npm test 全过，准备交付']},
      ],
    ];

    const usedByStep = [88, 72, 60, 38, 22];
    const layerNames = ['换引用','清冗余截断','记结构化摘要','折叠整段历史'];
    // one-line "what just happened to the tool result" per layer
    const layerCaps = [
      '大块日志正文存盘，原处只留一行引用 + 路径',
      '3 条重复 WARNING 合并成 1 条、超长尾巴截断',
      '把「读→改→构建→测试→补分支→全过」压成一条摘要',
      '整段历史折叠成一条摘要 + 最近一轮原文',
    ];

    let step = 0;              // manual layer step (0..4)
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

    function markLayers(){
      layers.forEach((l,i) => {
        l.classList.toggle('done', i < step);
        l.classList.toggle('on', i === step-1);
      });
    }

    // ---- manual layer stepping ----
    function next(){
      exitDynamic();
      if(step >= passes.length) return;
      const prev = usedByStep[step];
      blocks = passes[step](blocks);
      step++;
      render();
      setUsed(usedByStep[step]);
      markLayers();
      const isLLM = step >= 3;
      status.textContent = '第 '+step+' 层「'+layerNames[step-1]+'」：'+layerCaps[step-1]
        + ' · ' + (isLLM ? '调一次模型' : '本地不花钱')
        + ' · 占用 '+prev+'%→'+usedByStep[step]+'%';
      if(step >= passes.length){
        nextBtn.disabled = true;
        nextBtn.textContent = '压到头了 ✓';
        status.textContent = '四层压完：88% → 22%。留住了目标 / 结论 / 待办 —— 这就是能一直续航的原因';
      }
    }

    // ---- dynamic mode: transcript grows; when it crosses the threshold the
    //      runtime compacts the tail. Two escalation tiers, mapped to the SAME
    //      four layers shown on the left:
    //        · first over-limit → cheap LOCAL tail compaction = 换引用 + 清冗余
    //          截断 (layers 1,2). No model call.
    //        · grows again, and the old results are ALREADY references so local
    //          compaction has nothing left to cut → escalate to FULL compaction
    //          = 记结构化摘要 + 折叠整段历史 (layers 3,4). One model call.
    //      Each click advances one event and lights the layer(s) it uses.
    let inDyn = false, dynIdx = 0, dynBlocks = [];
    const dynSteps = [
      {kind:'add', block:{cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']}, used:30, over:false, cap:'起点：只有用户目标，占用 30%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['先看看这个函数 → 调 Read']}, used:34, over:false, cap:'① 模型发起：要调 Read'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · Read', lines:['parsePath(): 42 行源码','3 处正则拼接']}, used:48, over:false, cap:'② Read 结果回填 → 34%→48%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['改写为 URL 解析 → 调 Edit']}, used:52, over:false, cap:'③ 模型发起：要调 Edit'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 构建日志', lines:['webpack 218 行输出','vendor 3.2 MiB … 大量 chunk 哈希']}, used:76, over:false, cap:'④ 构建日志回填 → 52%→76%'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['96 行 stdout','1 项失败：空 query 返回 null']}, used:90, over:true, cap:'⑤ 测试结果又回填 → 涨到 90%，越过阈值线'},
      {kind:'compact', mode:'local', layers:[0,1], used:56, over:false, cap:'⑥ 后台先做最便宜的：换引用 + 清冗余截断（对应左边第 1、2 层，本地、不调模型）→ 旧工具结果收成引用，90%→56%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['补空值分支 → 调 Edit，再跑测试']}, used:60, over:false, cap:'⑦ 接着往下跑，占用又开始涨'},
      {kind:'add', block:{cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['又一份 96 行 stdout','12 项全过 ✓']}, used:92, over:true, cap:'⑧ 新的大结果再回填 → 涨回 92%，再次越过阈值线'},
      {kind:'compact', mode:'full', layers:[2,3], used:38, over:false, cap:'⑨ 旧结果早已是引用、本地压无可压却仍超限 → 升级到全量：调一次模型做结构化摘要 + 折叠整段历史（对应左边第 3、4 层）→ 92%→38%'},
      {kind:'add', block:{cls:'model', tag:'模型', lines:['12 项全过，准备交付']}, used:44, over:false, cap:'⑩ 埋个坑：第 9 步那次是独立的模型压缩请求，万一失败，会话不会瘦、反而继续涨到 Prompt too long'},
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
      status.textContent = '点「下一步」：看上下文一轮轮长起来，越过阈值线时后台先做便宜的本地压缩，不够再升级到全量';
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
        lightDynLayers([]);
      } else if(e.mode==='local'){
        // cheap local tail compaction: bulky tool results → one-line references
        dynBlocks = dynBlocks.map(b => b.cls==='bulky'
          ? {cls:'shrunk', tag:b.tag, lines:['↳ 引用（已折叠，可展开） <span class="cut local">换引用·去重</span>']}
          : b);
        lightDynLayers(e.layers);
      } else { // full compaction: fold everything old into one model-made summary
        dynBlocks = [
          {cls:'keep', tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
          {cls:'summary', tag:'折叠摘要 · 一次模型调用', lines:['读 parsePath → 改写为 URL 解析 → 构建通过 → 测试补空 query 分支 → 12 项全过；细节按引用回查 <span class="cut llm">全量压缩</span>']},
          {cls:'keep', tag:'最近原文', lines:['最后一轮：npm test 全过，准备交付']},
        ];
        lightDynLayers(e.layers);
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
      status.textContent = '从最便宜、最不丢信息的做起，实在不行才动整段历史';
      nextBtn.disabled = false;
      nextBtn.textContent = '压一层 ▼';
      autoBtn.disabled = false;
      autoBtn.textContent = '▶ 看动态压缩';
    }

    nextBtn.addEventListener('click', next);
    autoBtn.addEventListener('click', autoClick);
    resetBtn.addEventListener('click', reset);
    return {reset};
  })();

  // ============================================================
  // 4) PERMISSION demo (slide 14) — route 3 commands through gates
  // ============================================================
  const PermDemo = (function(){
    const picker = $('#permPicker');
    if(!picker) return {reset(){}};
    const cmds = $$('.perm-cmd', picker);
    const gates = $$('.perm-gate');
    const arrows = $$('.perm-arrow');
    const outcome = $('#permOutcome');
    const runBtn = $('#permRun');
    const status = $('#permStatus');

    // per-command routing through the 3 gates
    const routes = {
      read: {
        gates: [
          {state:'pass', v:'只读，范围内 ✓'},
          {state:'pass', v:'命中 allow 规则'},
          {state:'', v:'（用不着灰区判断）'},
        ],
        stopAt: 1,
        outcome:{cls:'allow', icon:'✓', text:'<b>直接放行</b>：读文件是只读操作，命中 allow，无需打扰你'},
      },
      test: {
        gates: [
          {state:'pass', v:'命令合法，目录内 ✓'},
          {state:'hold', v:'命中 ask 规则'},
          {state:'', v:'（有明确规则，不进灰区）'},
        ],
        stopAt: 1,
        outcome:{cls:'ask', icon:'？', text:'<b>问你一句</b>：跑命令会改状态；若已配"允许 npm test"，则这一档也能直接放行'},
      },
      rm: {
        gates: [
          {state:'stop', v:'撞死规则：删根目录'},
          {state:'', v:'（已被拦下，不再往后）'},
          {state:'', v:'（不进灰区）'},
        ],
        stopAt: 0,
        outcome:{cls:'deny', icon:'✕', text:'<b>当场拦住</b>：静态校验就撞了红线，根本轮不到问你或让模型判断'},
      },
    };

    let cur = 'read';

    function clearGates(){
      gates.forEach(g => { g.classList.remove('on','pass','stop','hold'); $('.verdict',g).textContent=''; });
      arrows.forEach(a => a.classList.remove('on'));
      outcome.className = 'perm-outcome';
      outcome.innerHTML = '<span>点"判一下"看它怎么走</span>';
    }

    function reset(){
      cur = 'read';
      cmds.forEach(c => c.classList.toggle('sel', c.dataset.cmd==='read'));
      clearGates();
      status.textContent = '同一套关卡，三条命令结局完全不同';
      runBtn.disabled = false;
    }

    cmds.forEach(c => c.addEventListener('click', () => {
      cur = c.dataset.cmd;
      cmds.forEach(x => x.classList.toggle('sel', x===c));
      clearGates();
    }));

    function run(){
      clearGates();
      const r = routes[cur];
      let i = 0;
      runBtn.disabled = true;
      const tick = () => {
        if(i > r.stopAt){
          outcome.className = 'perm-outcome '+r.outcome.cls;
          outcome.innerHTML = '<b style="font-size:26px">'+r.outcome.icon+'</b><span>'+r.outcome.text+'</span>';
          runBtn.disabled = false;
          return;
        }
        const g = gates[i];
        const info = r.gates[i];
        g.classList.add('on');
        if(info.state) g.classList.add(info.state);
        $('.verdict',g).textContent = info.v;
        if(i>0) arrows[i-1].classList.add('on');
        i++;
        setTimeout(tick, 620);
      };
      tick();
    }

    runBtn.addEventListener('click', run);
    return {reset};
  })();

  // ============================================================
  // wire up onShow -> reset the demo for the slide being shown
  // slide indices: 3=loop, 6=budget, 9=compress, 14=permission
  // ============================================================
  function onShow(index){
    if(index===3) LoopDemo.reset();
    if(index===6) BudgetDemo.reset();
    if(index===9) CompDemo.reset();
    if(index===14) PermDemo.reset();
  }

  window.SlideAnim = {
    init(){ /* nothing global yet */ },
    onShow,
  };
})();
