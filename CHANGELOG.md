# Changelog

## Unreleased

- With an optional `TYPESAFE_API_KEY`, Jev chooses the agent and reasoning effort for worker chats opened by Mr. Mak. An agent or effort named in the request wins; otherwise effort follows the kind of work (routine, execution or research). Without the key, or if TypeSafe is slow or unavailable, the existing keyword rules apply.

## 0.1.2 - 2026-09-23

- Fixed mouse-wheel scrolling in fullscreen Claude Code chats after opening a tab or returning to it. Scrolling also survives reconnects.
- Terminal snapshots and saved screens now preserve the mouse protocol requested by the CLI. Codex and classic Claude keep their existing scrollback behavior.

**Update:** finish active tasks, quit Mr. Mak Workspace from its tray menu, then run the new Windows installer. Open your existing repository; project files, settings and chat history stay in place.

## 0.1.1 - 2026-09-22

- Web links in agent chats and Workspace cards now open in your default browser. Wrapped terminal links and named citations work too.
- The bottom terminal row stays visible above the connection bar, including the model and reasoning effort.
- New Codex and Claude chats default to `xhigh`. Existing saved effort choices are kept; task-specific voice requests can still select an appropriate effort.

**Update:** finish active tasks, quit Mr. Mak Workspace from its tray menu, then run the new Windows installer. Open it with your existing repository. Your project files, settings and chat history stay in place.

The installer updates the application. It does not replace the sample cards or your repository content. If you build from source, bring in this release's application changes and rebuild; keep your own Workspace files and context.

## 0.1.0

First public release with two connected desktop windows, CLI chats, four sample projects and fourteen shared skills.
