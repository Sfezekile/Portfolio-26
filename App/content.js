/**
 * content.js — text and data for the MyOS terminal.
 * Edit this file to change what `about`, `projects` and `man` print.
 * Plain text only: it is printed with textContent, so no HTML or markdown.
 */
const row = (a, b) => a.padEnd(14) + b;

const MYOS_CONTENT = {
  about: [
    'MyOS is a browser-based portfolio that simulates a desktop operating system.',
    'Windows, a taskbar and file navigation replace the standard portfolio template.',
    'Try: projects, man myos, open file-finder',
  ],

  projects: {
    'mini-projects': ['Calendar-UI', 'MiniPocket-Player'],
    'case-studies': [
      'Product Card - UI/UX case study',
      'Profile Card - design analysis',
      'Animation in CSS - animation techniques',
      'Coffee Customization Card - interactive design',
      'Status Indicator Component - UI/UX study',
      'Button Design - component analysis',
    ],
    research: ['Plants in Space', 'e-com UI', 'React Apps', 'Landing Page Designs'],
  },

  // man <name> prints these. Each section is { title, body: [lines] }.
  pages: {
    myos: [
      { title: 'NAME', body: ['myos - an operating-system-inspired portfolio environment'] },
      {
        title: 'DESCRIPTION',
        body: [
          'A browser-based portfolio that simulates a desktop OS. Work, case studies',
          'and research live inside a windowed desktop instead of a standard template.',
        ],
      },
      {
        title: 'SUBSYSTEMS',
        body: [
          row('desktop', 'background layer and interactive surface'),
          row('menubar', 'user label, clock, system indicators'),
          row('taskbar', 'application launcher'),
          row('windows', 'draggable, resizable, stackable frames'),
          row('applications', 'file-finder, browser, terminal'),
        ],
      },
      {
        title: 'PHILOSOPHY',
        body: [
          row('Creativity', 'an OS metaphor instead of the usual template'),
          row('Learning', 'window management, tabs and navigation built from scratch'),
          row('Progress', 'projects and research organised so growth is visible'),
        ],
      },
      {
        title: 'STATUS',
        body: [
          row('working', 'window management, file finder, browser tabs,'),
          row('', 'taskbar launcher, menubar clock'),
          row('planned', 'desktop icons, search bar, browser history,'),
          row('', 'start menu, external app links'),
          row('future', 'persistent session, themes, interactive demos'),
        ],
      },
      { title: 'SEE ALSO', body: ['terminal, file-finder, browser'] },
    ],

    'file-finder': [
      { title: 'NAME', body: ['file-finder - file explorer simulation'] },
      {
        title: 'DESCRIPTION',
        body: [
          'Sorts projects into Mini Projects, Case Studies and Research.',
          'Sidebar: Home, Mini Projects, Case Studies, Research.',
          'Breadcrumb shows the current path. Back, Forward and Refresh are available.',
        ],
      },
      { title: 'NOTES', body: ['Selecting a file opens its repository in a new tab.', 'Run "projects" to list everything from here.'] },
    ],

    browser: [
      { title: 'NAME', body: ['browser - tabbed browser simulation'] },
      {
        title: 'TABS',
        body: [row('Tab 1', 'Manual, with the Project Repos action'), row('Tab 2', 'Projects List, a grid of project previews')],
      },
      {
        title: 'RULES',
        body: [
          'The last remaining tab cannot be closed.',
          'Closing the active tab focuses the first remaining tab.',
          'goHome() restores Tab 1 if it was closed.',
        ],
      },
      { title: 'STATUS', body: ['Back and Forward are declared but not yet wired to history.'] },
    ],

    terminal: [
      { title: 'NAME', body: ['terminal - command line for MyOS'] },
      {
        title: 'COMMANDS',
        body: [
          row('help', 'list commands'),
          row('man <page>', 'read a manual page (myos, file-finder, browser, terminal)'),
          row('about', 'what MyOS is'),
          row('projects', 'list categories; "projects <category>" lists one'),
          row('open <app>', 'open a window: file-finder, browser, terminal'),
          row('echo, history, clear', ''),
        ],
      },
      {
        title: 'KEYS',
        body: [row('Up / Down', 'walk command history'), row('Tab', 'complete a command name'), row('Ctrl+L', 'clear the screen')],
      },
      { title: 'NOTES', body: ['Typed text is printed with textContent, so it can never run as HTML.'] },
    ],
  },
};
