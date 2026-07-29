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
  // 3) COMPRESSION demo (slide 09) — two modes:
  //    (a) manual: press "压一层" 4 times, watch blocks shrink & meter drop
  //    (b) dynamic: watch the tail auto-compress as the log keeps growing
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

    // ---- initial context blocks, with REAL length so shrink is visible ----
    // lines[] renders as multi-line; big tool results are genuinely tall.
    const initial = [
      {cls:'keep',  tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']},
      {cls:'bulky', tag:'工具结果 · grep 搜索', lines:[
        'src/router/parse.ts:12:  export function parsePath(raw){',
        'src/router/parse.ts:41:  const q = parsePath(url).query',
        'src/router/match.ts:88:  if(parsePath(p).path === base){',
        'src/legacy/url.ts:203:  // TODO 替换旧的 parsePath',
        'test/parse.spec.ts:7:  describe("parsePath", () => {',
        '… 共命中 37 处，另 32 行省略']},
      {cls:'bulky', tag:'工具结果 · 构建日志', lines:[
        '> webpack --mode production',
        'asset main.4f2a9c.js 1.8 MiB [emitted] [big]',
        'asset vendor.9b1e77.js 3.2 MiB [emitted] [big]',
        'orphan modules 412 KiB [orphan] 128 modules',
        'cacheable modules 6.1 MiB',
        '  ./src/router/parse.ts 2.4 KiB [built]',
        'webpack compiled with 2 warnings in 8421 ms',
        '… 共 218 行输出']},
      {cls:'bulky', tag:'工具结果 · 测试 stdout', lines:[
        'PASS test/router.spec.ts (12 tests)',
        'FAIL test/parse.spec.ts',
        '  ● parsePath › 空 query 应返回 {}',
        '    expected {} but received null',
        '      at Object.<anonymous> (test/parse.spec.ts:31)',
        '… 完整 stdout 共 96 行']},
      {cls:'keep',  tag:'已验证事实', lines:['新实现基于 URL 解析；空 query 已补分支']},
    ];

    // what each layer does; returns a new blocks array
    const passes = [
      // layer 1: reference replacement — big results become a one-line reference
      (blocks) => blocks.map(b => b.cls==='bulky'
        ? {cls:'shrunk', tag:b.tag, lines:[refText(b.tag)+'  <span class="cut local">换引用</span>']}
        : b),
      // layer 2: micro-compress — dedup/truncate references further
      (blocks) => blocks.map(b => b.cls==='shrunk'
        ? {cls:'shrunk', tag:b.tag, lines:[refText(b.tag)+'  <span class="cut local">去重截断</span>']}
        : b),
      // layer 3: structured session summary — fold the过程 into ONE record (LLM)
      (blocks) => {
        const keep = blocks.filter(b => b.cls==='keep');
        return [
          keep[0],
          {cls:'summary', tag:'会话摘要 · 一次模型调用', lines:['已读 parsePath → 改写为 URL 解析 → 测试 1 项失败(空 query) → 补分支 → 12 项全过。下一步：交付。']},
          keep[1] || {cls:'keep', tag:'已验证事实', lines:['空 query 已补分支']},
        ];
      },
      // layer 4: semantic fold — everything old becomes one summary + recent原文 (LLM)
      (blocks) => [
        {cls:'summary', tag:'折叠摘要 · 一次模型调用', lines:['目标 + 关键约束 + 已验证结论，压成一段；细节按引用回查']},
        {cls:'keep', tag:'最近原文', lines:['最后一轮：npm test 全过，准备交付']},
      ],
    ];

    function refText(tag){
      if(tag.indexOf('grep')>=0 || tag.indexOf('搜索')>=0) return '↳ 引用 #grep-1（37 处，路径已存，可展开）';
      if(tag.indexOf('构建')>=0) return '↳ 引用 #build-1（218 行日志，可展开）';
      if(tag.indexOf('测试')>=0) return '↳ 引用 #test-1（96 行 stdout，可展开）';
      return '↳ 引用';
    }

    const usedByStep = [88, 70, 58, 36, 22];
    const layerNames = ['换引用','清冗余截断','记结构化摘要','折叠整段历史'];

    let step = 0;
    let blocks = initial.slice();
    let autoTimer = null;

    function renderBlock(b){
      const block = el('block '+b.cls, '<span class="btag">'+b.tag+'</span>');
      const body = b.lines.join('<br>');

      // Keep the full examples in the DOM, but collapse genuinely long tool
      // results so they cannot push the slide controls or footer off-canvas.
      if(b.lines.length >= 4){
        const details = document.createElement('details');
        details.innerHTML = '<summary><span class="detail-label">展开完整内容</span><span class="line-count">'+b.lines.length+' 行</span></summary>'
          + '<div class="block-details-body">'+body+'</div>';
        block.appendChild(details);
      } else {
        block.insertAdjacentHTML('beforeend', body);
      }
      return block;
    }

    function render(){
      list.innerHTML = '';
      blocks.forEach(b => list.appendChild(renderBlock(b)));
      const used = usedByStep[step];
      setUsed(used);
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

    function stopAuto(){ if(autoTimer){ clearTimeout(autoTimer); autoTimer=null; } meter.classList.remove('over'); }

    function reset(){
      stopAuto();
      step = 0;
      blocks = initial.slice();
      render();
      markLayers();
      status.textContent = '从最便宜、最不丢信息的做起，实在不行才动整段历史';
      nextBtn.disabled = false;
      nextBtn.textContent = '压一层 ▼';
      autoBtn.disabled = false;
      autoBtn.textContent = '▶ 看动态压缩';
    }

    function next(){
      stopAuto();
      if(step >= passes.length) return;
      blocks = passes[step](blocks);
      step++;
      render();
      markLayers();
      const isLLM = step >= 3;
      status.textContent = '第 '+step+' 层「'+layerNames[step-1]+'」完成 · '
        + (isLLM ? '这层要调一次模型' : '这层本地就能做、不花钱')
        + ' · 占用降到 '+usedByStep[step]+'%';
      if(step >= passes.length){
        nextBtn.disabled = true;
        nextBtn.textContent = '压到头了 ✓';
        status.textContent = '四层压完：88% → 22%。留住了目标 / 结论 / 待办 —— 这就是能一直续航的原因';
      }
    }

    // ---- dynamic mode: log keeps growing, tail auto-compresses at threshold ----
    // Each event pushes a block and bumps used%. Crossing ~86% triggers a
    // background tail-compaction that collapses the oldest bulky blocks.
    function runAuto(){
      stopAuto();
      step = 0;
      markLayers();
      nextBtn.disabled = true;
      autoBtn.disabled = true;
      let used = 30;
      blocks = [ {cls:'keep', tag:'用户目标', lines:['重构 parsePath，保持兼容，跑测试验证']} ];
      render(); setUsed(used);

      const feed = [
        {cls:'model', tag:'模型', lines:['先看看这个函数 → 调 Read'], w:4},
        {cls:'bulky', tag:'工具结果 · Read', lines:['parsePath(): 42 行，3 处正则拼接','（完整源码 42 行）'], w:12},
        {cls:'model', tag:'模型', lines:['改写为 URL 解析 → 调 Edit'], w:4},
        {cls:'bulky', tag:'工具结果 · 构建日志', lines:['webpack 218 行输出','vendor 3.2MiB … 大量 chunk 哈希'], w:16},
        {cls:'model', tag:'模型', lines:['跑测试 → 调 Bash'], w:4},
        {cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['96 行 stdout','1 项失败：空 query 返回 null'], w:15},
        {cls:'model', tag:'模型', lines:['补空值分支 → 调 Edit，再跑'], w:5},
        {cls:'bulky', tag:'工具结果 · 测试 stdout', lines:['96 行 stdout','12 项全过 ✓'], w:15},
      ];
      let i = 0;

      const tick = () => {
        if(i >= feed.length){
          status.textContent = '看到了吗：上下文一边长，后台一边压尾端 —— 压缩是动态的，不是你按一下才发生';
          autoBtn.disabled = false;
          autoBtn.textContent = '再看一次 ▶';
          nextBtn.disabled = false;
          autoTimer = null;
          return;
        }
        const e = feed[i++];
        used += e.w;
        blocks.push({cls:e.cls, tag:e.tag, lines:e.lines});
        // keep list bounded visually
        renderDynamic();
        setUsed(Math.min(used, 97));
        status.textContent = '第 '+i+' 步：上下文涨到 '+Math.min(used,97)+'%';

        if(used >= 86){
          // background tail compaction
          meter.classList.add('over');
          status.textContent = '⚠ 逼近阈值线 —— 后台自动压缩尾端…';
          autoTimer = setTimeout(() => {
            // collapse oldest bulky blocks into references
            let freed = 0;
            blocks = blocks.map(b => {
              if(b.cls==='bulky' && freed < 3){ freed++; return {cls:'shrunk', tag:b.tag, lines:['↳ 引用（已折叠，可展开）  <span class="cut local">尾端压缩</span>']}; }
              return b;
            });
            used = Math.max(40, used - freed*13);
            renderDynamic();
            setUsed(used);
            meter.classList.remove('over');
            status.textContent = '尾端已压：占用回落到 '+used+'%，继续往下跑';
            autoTimer = setTimeout(tick, 900);
          }, 1100);
        } else {
          autoTimer = setTimeout(tick, 900);
        }
      };

      function renderDynamic(){
        list.innerHTML = '';
        blocks.forEach(b => list.appendChild(renderBlock(b)));
        list.scrollTop = list.scrollHeight;
      }

      autoTimer = setTimeout(tick, 700);
    }

    nextBtn.addEventListener('click', next);
    autoBtn.addEventListener('click', runAuto);
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
