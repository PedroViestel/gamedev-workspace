# Getting started

Mr. Mak is a local desktop workspace for working with several agents. Its files
are ordinary project files, and its chats are ordinary CLI sessions. You can
keep using the same agents outside the app.

**Required before setup: Codex CLI and/or Claude Code CLI, installed and signed
in with your own account.** At least one is required to install and use the
Workspace with an agent. Use either CLI to guide the setup below. The optional
voice coordinator requires Codex specifically; Kimi is an additional integration.

## Choose a folder

Create a repository from the GitHub template and clone your copy. The selected
folder must contain `workspace/workspace.json`. Keep the application source and
your project content together at first; this makes setup and agent handoffs easy.
The template has no previous owner's projects, accounts or conversation history.

## Install the desktop app

On Windows x64, use the installer in GitHub Releases. It bundles the Node
runtime and local service and installs for the current Windows user. WebView2
is installed by its bootstrapper if needed. No administrator terminal is needed
for ordinary app use.

Run **Start Mr. Mak.cmd** from the cloned folder. The app remembers the selected
repository. It opens Workspace and Chats as separate windows with separate
taskbar identities. Closing a chat saves it to History; restoring its full
conversation also relies on that CLI's native session files.

## Connect one agent

Install at least one required CLI using its current official Windows instructions:

- [Codex CLI](https://developers.openai.com/codex/cli)
- [Claude Code](https://code.claude.com/docs/en/setup)

[Kimi Code CLI](https://moonshotai.github.io/kimi-cli/en/) is available as an
additional terminal integration after the base setup.

Finish the CLI's sign-in flow with your own account. In Chats, press **+**, choose
the provider and a descriptive English title. Start with a task such as
`Dream Game Plan`. Choose the repository as the working folder. The normal CLI
permission flow is enabled by default; bypass is a deliberate per-chat choice.

New Codex and Claude chats default to `xhigh` reasoning effort. Saved effort
choices stay with existing chats. Web links in terminal output open in your
default browser with a click.

Try: “Read the My Dream Game example and turn it into a small project plan for
my game. Ask me for the missing game idea before replacing the example.”

## Explore the examples

The pinned game card is a project hub. Research is a readable report with source
links. Dev contains this guide and customization ideas. Image Gen shows the
Arachne design iterations and motion references. All are marked as samples so
they do not vanish into the time-based archive. Archive them when you no longer
need them. Archive changes metadata; it does not delete their media files.

Use Files to inspect `projects`, `inbox`, `knowledge`, `processes` and the skill
folders. A Markdown file opens in Preview; switch to Edit and Save to change it.
The Help button opens a quick guide without creating a new chat.

## Optional voice

Copy `.env.example` to `.env` and add your own `OPENAI_API_KEY` to enable the
OpenAI Live connection. Never commit that file. Sign in to Codex for the
coordinator. Its model follows your account configuration; an optional
`MRMAK_COORDINATOR_MODEL` overrides it. Model access depends on your account.

Voice requests can focus a chat, inspect a report, update a card or hand a larger
task to a worker. Direct actions stay quick; a visible worker handles deliverables.
Task-specific voice requests can use medium, high or xhigh effort. With an
optional `TYPESAFE_API_KEY`, Jev reads each request before a worker opens: an
agent or effort you name wins, otherwise the effort follows the kind of work.
Only the request text is sent to TypeSafe. Without the key, keyword rules apply. A direct
request to open a new chat uses the same `xhigh` default as the **+** button.
Max requires an explicit request. The app reports tool results before calling
an action complete.

CLI account billing and OpenAI voice API billing are separate. No API generation
is needed to browse the samples or use a signed-in CLI. Optional dictation into
terminals is described in [voice dictation](../knowledge/voice-dictation.md).

## Build from source

Install [Node.js](https://nodejs.org/en/download), Rust's MSVC toolchain and
[Tauri's Windows prerequisites](https://v2.tauri.app/start/prerequisites/#windows):
Microsoft C++ Build Tools and WebView2. Node.js 22.20+ is required by this template.

```powershell
powershell -ExecutionPolicy Bypass -File .\Setup.ps1 -Mode Check
powershell -ExecutionPolicy Bypass -File .\Setup.ps1 -Mode Desktop
```

Check only reports prerequisites. Desktop installs project dependencies and
builds an installer in `src-tauri/target/release/bundle/nsis`. It does not install
or restart the app for you. An agent should prepare updates, then ask before
interrupting active chats with an install or restart.

For a report-only browser preview:

```powershell
powershell -ExecutionPolicy Bypass -File .\Setup.ps1 -Mode Preview
```

That starts Vite and links `public/workspace` to the real Workspace folder.
It does not start managed terminals or the voice service.

## On another computer

Clone your own repository, install the app, select the folder and sign in to
your CLIs again. Recreate `.env` locally. Content travels through Git; credentials,
local app state and native CLI histories do not. A fresh clone cannot recover
conversations whose native history exists only on the previous computer.
