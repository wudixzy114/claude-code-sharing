# Claude Code 现场演示脚本

> 用途：分享时如果被要求「现场演示怎么加工具 / 加 Skill / 加 MCP / 配上下文 / 配置文件」，照着这份脚本敲。
> 每一节的结构：**① 讲台上一句话怎么说 → ② 你敲什么 → ③ 屏幕会出现什么 → ④ 收尾/清理**。
> 所有命令都在本机（claude 2.1.220）实测过，能跑通。演示前先通读一遍「演示前检查」。

---

## 演示前检查（开场前 30 秒做完）

```bash
claude --version          # 确认 CLI 在，输出类似 2.1.220 (Claude Code)
claude mcp list           # 确认没有残留测试服务器（应显示 No MCP servers configured 或你自己的）
ls ~/.claude/skills       # 确认 skills 目录在，能看到已装的技能
```

> 讲台话术：「我先给大家看，这些都不是 PPT 截图，是我现在这台机器的真实状态。」

一个贯穿全场的心智模型，先抛出来：

- **命令有两类**：一类是终端里敲的 `claude xxx`（CLI 子命令，改的是磁盘上的配置文件）；一类是会话里敲的 `/xxx`（斜杠命令，作用于当前这轮对话）。

> ⚠️ **实测重要提醒（演示前务必知道）**：斜杠命令里，`/context` 能用 `claude -p "/context"` 在非交互模式跑出结果；但 **`/config`、`/permissions`、`/memory`、`/hooks`、`/plugin` 是交互式 UI 专用**——用 `claude -p` 会报 `isn't available in this environment`。**演示这几个命令时，一定要先 `claude` 进入交互会话，在里面敲**，别在外面用 `-p` 演示，否则当场翻车。下面每节都标注了「交互内」还是「终端」。
- **配置有三层**，从窄到宽、从个人到团队：
  1. `.claude/settings.local.json`（只你、只当前项目，**不进 git**）
  2. `.claude/settings.json`（项目级，**进 git，团队共享**）
  3. `~/.claude/settings.json`（个人级，你所有项目通用）
  - 再往上还有企业 managed 层（谁都盖不掉），演示用不到，提一句即可。

---

## 一、配置文件：先看清「现在到底哪层在生效」

这是最该先演示的，因为后面加工具/加 MCP 本质都是在改这些文件。

### 1.1 会话内看生效值（**必须在交互会话里敲**）

先 `claude` 进入交互会话，然后敲：

```
/config
```

**屏幕**：弹出当前生效的配置面板（model、theme、编辑器、自动压缩开关等），方向键选中可直接改。
（注：`claude -p "/config"` 只会打印出 `key=value` 用法帮助，不是面板——所以务必在交互会话里演示。）

```
/permissions
```

**屏幕**：列出每一条权限规则，以及**它来自哪个文件**（个人层 / 项目层 / 本地层），可增删。

> 话术：「不确定是哪层盖了哪层的时候，先看这两个——`/config` 看最终值，`/permissions` 看来源。这两个都是交互面板，得在会话里点。」

### 1.2 终端里看配置文件长什么样

```bash
# 个人层配置（你所有项目通用）
cat ~/.claude/settings.json
```

**屏幕**：一个 JSON，典型顶层字段：

```json
{
  "model": "...",
  "theme": "...",
  "permissions": {
    "allow": ["Bash(git *)", "Read", "..."],
    "deny": [],
    "defaultMode": "..."
  },
  "env": { },
  "enabledPlugins": { }
}
```

> 话术：「三层文件，字段结构完全一样，只是**覆盖优先级**不同：本地 > 项目 > 个人 > 企业默认。企业 managed 反过来，是硬底线，谁都盖不掉。」

### 1.3 演示「改一条权限」

不用手写 JSON，会话里敲：

```
/permissions
```

在面板里加一条 `allow`（比如 `Bash(npm run test *)`），保存。再 `cat` 一眼文件就能看到它被写进去了。

> 话术：「粒度可以细到命令前缀、目录、参数。比如只放行 `npm run test` 开头的，别的 npm 命令照样问我。」

---

## 二、配置上下文：满了怎么诊断、怎么手动管

### 2.1 先诊断（交互内 / 也可 `claude -p "/context"`）

会话里敲：

```
/context
```

**屏幕**：一张表——总量 200k、当前用了多少、按类别（系统提示 / 工具定义 / 对话 / 工具结果…）各占多少。
（这个命令 print 模式也能跑，实测 `claude -p "/context"` 会直接打印这张表，适合截图。）

> 话术：「凭什么能一直聊？不是窗口无限大，是把有限的 20 万 token 当资源在调度。这张表就是账本。先看账本再动手。」

### 2.2 手动压（**交互内，需要有对话历史才有意义**）

```
/compact 保留刚才关于权限配置的结论
```

**屏幕**：触发一次压缩，把历史压成摘要。`[]` 里可以指定重点保留哪块。
（注：这命令作用于当前会话历史，得在你聊了一阵的交互会话里演示才有效果；单轮 `-p` 跑没有意义。）

> 话术：「`/compact` 背后调的是『全量压缩』——会调一次模型把历史总结掉。它平时也会**自动**压，但自动的时机你控制不了；快到上限时我更倾向自己手动压、并且带上关注点，比它自动压更准。」

### 2.3 清空但保留记忆（交互内）

```
/clear
```

**屏幕**：当前对话历史清空，但 `CLAUDE.md` 里的项目记忆还在。

> 话术：「`/clear` 清的是这轮对话，不动你写在 CLAUDE.md 里的长期规矩。」

---

## 三、加记忆 / 配置文件的「记忆」这一层

### 3.1 让它记一条规矩（写进自动记忆）

会话里直接说人话：

```
这个仓库测试用 pnpm test，不是 npm，记一下
```

**屏幕**：它会把这条写进自动记忆目录（`~/.claude/projects/<项目hash>/memory/`）。

想明确进 CLAUDE.md 就直说：

```
把这条加到 CLAUDE.md
```

### 3.2 挑作用域写（**交互内**）

```
/memory
```

**屏幕**：列出各层 CLAUDE.md（项目共享的 `./CLAUDE.md`、个人全局 `~/.claude`、只你的 `.local`），你挑一个打开编辑。
（同样是交互面板，`claude -p "/memory"` 会报 not available，务必在会话里演示。）

> 话术：「长任务别指望它自动记住关键结论。重要的直接说『记进 CLAUDE.md』，或者用 `/memory` 自己挑写到哪一层。」

---

## 四、加 Skill：最快的扩展方式（热加载，不用重启）

### 4.1 看一个真实 Skill 长什么样

```bash
cat ~/.claude/skills/9n-client/SKILL.md | head -12
```

**屏幕**：一个带 frontmatter 的 Markdown：

```markdown
---
name: 9n-client
description: ...（这段决定了什么时候自动触发这个技能）
allowed-tools: Bash AskUserQuestion
---

# 正文：给模型看的操作说明
```

> 话术：「Skill 就是一个文件夹放一个 `SKILL.md`。`description` 写得好不好，直接决定它能不能在对的时机被自动唤起。」

### 4.2 现场新建一个 Skill

```bash
mkdir -p ~/.claude/skills/demo-hello
cat > ~/.claude/skills/demo-hello/SKILL.md <<'EOF'
---
name: demo-hello
description: 演示用技能。当用户说「跑一下 demo-hello」时触发，回复一句问候并说明技能已生效。
---

# Demo Hello

当被触发时，回复：「demo-hello 技能已生效，我是现场新建的。」
EOF
echo "已创建："; cat ~/.claude/skills/demo-hello/SKILL.md
```

**屏幕**：文件创建成功并回显内容。

### 4.3 验证它生效了（实测已跑通）

新开一个会话（Skill 是热加载，存盘即可用），直接进交互会话说「跑一下 demo-hello」，它会回复 SKILL.md 里定义的那句话。

也可以非交互验证（演示时交互更干净，`-p` 会带一句 stdin 提示，无害）：

```bash
claude -p "/demo-hello" < /dev/null
```

**屏幕**（实测）：`demo-hello 技能已生效，我是现场新建的。`

> 话术：「不用重启、不用注册，存盘那一刻就能用。这就是为什么说 Skill 是最快的上手方式。」

### 4.4 清理（演示完删掉）

```bash
rm -rf ~/.claude/skills/demo-hello
ls ~/.claude/skills | grep demo-hello || echo "已删除"
```

---

## 五、加 MCP：一条命令把外部系统接成工具

### 5.1 三种传输类型

```bash
# HTTP —— 远程，最推荐，支持 OAuth
claude mcp add --transport http notion https://mcp.notion.com/mcp

# stdio —— 本地进程，注意 -- 后面才是启动命令
claude mcp add --transport stdio airtable --env KEY=xxx -- npx -y airtable-mcp
```

**屏幕**：
```
Added HTTP MCP server notion with URL: https://mcp.notion.com/mcp to local config
Added stdio MCP server airtable with command: npx -y airtable-mcp to local config
```

> 话术：「传输三选一：http 远程最推荐；stdio 是本地起个进程，注意 `--` 后面才是真正的启动命令；sse 已经弃用了。」

### 5.2 看状态

```bash
claude mcp list
claude mcp get notion
```

**屏幕**：
```
notion: https://mcp.notion.com/mcp (HTTP) - ! Needs authentication
airtable: npx -y airtable-mcp - ✘ Failed to connect ...
```

> 话术：「notion 显示 `Needs authentication`——因为它走 OAuth，接完还要 `/mcp` 里登录一下。airtable 我给的是假 KEY，连不上是正常的，这里只演示注册语法。」

会话里也能看：

```
/mcp
```

### 5.3 作用域：怎么给团队共享

```bash
# 默认 local（只你、只当前项目）
# 要团队共享，用 --scope project，会写进项目根的 .mcp.json，可提交 git
claude mcp add --transport http notion https://mcp.notion.com/mcp --scope project
```

> 话术：「`--scope project` 会把配置写进项目根的 `.mcp.json`，提交进仓库，队友拉下来首次 trust 批准就能用。」

### 5.4 清理（演示完必删，别留测试服务器）

```bash
claude mcp remove notion -s local
claude mcp remove airtable -s local
claude mcp list      # 确认清干净
```

---

## 六、加工具 / 自定义子代理 & Hook（进阶，看时间讲）

### 6.1 内置工具是自带的，"加工具"通常指两种

- **接 MCP**（见第五节）——外部系统包成工具。
- **写子代理**——`.claude/agents/*.md`，一个带 frontmatter 的 Markdown 定义一个专职 agent：

```markdown
---
name: reviewer
description: 代码审查专用
tools: Read, Grep, Bash
model: sonnet
---
你是一个严格的代码审查者……
```

> 话术：「子代理会另开一个隔离的上下文窗口去干活，干完只回一段结果，不会把它的搜索过程灌进主线——这是它省 token 的关键。」

### 6.2 Hook：在生命周期节点上挂自己的命令

Hook 配在 settings.json 里。**Hook 拿数据的方式（实测核实）**：Claude Code 通过 **stdin 传一段 JSON** 给你的脚本，PreToolUse/PostToolUse 事件里有 `tool_name`、`tool_input`、`tool_result` 等字段，脚本用 `jq` 解析。另外还有环境变量 `$CLAUDE_PROJECT_DIR`（项目根目录）可用。

settings.json 里注册一个 PostToolUse 钩子（改完文件跑 prettier）：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/format.sh" }
        ]
      }
    ]
  }
}
```

对应的 `.claude/hooks/format.sh`（从 stdin 读 JSON 拿文件路径——这是官方标准写法）：

```bash
#!/bin/bash
input=$(cat)                                        # Claude Code 从 stdin 喂 JSON
file_path=$(echo "$input" | jq -r '.tool_input.file_path')
[ -n "$file_path" ] && prettier --write "$file_path"
```

会话里看已注册的 Hook（**交互内**）：

```
/hooks
```

> 话术：「Hook 是确定性的——它不是『请模型记得跑 prettier』，是**框架**在那个节点一定会执行你的命令。数据是框架通过 stdin 喂一段 JSON 进来，你用 jq 取 `tool_input.file_path` 就拿到刚改的文件。格式化、跑测试、审计日志、CI 卡口、密钥拦截都能挂。退出码决定放行还是阻断。」

---

## 七、Plugin：把上面这一整套打包分发（收尾提一句）

```
/plugin marketplace add owner/repo    # 把一个 git 仓库当市场加进来
/plugin install my-plugin@repo        # 从市场装
/plugin                                # 浏览/管理已装
```

> 话术：「一句话分层：单条规矩→CLAUDE.md；一个流程→Skill；一整套（Skill+Hook+MCP+子代理）要复用→打成 Plugin 走 marketplace。」

---

## 附：命令速查表（现场救急）

| 你想干什么 | 命令 | 类型 | 演示后要清理？ |
|---|---|---|---|
| 看当前配置生效值 | `/config` | 会话（**仅交互**） | 否 |
| 看权限规则来自哪层 | `/permissions` | 会话（**仅交互**） | 改了的话记得说明 |
| 看上下文占用 | `/context` | 会话（可 `-p`） | 否 |
| 手动压缩上下文 | `/compact [关注点]` | 会话（**需历史**） | 否 |
| 清空对话保留记忆 | `/clear` | 会话（**仅交互**） | 否 |
| 挑层写 CLAUDE.md | `/memory` | 会话（**仅交互**） | 否 |
| 新建 Skill | `mkdir -p ~/.claude/skills/xxx` + 写 SKILL.md | 终端 | **是**（`rm -rf`） |
| 加 MCP（远程） | `claude mcp add --transport http <名> <url>` | 终端 | **是**（`claude mcp remove`） |
| 加 MCP（本地） | `claude mcp add --transport stdio <名> --env K=V -- <cmd>` | 终端 | **是** |
| 看 MCP 状态 | `claude mcp list` / `/mcp` | 两者 | 否 |
| 团队共享 MCP | 加 `--scope project`（写进 `.mcp.json`） | 终端 | **是**（连空 `.mcp.json` 一起删） |
| 看已注册 Hook | `/hooks` | 会话（**仅交互**） | 否 |
| 装/管理 Plugin | `/plugin ...` | 会话（**仅交互**） | 视情况 |
| plan 模式启动 | `claude --permission-mode plan` | 终端 | 否 |

> **交互专用铁律**：`/config`、`/permissions`、`/memory`、`/hooks`、`/plugin` 用 `claude -p` 会报 `isn't available in this environment`。这几个**只在 `claude` 交互会话里演示**。
> **清理铁律**：MCP 测试服务器、临时 Skill 目录，演示完一定删；`--scope project` 还会留一个空的 `.mcp.json`（`claude mcp remove` 不会删文件），要手动 `rm`。
