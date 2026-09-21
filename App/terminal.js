/**
 * terminal.js — self-contained terminal for a MyOS window.
 *
 * Usage:
 *   mountTerminal(document.getElementById('term'), {
 *     openApp: (name) => console.log('open', name),   // swap for your window manager
 *     content: MYOS_CONTENT,                           // from content.js
 *   });
 *
 * Expects inside the root element:
 *   #log         static output area
 *   .ps1         prompt label (cloned for each echoed command)
 *   #cmd         the single live <input>
 */
function mountTerminal(root, hooks = {}) {
  const log = root.querySelector('#log');
  const input = root.querySelector('#cmd');
  const ps1 = root.querySelector('.ps1');

  // ---------- context: the only thing command handlers touch ----------
  const ctx = {
    hooks,
    history: [],
    histIndex: 0,

    // Plain text. textContent means user-typed text can never run as HTML.
    print(text = '', className = '') {
      const p = document.createElement('p');
      p.textContent = text;
      if (className) p.className = className;
      log.appendChild(p);
    },

    // Trusted markup only (never pass raw user input here).
    printHTML(html) {
      const p = document.createElement('p');
      p.innerHTML = html;
      log.appendChild(p);
    },

    clear() {
      log.innerHTML = '';
    },
  };

  // ---------- command registry: add a command = add an entry ----------
  const commands = {
    help: {
      desc: 'list available commands',
      run(ctx) {
        for (const [name, cmd] of Object.entries(commands)) {
          ctx.printHTML(`<span class="cmd">${name}</span> ${cmd.desc}`);
        }
      },
    },
    clear: {
      desc: 'clear the screen (or press Ctrl+L)',
      run(ctx) {
        ctx.clear();
      },
    },
    echo: {
      desc: 'print text back',
      run(ctx, args) {
        ctx.print(args.join(' '));
      },
    },
    history: {
      desc: 'show commands you have run',
      run(ctx) {
        ctx.history.forEach((line, i) => ctx.print(`${i + 1}  ${line}`));
      },
    },
    about: {
      desc: 'what MyOS is',
      run(ctx) {
        const lines = ctx.hooks.content?.about ?? ['No about text hooked up yet.'];
        lines.forEach((l) => ctx.print(l));
      },
    },
    projects: {
      desc: 'list projects: projects [category]',
      run(ctx, args) {
        const all = ctx.hooks.content?.projects ?? {};
        const cat = args[0];
        if (!cat) {
          Object.entries(all).forEach(([name, items]) => ctx.print(`${name} (${items.length})`));
          ctx.print('Type "projects <category>" to list one.');
          return;
        }
        if (!all[cat]) return ctx.print(`projects: no category "${cat}". Try: ${Object.keys(all).join(', ')}`);
        all[cat].forEach((p) => ctx.print(p));
      },
    },
    man: {
      desc: 'read a manual page: man <name>',
      run(ctx, args) {
        const pages = ctx.hooks.content?.pages ?? {};
        const name = args[0];
        if (!name) return ctx.print(`Manual pages: ${Object.keys(pages).join(', ')}`);
        const page = pages[name];
        if (!page) return ctx.print(`man: no manual entry for "${name}"`);
        page.forEach(({ title, body }) => {
          ctx.print(title, 'man-h');
          body.forEach((line) => ctx.print(line, 'man-b'));
        });
      },
    },
    open: {
      desc: 'open an app window: open <name>',
      run(ctx, args) {
        if (!args[0]) return ctx.print('usage: open <name>');
        if (!ctx.hooks.openApp) return ctx.print('open: not connected to the window manager yet');
        const ok = ctx.hooks.openApp(args[0]);
        if (ok === false) ctx.print(`open: unknown app "${args[0]}"`);
      },
    },
  };

  // ---------- parser + dispatcher ----------
  function parse(line) {
    const [name, ...args] = line.trim().split(/\s+/);
    return { name, args };
  }

  // Frozen copy of the prompt + what was typed, so history reads like a real terminal.
  function echoPrompt(line) {
    const row = document.createElement('div');
    row.className = 'term-prompt';
    const typed = document.createElement('span');
    typed.textContent = line;
    typed.style.marginLeft = '8px';
    row.append(ps1.cloneNode(true), typed);
    log.appendChild(row);
  }

  async function run(line) {
    echoPrompt(line);
    const { name, args } = parse(line);
    if (!name) return;

    const cmd = commands[name];
    if (!cmd) {
      ctx.print(`${name}: command not found. Type "help" to see what's available.`);
      return;
    }
    try {
      await cmd.run(ctx, args); // works for sync and async handlers
    } catch (err) {
      ctx.print(`${name}: ${err.message}`);
    }
  }

  // ---------- input handling ----------
  function scrollToBottom() {
    root.scrollTop = root.scrollHeight;
  }

  function autocomplete() {
    const value = input.value;
    if (!value || /\s/.test(value)) return; // only complete the command name
    const matches = Object.keys(commands).filter((n) => n.startsWith(value));
    if (matches.length === 1) {
      input.value = matches[0] + ' ';
    } else if (matches.length > 1) {
      echoPrompt(value);
      ctx.print(matches.join('   '));
      scrollToBottom();
    }
  }

  input.addEventListener('keydown', async (e) => {
    e.stopPropagation(); // keep typing from triggering any global OS shortcuts

    if (e.key === 'Enter') {
      const line = input.value;
      input.value = '';
      if (line.trim()) {
        ctx.history.push(line);
      }
      ctx.histIndex = ctx.history.length;
      await run(line);
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (ctx.histIndex > 0) input.value = ctx.history[--ctx.histIndex];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (ctx.histIndex < ctx.history.length - 1) {
        input.value = ctx.history[++ctx.histIndex];
      } else {
        ctx.histIndex = ctx.history.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      autocomplete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      ctx.clear();
    }
  });

  // Click anywhere in the terminal to focus, unless the user is selecting text.
  root.addEventListener('click', () => {
    if (!window.getSelection().toString()) input.focus();
  });

  ctx.print('Type "help" to see available commands.');
  input.focus();

  return ctx;
}
window.Terminal = { mountTerminal };
// kept as globals too since the HTML uses inline onclick=""
window.mountTerminal = mountTerminal;
