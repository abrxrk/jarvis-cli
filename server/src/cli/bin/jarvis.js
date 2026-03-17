#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
const program = new Command();

// High-tech ASCII Art Banner
const banner = `
${chalk.hex('#FF0000')('         ██╗ █████╗ ██████╗ ██╗   ██╗██╗███████╗')}
${chalk.hex('#FF1A00')('         ██║██╔══██╗██╔══██╗██║   ██║██║██╔════╝')}
${chalk.hex('#FF3300')('         ██║███████║██████╔╝██║   ██║██║███████╗')}
${chalk.hex('#FF4D00')('    ██   ██║██╔══██║██╔══██╗╚██╗ ██╔╝██║╚════██║')}
${chalk.hex('#FF6600')('    ╚█████╔╝██║  ██║██║  ██║ ╚████╔╝ ██║███████║')}
${chalk.hex('#FF8000')('     ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚═╝╚══════╝')}
`;

// Welcome message
const showWelcome = () => {
  console.log();
  console.log(banner);
  console.log(chalk.gray('  ──────────────────────────────────────────────────'));
  console.log(chalk.bold.white('  ⚡ Your AI Assistant ') + chalk.gray('v1.0.0'));
  console.log(chalk.gray('  ──────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.cyan.bold('  COMMANDS:'));
  console.log();
  console.log(`  ${chalk.green('login')}    ${chalk.gray('Authenticate with the Jarvis network')}`);
  console.log(`  ${chalk.yellow('logout')}   ${chalk.gray('Securely terminate your session')}`);
  console.log(`  ${chalk.white('--help')}   ${chalk.gray('Display manual and available options')}`);
  console.log();
  console.log(chalk.gray('  Type ') + chalk.white('jarvis <command>') + chalk.gray(' to execute an action.'));
  console.log();
};

program
  .name("jarvis")
  .description("Jarvis CLI - Your AI assistant")
  .version("1.0.0")
  .action(() => {
    showWelcome();
  });

// program.addCommand(login);
// program.addCommand(logout);

program.parse(process.argv);

