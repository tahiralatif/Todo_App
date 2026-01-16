[Skip to main content](https://code.claude.com/docs/en/skills#content-area)

[Claude Code Docs home page![light logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/light.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=536eade682636e84231afce2577f9509)![dark logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/dark.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=0766b3221061e80143e9f300733e640b)](https://code.claude.com/docs)

![US](https://d3gk2c5xim1je2.cloudfront.net/flags/US.svg)

English

Search...

Ctrl K

- [Claude Developer Platform](https://platform.claude.com/)
- [Claude Code on the Web](https://claude.ai/code)
- [Claude Code on the Web](https://claude.ai/code)

Search...

Navigation

Build with Claude Code

Agent Skills

[Getting started](https://code.claude.com/docs/en/overview) [Build with Claude Code](https://code.claude.com/docs/en/sub-agents) [Deployment](https://code.claude.com/docs/en/third-party-integrations) [Administration](https://code.claude.com/docs/en/setup) [Configuration](https://code.claude.com/docs/en/settings) [Reference](https://code.claude.com/docs/en/cli-reference) [Resources](https://code.claude.com/docs/en/legal-and-compliance)

##### Build with Claude Code

- [Subagents](https://code.claude.com/docs/en/sub-agents)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Discover and install prebuilt plugins](https://code.claude.com/docs/en/discover-plugins)
- [Agent Skills](https://code.claude.com/docs/en/skills)
- [Output styles](https://code.claude.com/docs/en/output-styles)
- [Hooks](https://code.claude.com/docs/en/hooks-guide)
- [Programmatic usage](https://code.claude.com/docs/en/headless)
- [Model Context Protocol (MCP)](https://code.claude.com/docs/en/mcp)
- [Troubleshooting](https://code.claude.com/docs/en/troubleshooting)

On this page

- [Create your first Skill](https://code.claude.com/docs/en/skills#create-your-first-skill)
- [How Skills work](https://code.claude.com/docs/en/skills#how-skills-work)
- [Where Skills live](https://code.claude.com/docs/en/skills#where-skills-live)
- [When to use Skills versus other options](https://code.claude.com/docs/en/skills#when-to-use-skills-versus-other-options)
- [Configure Skills](https://code.claude.com/docs/en/skills#configure-skills)
- [Write SKILL.md](https://code.claude.com/docs/en/skills#write-skill-md)
- [Available metadata fields](https://code.claude.com/docs/en/skills#available-metadata-fields)
- [Update or delete a Skill](https://code.claude.com/docs/en/skills#update-or-delete-a-skill)
- [Add supporting files with progressive disclosure](https://code.claude.com/docs/en/skills#add-supporting-files-with-progressive-disclosure)
- [Example: multi-file Skill structure](https://code.claude.com/docs/en/skills#example%3A-multi-file-skill-structure)
- [Restrict tool access with allowed-tools](https://code.claude.com/docs/en/skills#restrict-tool-access-with-allowed-tools)
- [Use Skills with subagents](https://code.claude.com/docs/en/skills#use-skills-with-subagents)
- [Distribute Skills](https://code.claude.com/docs/en/skills#distribute-skills)
- [Examples](https://code.claude.com/docs/en/skills#examples)
- [Simple Skill (single file)](https://code.claude.com/docs/en/skills#simple-skill-single-file)
- [Use multiple files](https://code.claude.com/docs/en/skills#use-multiple-files)
- [Troubleshooting](https://code.claude.com/docs/en/skills#troubleshooting)
- [View and test Skills](https://code.claude.com/docs/en/skills#view-and-test-skills)
- [Skill not triggering](https://code.claude.com/docs/en/skills#skill-not-triggering)
- [Skill doesn’t load](https://code.claude.com/docs/en/skills#skill-doesn%E2%80%99t-load)
- [Skill has errors](https://code.claude.com/docs/en/skills#skill-has-errors)
- [Multiple Skills conflict](https://code.claude.com/docs/en/skills#multiple-skills-conflict)
- [Plugin Skills not appearing](https://code.claude.com/docs/en/skills#plugin-skills-not-appearing)
- [Next steps](https://code.claude.com/docs/en/skills#next-steps)

Build with Claude Code

# Agent Skills

Copy page

Create, manage, and share Skills to extend Claude’s capabilities in Claude Code.

Copy page

This guide shows you how to create, use, and manage Agent Skills in Claude Code. For background on how Skills work across Claude products, see [What are Skills?](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).A Skill is a markdown file that teaches Claude how to do something specific: reviewing PRs using your team’s standards, generating commit messages in your preferred format, or querying your company’s database schema. When you ask Claude something that matches a Skill’s purpose, Claude automatically applies it.

## [​](https://code.claude.com/docs/en/skills\#create-your-first-skill)  Create your first Skill

This example creates a personal Skill that teaches Claude to explain code using visual diagrams and analogies. Unlike Claude’s default explanations, this Skill ensures every explanation includes an ASCII diagram and a real-world analogy.

1

Check available Skills

Before creating a Skill, see what Skills Claude already has access to:

Copy

Ask AI

```
What Skills are available?
```

Claude will list any Skills currently loaded. You may see none, or you may see Skills from plugins or your organization.

2

Create the Skill directory

Create a directory for the Skill in your personal Skills folder. Personal Skills are available across all your projects. (You can also create [project Skills](https://code.claude.com/docs/en/skills#where-skills-live) in `.claude/skills/` to share with your team.)

Copy

Ask AI

```
mkdir -p ~/.claude/skills/explaining-code
```

3

Write SKILL.md

Every Skill needs a `SKILL.md` file. The file starts with YAML metadata between `---` markers and must include a `name` and `description`, followed by Markdown instructions that Claude follows when the Skill is active.The `description` is especially important, because Claude uses it to decide when to apply the Skill.Create `~/.claude/skills/explaining-code/SKILL.md`:

Copy

Ask AI

```
---
name: explaining-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

4

Load and verify the Skill

Exit and restart Claude Code to load the new Skill. Then verify it appears in the list:

Copy

Ask AI

```
What Skills are available?
```

You should see `explaining-code` in the list with its description.

5

Test the Skill

Open any file in your project and ask Claude a question that matches the Skill’s description:

Copy

Ask AI

```
How does this code work?
```

Claude should ask to use the `explaining-code` Skill, then include an analogy and ASCII diagram in its explanation. If the Skill doesn’t trigger, try rephrasing to include more keywords from the description, like “explain how this works.”

The rest of this guide covers how Skills work, configuration options, and troubleshooting.

## [​](https://code.claude.com/docs/en/skills\#how-skills-work)  How Skills work

Skills are **model-invoked**: Claude decides which Skills to use based on your request. You don’t need to explicitly call a Skill. Claude automatically applies relevant Skills when your request matches their description.When you send a request, Claude follows these steps to find and use relevant Skills:

1

Discovery

At startup, Claude loads only the name and description of each available Skill. This keeps startup fast while giving Claude enough context to know when each Skill might be relevant.

2

Activation

When your request matches a Skill’s description, Claude asks to use the Skill. You’ll see a confirmation prompt before the full `SKILL.md` is loaded into context. Claude matches requests against descriptions using semantic similarity, so [write descriptions](https://code.claude.com/docs/en/skills#skill-not-triggering) that include keywords users would naturally say.

3

Execution

Claude follows the Skill’s instructions, loading referenced files or running bundled scripts as needed.

### [​](https://code.claude.com/docs/en/skills\#where-skills-live)  Where Skills live

Where you store a Skill determines who can use it:

| Location | Path | Applies to |
| --- | --- | --- |
| Enterprise | See [managed settings](https://code.claude.com/docs/en/iam#enterprise-managed-settings) | All users in your organization |
| Personal | `~/.claude/skills/` | You, across all projects |
| Project | `.claude/skills/` | Anyone working in this repository |
| Plugin | Bundled with [plugins](https://code.claude.com/docs/en/plugins) | Anyone with the plugin installed |

If two Skills have the same name, the higher row wins: enterprise overrides personal, personal overrides project, and project overrides plugin.

### [​](https://code.claude.com/docs/en/skills\#when-to-use-skills-versus-other-options)  When to use Skills versus other options

Claude Code offers several ways to customize behavior. The key difference: **Skills are triggered automatically by Claude** based on your request, while slash commands require you to type `/command` explicitly.

| Use this | When you want to… | When it runs |
| --- | --- | --- |
| **Skills** | Give Claude specialized knowledge (e.g., “review PRs using our standards”) | Claude chooses when relevant |
| **[Slash commands](https://code.claude.com/docs/en/slash-commands)** | Create reusable prompts (e.g., `/deploy staging`) | You type `/command` to run it |
| **[CLAUDE.md](https://code.claude.com/docs/en/memory)** | Set project-wide instructions (e.g., “use TypeScript strict mode”) | Loaded into every conversation |
| **[Subagents](https://code.claude.com/docs/en/sub-agents)** | Delegate tasks to a separate context with its own tools | Claude delegates, or you invoke explicitly |
| **[Hooks](https://code.claude.com/docs/en/hooks)** | Run scripts on events (e.g., lint on file save) | Fires on specific tool events |
| **[MCP servers](https://code.claude.com/docs/en/mcp)** | Connect Claude to external tools and data sources | Claude calls MCP tools as needed |

**Skills vs. subagents**: Skills add knowledge to the current conversation. Subagents run in a separate context with their own tools. Use Skills for guidance and standards; use subagents when you need isolation or different tool access.**Skills vs. MCP**: Skills tell Claude _how_ to use tools; MCP _provides_ the tools. For example, an MCP server connects Claude to your database, while a Skill teaches Claude your data model and query patterns.

For a deep dive into the architecture and real-world applications of Agent Skills, read [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills).

## [​](https://code.claude.com/docs/en/skills\#configure-skills)  Configure Skills

This section covers Skill file structure, supporting files, tool restrictions, and distribution options.

### [​](https://code.claude.com/docs/en/skills\#write-skill-md)  Write SKILL.md

The `SKILL.md` file is the only required file in a Skill. It has two parts: YAML metadata (the section between `---` markers) at the top, and Markdown instructions that tell Claude how to use the Skill:

Copy

Ask AI

```
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

#### [​](https://code.claude.com/docs/en/skills\#available-metadata-fields)  Available metadata fields

You can use the following fields in the YAML frontmatter:

| Field | Required | Description |
| --- | --- | --- |
| `name` | Yes | Skill name. Must use lowercase letters, numbers, and hyphens only (max 64 characters). Should match the directory name. |
| `description` | Yes | What the Skill does and when to use it (max 1024 characters). Claude uses this to decide when to apply the Skill. |
| `allowed-tools` | No | Tools Claude can use without asking permission when this Skill is active. See [Restrict tool access](https://code.claude.com/docs/en/skills#restrict-tool-access-with-allowed-tools). |
| `model` | No | [Model](https://docs.claude.com/en/docs/about-claude/models/overview) to use when this Skill is active (e.g., `claude-sonnet-4-20250514`). Defaults to the conversation’s model. |

See the [best practices guide](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) for complete authoring guidance including validation rules.

### [​](https://code.claude.com/docs/en/skills\#update-or-delete-a-skill)  Update or delete a Skill

To update a Skill, edit its `SKILL.md` file directly. To remove a Skill, delete its directory. Exit and restart Claude Code for changes to take effect.

### [​](https://code.claude.com/docs/en/skills\#add-supporting-files-with-progressive-disclosure)  Add supporting files with progressive disclosure

Skills share Claude’s context window with conversation history, other Skills, and your request. To keep context focused, use **progressive disclosure**: put essential information in `SKILL.md` and detailed reference material in separate files that Claude reads only when needed.This approach lets you bundle comprehensive documentation, examples, and scripts without consuming context upfront. Claude loads additional files only when the task requires them.

Keep `SKILL.md` under 500 lines for optimal performance. If your content exceeds this, split detailed reference material into separate files.

#### [​](https://code.claude.com/docs/en/skills\#example:-multi-file-skill-structure)  Example: multi-file Skill structure

Claude discovers supporting files through links in your `SKILL.md`. The following example shows a Skill with detailed documentation in separate files and utility scripts that Claude can execute without reading:

Copy

Ask AI

```
my-skill/
├── SKILL.md (required - overview and navigation)
├── reference.md (detailed API docs - loaded when needed)
├── examples.md (usage examples - loaded when needed)
└── scripts/
    └── helper.py (utility script - executed, not loaded)
```

The `SKILL.md` file references these supporting files so Claude knows they exist:

Copy

Ask AI

````
## Overview

[Essential instructions here]

## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Utility scripts

To validate input files, run the helper script. It checks for required fields and returns any validation errors:
```bash
python scripts/helper.py input.txt
```
````

Keep references one level deep. Link directly from `SKILL.md` to reference files. Deeply nested references (file A links to file B which links to file C) may result in Claude partially reading files.

**Bundle utility scripts for zero-context execution.** Scripts in your Skill directory can be executed without loading their contents into context. Claude runs the script and only the output consumes tokens. This is useful for:

- Complex validation logic that would be verbose to describe in prose
- Data processing that’s more reliable as tested code than generated code
- Operations that benefit from consistency across uses

In `SKILL.md`, tell Claude to run the script rather than read it:

Copy

Ask AI

```
Run the validation script to check the form:
python scripts/validate_form.py input.pdf
```

For complete guidance on structuring Skills, see the [best practices guide](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices#progressive-disclosure-patterns).

### [​](https://code.claude.com/docs/en/skills\#restrict-tool-access-with-allowed-tools)  Restrict tool access with allowed-tools

Use the `allowed-tools` frontmatter field to limit which tools Claude can use when a Skill is active:

Copy

Ask AI

```
---
name: reading-files-safely
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---

# Safe File Reader

This Skill provides read-only file access.

## Instructions
1. Use Read to view file contents
2. Use Grep to search within files
3. Use Glob to find files by pattern
```

When this Skill is active, Claude can only use the specified tools (Read, Grep, Glob) without needing to ask for permission. This is useful for:

- Read-only Skills that shouldn’t modify files
- Skills with limited scope: for example, only data analysis, no file writing
- Security-sensitive workflows where you want to restrict capabilities

If `allowed-tools` is omitted, the Skill doesn’t restrict tools. Claude uses its standard permission model and may ask you to approve tool usage.

`allowed-tools` is only supported for Skills in Claude Code.

### [​](https://code.claude.com/docs/en/skills\#use-skills-with-subagents)  Use Skills with subagents

[Subagents](https://code.claude.com/docs/en/sub-agents) do not automatically inherit Skills from the main conversation. To give a custom subagent access to specific Skills, list them in the subagent’s `skills` field in `.claude/agents/`:

Copy

Ask AI

```
# .claude/agents/code-reviewer/AGENT.md
---
name: code-reviewer
description: Review code for quality and best practices
skills: pr-review, security-check
---
```

The listed Skills are loaded into the subagent’s context when it starts. If the `skills` field is omitted, no Skills are preloaded for that subagent.

Built-in agents (Explore, Plan, Verify) and the Task tool do not have access to your Skills. Only custom subagents you define in `.claude/agents/` with an explicit `skills` field can use Skills.

### [​](https://code.claude.com/docs/en/skills\#distribute-skills)  Distribute Skills

You can share Skills in several ways:

- **Project Skills**: Commit `.claude/skills/` to version control. Anyone who clones the repository gets the Skills.
- **Plugins**: To share Skills across multiple repositories, create a `skills/` directory in your [plugin](https://code.claude.com/docs/en/plugins) with Skill folders containing `SKILL.md` files. Distribute through a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces).
- **Enterprise**: Administrators can deploy Skills organization-wide through [managed settings](https://code.claude.com/docs/en/iam#enterprise-managed-settings). See [Where Skills live](https://code.claude.com/docs/en/skills#where-skills-live) for enterprise Skill paths.

## [​](https://code.claude.com/docs/en/skills\#examples)  Examples

These examples show common Skill patterns, from minimal single-file Skills to multi-file Skills with supporting documentation and scripts.

### [​](https://code.claude.com/docs/en/skills\#simple-skill-single-file)  Simple Skill (single file)

A minimal Skill needs only a `SKILL.md` file with frontmatter and instructions. This example helps Claude generate commit messages by examining staged changes:

Copy

Ask AI

```
commit-helper/
└── SKILL.md
```

Copy

Ask AI

```
---
name: generating-commit-messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions

1. Run `git diff --staged` to see changes
2. I'll suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices

- Use present tense
- Explain what and why, not how
```

### [​](https://code.claude.com/docs/en/skills\#use-multiple-files)  Use multiple files

For complex Skills, use progressive disclosure to keep the main `SKILL.md` focused while providing detailed documentation in supporting files. This PDF processing Skill includes reference docs, utility scripts, and uses `allowed-tools` to restrict Claude to specific tools:

Copy

Ask AI

```
pdf-processing/
├── SKILL.md              # Overview and quick start
├── FORMS.md              # Form field mappings and filling instructions
├── REFERENCE.md          # API details for pypdf and pdfplumber
└── scripts/
    ├── fill_form.py      # Utility to populate form fields
    └── validate.py       # Checks PDFs for required fields
```

**`SKILL.md`**:

Copy

Ask AI

````
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files, forms, or document extraction. Requires pypdf and pdfplumber packages.
allowed-tools: Read, Bash(python:*)
---

# PDF Processing

## Quick start

Extract text:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md).
For detailed API reference, see [REFERENCE.md](REFERENCE.md).

## Requirements

Packages must be installed in your environment:
```bash
pip install pypdf pdfplumber
```
````

If your Skill requires external packages, list them in the description. Packages must be installed in your environment before Claude can use them.

## [​](https://code.claude.com/docs/en/skills\#troubleshooting)  Troubleshooting

### [​](https://code.claude.com/docs/en/skills\#view-and-test-skills)  View and test Skills

To see which Skills Claude has access to, ask Claude a question like “What Skills are available?” Claude loads all available Skill names and descriptions into the context window when a conversation starts, so it can list the Skills it currently has access to.To test a specific Skill, ask Claude to do a task that matches the Skill’s description. For example, if your Skill has the description “Reviews pull requests for code quality”, ask Claude to “Review the changes in my current branch.” Claude automatically uses the Skill when the request matches its description.

### [​](https://code.claude.com/docs/en/skills\#skill-not-triggering)  Skill not triggering

The description field is how Claude decides whether to use your Skill. Vague descriptions like “Helps with documents” don’t give Claude enough information to match your Skill to relevant requests.A good description answers two questions:

1. **What does this Skill do?** List the specific capabilities.
2. **When should Claude use it?** Include trigger terms users would mention.

Copy

Ask AI

```
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

This description works because it names specific actions (extract, fill, merge) and includes keywords users would say (PDF, forms, document extraction).

### [​](https://code.claude.com/docs/en/skills\#skill-doesn%E2%80%99t-load)  Skill doesn’t load

**Check the file path.** Skills must be in the correct directory with the exact filename `SKILL.md` (case-sensitive):

| Type | Path |
| --- | --- |
| Personal | `~/.claude/skills/my-skill/SKILL.md` |
| Project | `.claude/skills/my-skill/SKILL.md` |
| Enterprise | See [Where Skills live](https://code.claude.com/docs/en/skills#where-skills-live) for platform-specific paths |
| Plugin | `skills/my-skill/SKILL.md` inside the plugin directory |

**Check the YAML syntax.** Invalid YAML in the frontmatter prevents the Skill from loading. The frontmatter must start with `---` on line 1 (no blank lines before it), end with `---` before the Markdown content, and use spaces for indentation (not tabs).**Run debug mode.** Use `claude --debug` to see Skill loading errors.

### [​](https://code.claude.com/docs/en/skills\#skill-has-errors)  Skill has errors

**Check dependencies are installed.** If your Skill uses external packages, they must be installed in your environment before Claude can use them.**Check script permissions.** Scripts need execute permissions: `chmod +x scripts/*.py`**Check file paths.** Use forward slashes (Unix style) in all paths. Use `scripts/helper.py`, not `scripts\helper.py`.

### [​](https://code.claude.com/docs/en/skills\#multiple-skills-conflict)  Multiple Skills conflict

If Claude uses the wrong Skill or seems confused between similar Skills, the descriptions are probably too similar. Make each description distinct by using specific trigger terms.For example, instead of two Skills with “data analysis” in both descriptions, differentiate them: one for “sales data in Excel files and CRM exports” and another for “log files and system metrics”. The more specific your trigger terms, the easier it is for Claude to match the right Skill to your request.

### [​](https://code.claude.com/docs/en/skills\#plugin-skills-not-appearing)  Plugin Skills not appearing

**Symptom**: You installed a plugin from a marketplace, but its Skills don’t appear when you ask Claude “What Skills are available?”**Solution**: Clear the plugin cache and reinstall:

Copy

Ask AI

```
rm -rf ~/.claude/plugins/cache
```

Then restart Claude Code and reinstall the plugin:

Copy

Ask AI

```
/plugin install plugin-name@marketplace-name
```

This forces Claude Code to re-download and re-register the plugin’s Skills.**If Skills still don’t appear**, verify the plugin’s directory structure is correct. Skills must be in a `skills/` directory at the plugin root:

Copy

Ask AI

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
└── skills/
    └── my-skill/
        └── SKILL.md
```

## [​](https://code.claude.com/docs/en/skills\#next-steps)  Next steps

[**Authoring best practices** \\
\\
Write Skills that Claude can use effectively](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices) [**Agent Skills overview** \\
\\
Learn how Skills work across Claude products](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview) [**Use Skills in the Agent SDK** \\
\\
Use Skills programmatically with TypeScript and Python](https://docs.claude.com/en/docs/agent-sdk/skills) [**Get started with Agent Skills** \\
\\
Create your first Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/quickstart)

Was this page helpful?

YesNo

[Discover and install prebuilt plugins](https://code.claude.com/docs/en/discover-plugins) [Output styles](https://code.claude.com/docs/en/output-styles)

Ctrl+I

[Claude Code Docs home page![light logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/light.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=536eade682636e84231afce2577f9509)![dark logo](https://mintcdn.com/claude-code/o69F7a6qoW9vboof/logo/dark.svg?fit=max&auto=format&n=o69F7a6qoW9vboof&q=85&s=0766b3221061e80143e9f300733e640b)](https://code.claude.com/docs)

[x](https://x.com/AnthropicAI) [linkedin](https://www.linkedin.com/company/anthropicresearch)

Company

[Anthropic](https://www.anthropic.com/company) [Careers](https://www.anthropic.com/careers) [Economic Futures](https://www.anthropic.com/economic-futures) [Research](https://www.anthropic.com/research) [News](https://www.anthropic.com/news) [Trust center](https://trust.anthropic.com/) [Transparency](https://www.anthropic.com/transparency)

Help and security

[Availability](https://www.anthropic.com/supported-countries) [Status](https://status.anthropic.com/) [Support center](https://support.claude.com/)

Learn

[Courses](https://www.anthropic.com/learn) [MCP connectors](https://claude.com/partners/mcp) [Customer stories](https://www.claude.com/customers) [Engineering blog](https://www.anthropic.com/engineering) [Events](https://www.anthropic.com/events) [Powered by Claude](https://claude.com/partners/powered-by-claude) [Service partners](https://claude.com/partners/services) [Startups program](https://claude.com/programs/startups)

Terms and policies

[Privacy policy](https://www.anthropic.com/legal/privacy) [Disclosure policy](https://www.anthropic.com/responsible-disclosure-policy) [Usage policy](https://www.anthropic.com/legal/aup) [Commercial terms](https://www.anthropic.com/legal/commercial-terms) [Consumer terms](https://www.anthropic.com/legal/consumer-terms)

Assistant

Responses are generated using AI and may contain mistakes.