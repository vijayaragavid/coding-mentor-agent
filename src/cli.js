#!/usr/bin/env node
/**
 * Coding Mentor Agent — Interactive CLI
 * Usage:
 *   node src/cli.js                      # interactive mode
 *   node src/cli.js review --file foo.js  # review a file
 *   node src/cli.js explain "closures"    # explain a concept
 *   node src/cli.js path "become a fullstack dev"
 *   node src/cli.js quiz "async/await"
 *   node src/cli.js challenge "recursion"
 */
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { validateConfig } from './config.js';
import { reviewCode } from './tools/codeReview.js';
import { explainConcept } from './tools/conceptExplainer.js';
import { suggestLearningPath } from './tools/learningPath.js';
import { generateQuiz } from './tools/quizGenerator.js';
import { generateChallenge } from './tools/challengeGenerator.js';
import { MentorSession } from './agent/index.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function printBanner() {
  console.log(
    chalk.cyan.bold(`
╔══════════════════════════════════════════╗
║        🎓 Coding Mentor Agent            ║
║   Your AI-powered programming tutor      ║
╚══════════════════════════════════════════╝
`)
  );
}

function printMarkdown(md) {
  // Simple terminal markdown: bold headers, coloured code fences
  const lines = md.split('\n');
  for (const line of lines) {
    if (line.startsWith('## ')) {
      console.log(chalk.yellow.bold('\n' + line.replace(/^## /, '')));
    } else if (line.startsWith('### ')) {
      console.log(chalk.cyan.bold(line.replace(/^### /, '')));
    } else if (line.startsWith('#### ')) {
      console.log(chalk.white.bold(line.replace(/^#### /, '')));
    } else if (line.startsWith('**') && line.endsWith('**')) {
      console.log(chalk.white.bold(line.replace(/\*\*/g, '')));
    } else if (line.startsWith('```')) {
      console.log(chalk.gray(line));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      console.log(chalk.green('  •') + ' ' + line.slice(2));
    } else {
      console.log(line);
    }
  }
}

async function runWithSpinner(label, fn) {
  const spinner = ora({ text: label, color: 'cyan' }).start();
  try {
    const result = await fn();
    spinner.succeed(chalk.green('Done!'));
    return result;
  } catch (err) {
    spinner.fail(chalk.red('Failed: ' + err.message));
    throw err;
  }
}

function levelPrompt() {
  return {
    type: 'list',
    name: 'level',
    message: 'Your experience level:',
    choices: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  };
}

// ─── Commands ────────────────────────────────────────────────────────────────

const program = new Command();

program
  .name('mentor')
  .description('AI-powered coding mentor')
  .version('1.0.0');

// ── review ──
program
  .command('review')
  .description('Review a code snippet or file')
  .option('-f, --file <path>', 'path to a source file')
  .option('-l, --language <lang>', 'programming language', 'javascript')
  .option('--level <level>', 'beginner | intermediate | advanced', 'intermediate')
  .action(async (opts) => {
    validateConfig();
    let code = '';
    if (opts.file) {
      code = readFileSync(resolve(opts.file), 'utf-8');
    } else {
      const { snippet } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'snippet',
          message: 'Paste your code (opens editor):',
        },
      ]);
      code = snippet;
    }

    const result = await runWithSpinner(
      `Reviewing ${opts.language} code...`,
      () => reviewCode({ code, language: opts.language, level: opts.level })
    );
    console.log('\n');
    printMarkdown(result);
  });

// ── explain ──
program
  .command('explain [concept]')
  .description('Explain a programming concept')
  .option('-l, --language <lang>', 'language for examples', 'javascript')
  .option('--level <level>', 'beginner | intermediate | advanced', 'intermediate')
  .action(async (concept, opts) => {
    validateConfig();
    if (!concept) {
      const ans = await inquirer.prompt([
        { type: 'input', name: 'concept', message: 'What concept should I explain?' },
        levelPrompt(),
        { type: 'input', name: 'language', message: 'Code example language:', default: 'javascript' },
      ]);
      concept = ans.concept;
      opts.level = ans.level;
      opts.language = ans.language;
    }

    const result = await runWithSpinner(
      `Explaining "${concept}"...`,
      () => explainConcept({ concept, level: opts.level, language: opts.language })
    );
    console.log('\n');
    printMarkdown(result);
  });

// ── path ──
program
  .command('path [goal]')
  .description('Get a personalised learning path')
  .option('--skills <skills>', 'your current skills', 'basic programming')
  .option('--time <timeframe>', 'available time (e.g. "3 months")', '3 months')
  .action(async (goal, opts) => {
    validateConfig();
    if (!goal) {
      const ans = await inquirer.prompt([
        { type: 'input', name: 'goal', message: 'What is your learning goal?' },
        { type: 'input', name: 'skills', message: 'Current skills:', default: 'basic programming' },
        { type: 'input', name: 'time', message: 'Available timeframe:', default: '3 months' },
      ]);
      goal = ans.goal;
      opts.skills = ans.skills;
      opts.time = ans.time;
    }

    const result = await runWithSpinner(
      'Generating your learning path...',
      () => suggestLearningPath({ goal, currentSkills: opts.skills, timeframe: opts.time })
    );
    console.log('\n');
    printMarkdown(result);
  });

// ── quiz ──
program
  .command('quiz [topic]')
  .description('Take a quiz on any programming topic')
  .option('-n, --count <n>', 'number of questions', '5')
  .option('--level <level>', 'beginner | intermediate | advanced', 'intermediate')
  .action(async (topic, opts) => {
    validateConfig();
    if (!topic) {
      const ans = await inquirer.prompt([
        { type: 'input', name: 'topic', message: 'Quiz topic:' },
        levelPrompt(),
        { type: 'number', name: 'count', message: 'How many questions?', default: 5 },
      ]);
      topic = ans.topic;
      opts.level = ans.level;
      opts.count = ans.count;
    }

    const result = await runWithSpinner(
      `Generating ${opts.count}-question quiz on "${topic}"...`,
      () => generateQuiz({ topic, level: opts.level, count: parseInt(opts.count) })
    );
    console.log('\n');
    printMarkdown(result);
  });

// ── challenge ──
program
  .command('challenge [topic]')
  .description('Get a coding challenge to practice')
  .option('-l, --language <lang>', 'programming language', 'javascript')
  .option('--level <level>', 'beginner | intermediate | advanced', 'intermediate')
  .action(async (topic, opts) => {
    validateConfig();
    if (!topic) {
      const ans = await inquirer.prompt([
        { type: 'input', name: 'topic', message: 'Challenge topic (e.g. "recursion", "sorting"):' },
        levelPrompt(),
        { type: 'input', name: 'language', message: 'Language:', default: 'javascript' },
      ]);
      topic = ans.topic;
      opts.level = ans.level;
      opts.language = ans.language;
    }

    const result = await runWithSpinner(
      `Creating ${opts.level} ${opts.language} challenge on "${topic}"...`,
      () => generateChallenge({ topic, level: opts.level, language: opts.language })
    );
    console.log('\n');
    printMarkdown(result);
  });

// ── chat (default interactive mode) ──
program
  .command('chat', { isDefault: true })
  .description('Start an interactive chat with your mentor')
  .action(async () => {
    validateConfig();
    printBanner();
    console.log(chalk.gray('Type your question or command. Type "exit" to quit, "help" for tips.\n'));

    const session = new MentorSession();

    const COMMANDS_HINT = chalk.gray(`
Commands: 
  /review   — review code
  /explain  — explain a concept  
  /path     — get a learning path
  /quiz     — take a quiz
  /challenge — get a challenge
  /reset    — start a new conversation
  /history  — show conversation history
  exit      — quit
`);

    while (true) {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.cyan('You:'),
          prefix: '',
        },
      ]);

      const trimmed = input.trim();
      if (!trimmed) continue;
      if (trimmed.toLowerCase() === 'exit') {
        console.log(chalk.yellow('\nGoodbye! Keep coding! 🚀\n'));
        process.exit(0);
      }
      if (trimmed === 'help') { console.log(COMMANDS_HINT); continue; }

      if (trimmed === '/reset') {
        session.reset();
        console.log(chalk.gray('Conversation reset.\n'));
        continue;
      }

      if (trimmed === '/history') {
        const history = session.getHistory();
        if (!history.length) { console.log(chalk.gray('No history yet.\n')); continue; }
        for (const msg of history) {
          const prefix = msg.role === 'user' ? chalk.cyan('You: ') : chalk.yellow('Mentor: ');
          console.log(prefix + chalk.white(msg.content.slice(0, 200)) + (msg.content.length > 200 ? '...' : ''));
        }
        console.log();
        continue;
      }

      // Slash shortcuts that collect params and call tools
      if (trimmed.startsWith('/review')) {
        const { code, language, level } = await inquirer.prompt([
          { type: 'input', name: 'code', message: 'Paste code snippet:' },
          { type: 'input', name: 'language', message: 'Language:', default: 'javascript' },
          levelPrompt(),
        ]);
        const result = await runWithSpinner('Reviewing code...', () => reviewCode({ code, language, level }));
        printMarkdown(result);
        continue;
      }

      if (trimmed.startsWith('/explain')) {
        const concept = trimmed.slice(8).trim();
        if (!concept) { console.log(chalk.red('Usage: /explain <concept>')); continue; }
        const result = await runWithSpinner(`Explaining "${concept}"...`, () => explainConcept({ concept }));
        printMarkdown(result);
        continue;
      }

      if (trimmed.startsWith('/path')) {
        const goal = trimmed.slice(5).trim();
        if (!goal) { console.log(chalk.red('Usage: /path <your goal>')); continue; }
        const result = await runWithSpinner('Generating path...', () => suggestLearningPath({ goal }));
        printMarkdown(result);
        continue;
      }

      if (trimmed.startsWith('/quiz')) {
        const topic = trimmed.slice(5).trim();
        if (!topic) { console.log(chalk.red('Usage: /quiz <topic>')); continue; }
        const result = await runWithSpinner(`Generating quiz on "${topic}"...`, () => generateQuiz({ topic }));
        printMarkdown(result);
        continue;
      }

      if (trimmed.startsWith('/challenge')) {
        const topic = trimmed.slice(10).trim();
        if (!topic) { console.log(chalk.red('Usage: /challenge <topic>')); continue; }
        const result = await runWithSpinner(`Creating challenge on "${topic}"...`, () => generateChallenge({ topic }));
        printMarkdown(result);
        continue;
      }

      // Default: free-form chat
      const spinner = ora({ text: 'Mentor is thinking...', color: 'yellow' }).start();
      try {
        const reply = await session.ask(trimmed);
        spinner.stop();
        console.log('\n' + chalk.yellow('Mentor: '));
        printMarkdown(reply);
        console.log();
      } catch (err) {
        spinner.fail(chalk.red(err.message));
      }
    }
  });

program.parse(process.argv);
