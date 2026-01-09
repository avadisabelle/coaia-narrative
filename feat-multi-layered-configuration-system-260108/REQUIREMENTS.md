# Multi-Layered Configuration System Requirements
## Original User Input (Verbatim)

We started creating @cli.ts to offer to the user some capabilities similar than LLMs have using the MCP (see @index.ts ) - in this session, you will extend this CLI to offer a new sets of commands and possibilities and make sure that there is always a short command foreach of what you create (ex. 'ls' for 'list', '-M' for '--memory-path') and also that it is possible to work by default with a context that is defined in an environment variables (read the '.env' from current path or look if exist in environment otherwise flags must be used (ex. '-M <my JSONL path>' if 'COAIAN_MF=/srv/data/mychart.jsonl' is defined in '.env' first then environment, the '-M <my JSONL path>' wont be needed. As third ways to define environment, we will want 'cnarrative --env </src/.env>' in which we would expect all variables needed. We would have a variable also for the Currently being viewed/edited chart (given that you will add us various commands that update, create new action, add observations, due_date, etc).
current state: now it says: """💡 Use 'cnarrative update <chart id>""" but that seems to be just an idea and nothing really works yet.

Few other tweek to outputs :
1. 
>cnarrative --help -> """Author:        Based on Robert Fritz's Structural Tension principles""" -> "It is more credits to Robert Fritz, Author is "Guillaume D.Isabelle". Another credit goes to the fork done from repo 'shaneholloman/mcp-knowledge-graph' and MiaDisabelle's work 'miadisabelle/mcp-knowledge-graph'

2. We would not output """💡 Use 'cnarrative view <chartId>' to see detailed chart information
💡 Use 'cnarrative help' to see all available commands
""" at each outputs when running 'cnarrative list ....'

create a subfolder 'feat-multi-layered-configuration-system-260108' , save the verbatim input I gave you to file then analyze all I asked in it to decompose the input I gave you adequatly then start doing the work and when you complete a task, you look again what I gave you, what you decompose and ensure todo you job like the Queens of the Mulitverse....
