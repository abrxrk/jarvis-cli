import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

const login = new Command("login")
  .description("Authenticate with Jarvis")
  .action(async () => {
    console.log();
    const spinner = ora({
      text: chalk.blue("Initiating secure connection to Jarvis..."),
      color: "cyan"
    }).start();

    // simulate delay
    await new Promise((res) => setTimeout(res, 1500));

    spinner.succeed(chalk.green.bold(" Successfully authenticated!"));
    console.log();
    console.log(chalk.cyan("  Welcome back, Commander. All systems are online."));
    console.log();
  });

export default login;