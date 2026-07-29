# Claude Code PPT 内容核对报告

核对对象：`index.html`（40 页网页演示稿）及 `speaker-notes.md`。

核对日期：2026-07-29。此次仅新增本报告，没有修改演示稿、讲稿或代码。

## 结论

演示稿的主线（Agent 循环、上下文管理、权限分层、扩展机制）与本地资料一致，可以继续使用。但它把一部分 **2026-03 逆向材料中针对特定构建的内部实现** 写成了跨版本产品事实；有若干处需要缩小断言范围，另有 **1 处（第 35 页）内部矛盾**需要更正。

**（本报告自查修订）** 初版曾把第 06、20、35 三页并列为 “managed 优先级错误”，实为误判：第 06、20 页已按官方把 managed 列为**最高**优先级，是正确的；只有第 35 页写成了 “managed 并非最高、靠 deny 兜底”，与官方及本稿其余两页自相矛盾，才是真正要改的地方。同理，“权限 / Hook 改完热更新” 有 `settings.md` 明文支持（属官方事实），不该被撤回，只需收窄 “恰好只有 model、outputStyle 要重启” 这句全称。

不能据现有材料声称“所有内部实现细节在所有 Claude Code 版本中都正确”。可以严谨地声称：**产品行为以本机官方文档为准；内部路径、模块名、数量、阈值、耗时和回退链仅代表逆向材料分析时的构建。**

## 证据口径

| 等级 | 含义 | 本次使用的来源 |
| --- | --- | --- |
| A | 当前产品行为，官方文档明确说明 | `资料/Claude-Code-官方文档/` |
| B | 本地逆向材料明确说明，但属于实现/版本观察 | `资料/社区仓库/claude-code-reverse-engineering/docs/` |
| C | 演示表达与官方文档冲突，不能作为正确结论 | 官方文档对应章节 |
| D | 仅为教学示意或未找到充分证据，需注明“示意”或补证 | 演示稿本身 |

本地逆向资料的 README 自述为 2026-03 从 npm 包 source map 分析而来，覆盖约 1,902 文件、512,664 LOC、19,380 行设计文档。因此它适合解释实现，但不应取代官方产品契约。

## 必须更正的事实

| 位置 | 当前表述 | 核对结论 | 正确口径与证据 |
| --- | --- | --- | --- |
| **仅第 35 页**及讲稿 | 企业 managed “并非最高（排在 CLI / 命令 / 会话之后），靠 deny 恒赢兜底” | **C：错误** | Managed 本身就是最高优先级，命令行也不能覆盖它，并非靠 deny 兜底。见 `settings.md` 的 “Settings precedence”（Managed = highest, can't be overridden by anything）与 `server-managed-settings.md`（server / endpoint-managed 同占最高层，No other settings level can override them, including command line arguments）。**更正记录本身的修正：第 06、20 页已把 managed 正确列为最高优先级，与官方一致，本条不涉及这两页——原报告把这三页并列为“错误”属误判。** |
| 第 06、08、20、30 页及讲稿 | 权限、Hook 改完“即时/实时/热重载”；只有 model、outputStyle 要重启 | **A（前半属实）/ D（后半的“仅此两项”需限定）** | `settings.md` 明确写 “Claude Code watches your settings files and reloads them… This includes `permissions`, `hooks`, and credential helpers… without a restart”，并触发 `ConfigChange` hook——所以“权限、Hook 改完即时生效”是官方事实，无需撤回。需要收窄的只是“恰好只有 model、outputStyle 两项要重启”这句全称：官方只保证 reload 覆盖 user / project / local / managed 设置，并未给出“仅此两项要重启”的完整清单，其余键应逐项按当前版本验证。 |
| 第 02、31 页及讲稿 | Hook 有“27 个生命周期事件、6 种执行器（含 callback/function）” | **C/D：用户可配置能力的表述不准确** | 官方 `hooks.md` 说明 command、HTTP、prompt 等配置方式；监控字段还列出 `command`、`prompt`、`mcp_tool`、`http`、`agent`。`callback/function` 不能直接当作用户 settings 中的 Hook 类型。事件数也会随版本变动，不宜固定为 27。 |
| 第 02 页 | “Skill 根本不执行代码，只是 System Prompt 的一段” | **D：需要限定** | `SKILL.md` 本身是 frontmatter + Markdown 指令，确实不是 Hook/MCP 那样的执行器；但 Skill 可以引导模型使用工具或项目脚本，不能让听众理解为“Skill 的使用永不产生代码执行”。见 `skills.md` 的 “Write SKILL.md”。 |
| 第 06、35 页 | `--dangerously-skip-permissions` “跳过所有确认” | **C：不完整** | bypass 仍受显式 ask、组织 connector ask、`requiresUserInteraction` MCP 工具，以及删除 `/` 或 home 的提示约束。见 `permission-modes.md`、`sandboxing.md`。 |
| 第 36 页及讲稿 | `*.local` / `CLAUDE.local.md` “天生 gitignore” | **D：需限定** | `.claude/settings.local.json` 是在 Claude Code 创建时 gitignored；手工新建、其他 `*.local` 文件或 `CLAUDE.local.md` 不应泛称为自动 gitignore。见 `settings.md` 的 scope 表。 |

## 高风险版本细节

以下内容在逆向材料中有相应章节，故可作为 **B：2026-03 逆向构建观察** 使用；不能改写成“当前 Claude Code 始终如此”。演讲时应保留页脚中的版本限定，最好在页首或讲稿开头说明一次。

| 页面 | 需要限定的细节 | 逆向材料位置 |
| --- | --- | --- |
| 01 | 五层划分、`QueryEngine`、`state.ts`、模块/工具/命令数量 | `01-architecture-overview.md`；`02-core-engine.md` |
| 02 | 入口适配器矩阵、核心/插件信任分层、`\\0` 命名空间、组件隔离模型 | `01-architecture-overview.md`；`05-extension-systems.md` |
| 03 | 启动 L0-L3、1/5/20-50/100-200ms、React/Ink 渲染管线、16ms/60fps、90% Blit | `01-architecture-overview.md`；`06-ui-layer.md` |
| 05 | 退出条件、恢复链、工具执行与结果处理的精确顺序 | `02-core-engine.md` |
| 07 | 规则的内部字段名、`@import` 限深、加载细节 | `01-architecture-overview.md` |
| 09-16 | 上下文占比（如 38%）、顺序拼接、micro/full compact、13k 阈值、记忆容量和触发 | `07-services-infrastructure.md`；`04-multi-agent-memory.md` |
| 18-24 | 权限 12 步细节、auto 分类器、3/20 熔断、Bash AST 拆解、`rm -rf` 特例、路径/软链接判定 | `03-permission-security.md` |
| 31 | Hook 的内部执行器、精确事件数、`stop_hook_blocking`、内部审计字段 | `05-extension-systems.md` |
| 33 | MCP schema 的按需载入与任何百分比占比 | `05-extension-systems.md` |
| 38-39 | `forkSubagent.ts`、Coordinator 开关、XML 回传、缓存复用 90%、嵌套限制 | `04-multi-agent-memory.md` |

特别说明：第 18、19、21、23、24 页的权限交互图若作为“教学模型”是有价值的；但它们不应被表述为官方保证的完整判定顺序。官方保证的是规则、模式、受保护路径与显式 ask/deny 的行为边界；内部短路顺序须绑定版本。

## 逐页核对清单

| 页 | 标题/主题 | 结论 | 处理建议 |
| ---: | --- | --- | --- |
| 00 | 封面 | A | 无事实断言。 |
| 01 | 五层架构 | B | 可讲；所有数量、文件名和“叶子节点”绑定逆向版本。 |
| 02 | 入口、核心与插件 | B/D | 入口矩阵可保留为逆向图；Skill/MCP 的隔离用词需收窄。 |
| 03 | 启动与渲染 | B | 机制可信，所有毫秒、fps、百分比必须是版本观察。 |
| 04 | 架构诊断应用 | D | 明确是排障框架，不是官方故障分类。 |
| 05 | Agent 循环 | A/B | 循环概念正确；各停止/恢复分支标为版本实现。 |
| 06 | 配置层级与生效 | A/D | managed 已正确列为最高优先级，**无需更正**；“权限/Hook 热更新”属官方事实可保留，仅“仅 model/outputStyle 要重启”这句全称需收窄。 |
| 07 | CLAUDE.md 与 rules | A/B | 分层和条件规则可用；内部路径、限深等标 B。 |
| 08 | 配置样例 | C/D | `dangerously-skip` 的注释不能写“所有确认”；生效时间注释需逐项验证。 |
| 09 | 上下文构成 | B | 38% 是示例观测值，不是普遍配额。 |
| 10 | 上下文装配顺序 | A/B | 文档支持逐步加载；完整精确顺序标 B。 |
| 11 | 工具输出控制 | A/B | 截断/引用/空结果的设计原则正确；具体实现标 B。 |
| 12 | 压缩机制 | B | 策略、阈值与“仅一条模型调用路径”都绑定逆向版本。 |
| 13 | 长会话实操 | A | `/context`、`/compact` 等操作以本机 CLI 帮助为最终准据。 |
| 14 | 记忆类型 | A/B | CLAUDE.md 和 memory 是官方概念；层数和容量标 B。 |
| 15 | 自动记忆 | B | 触发、写入上限、层级都不可泛化。 |
| 16 | 记忆应用 | A | 作为工作流建议可保留。 |
| 17 | 权限分档 | A | 风险分层是正确教学抽象。 |
| 18 | 权限判定管线 | A/B | deny/ask/受保护路径边界有官方证据；七格精确顺序标 B。 |
| 19 | 六种权限模式 | A/B | 六种模式、bypass 例外有官方证据；3/20 分类器阈值标 B。 |
| 20 | 权限规则来源 | A/D | managed 已正确列为最高优先级，**无需更正**；“权限/Hook 即时生效”有官方依据可保留。 |
| 21 | 七条命令互动 | D | 是教学模拟器，应标“规则示意”，不应宣称复刻真实裁决器。 |
| 22 | Bash 拆解 | B | 可用作逆向实现讲解，不可承诺覆盖全部 shell 语法。 |
| 23 | 删除与受保护路径 | A/B | bypass/受保护路径边界有官方依据；硬熔断清单和版本号标 B。 |
| 24 | 权限继承与 Hook | A/B | 子代理/Hook 边界需以当前官方 sub-agent/hook 文档复查；细节标 B。 |
| 25 | 安全与可用性 | A | 为原则性总结，无需修改。 |
| 26 | 权限应用 | D | 配置样例可用，但应在真实项目中做最小范围验证。 |
| 27 | 五类扩展 | A | 分类合理；“命令已并入 Skill”需随当前文档措辞。 |
| 28 | Hook 生命周期 | A/D | Hook 概念、事件示例正确；不要承诺“保存即热重载”。 |
| 29 | Hook 作用与边界 | A/B | Hook 可影响控制流；“完整账户权限/无沙箱”需按当前 Hook 与 sandbox 配置说明。 |
| 30 | Hook 三步配置 | A/D | 配置结构正确；exit code、重载和作用域应附当前 docs 版本。 |
| 31 | Hook 六个场景 | B/C | 场景合理；27/6 的数字与“六种执行器”必须修正。 |
| 32 | Skill 最小结构 | A | `SKILL.md`、frontmatter、description 的说明有官方依据。 |
| 33 | MCP 接入 | A/B | `http`/`stdio`/SSE 弃用、scope 和 `/mcp` 有官方依据；schema 占比标 B。 |
| 34 | 自定义决策表 | A | 是方法论，不是实现承诺。 |
| 35 | 个人/团队/公司配置 | C | **本页 managed 优先级写错了**（写成“并非最高、排在 CLI 之后、靠 deny 兜底”），须改为“managed 就是最高、命令行也盖不掉”，与第 06、20 页保持一致；`allowManagedHooksOnly` 是 managed-only 锁，可保留但须说明来源。 |
| 36 | Git 与个人配置 | A/D | 共享/本地分工正确；gitignore 只对 Claude 创建的 local settings 有官方明确保证。 |
| 37 | 团队接入流程 | A/D | 方法论可保留，需按组织安全策略落地。 |
| 38 | 多 Agent 机制 | B | 全部内部文件名、回传形态、90% 数字、嵌套限制均标逆向版本。 |
| 39 | 多 Agent 选型 | A/B | 三问框架是正确方法论；Fork/Coordinator 具体行为标 B。 |
| 40 | 收尾 | A | 为总结性表达，无需修改。 |

## 推荐的统一口径

在第 01 页或开场讲稿增加一次如下说明即可覆盖大多数版本风险：

> 本分享把“当前官方行为”和“对 2026-03 构建的逆向实现观察”分开讲。命令、配置字段与权限边界以官方文档和本机 `claude --help` 为准；模块名、数量、阈值、耗时和内部链路只用于理解该版本的工程设计。

对每个含精确数字的页面，保留或补充“逆向材料观察，随版本变化”；不要把性能数、百分比、事件数量、内部类名写成产品 SLA 或稳定 API。

## 核对资料索引

官方行为：

- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/settings.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/server-managed-settings.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/permission-modes.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/permissions.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/hooks.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/skills.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/mcp.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/memory.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/context-window.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/Claude-Code-官方文档/sub-agents.md`

逆向实现：

- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/01-architecture-overview.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/02-core-engine.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/03-permission-security.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/04-multi-agent-memory.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/05-extension-systems.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/06-ui-layer.md`
- `/Users/xiezongyu.1/Desktop/Claude Code 三天学习包/资料/社区仓库/claude-code-reverse-engineering/docs/07-services-infrastructure.md`
