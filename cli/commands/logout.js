import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

const logout = new Command("logout")
  .description("Sign out from Jarvis")
  .action(async () => {
    console.log();
    const spinner = ora({
      text: chalk.yellow("Disconnecting from Jarvis network..."),
      color: "yellow"
    }).start();

    // simulate delay
    await new Promise((res) => setTimeout(res, 1000));

    spinner.info(chalk.gray(" Session terminated."));
    console.log();
    console.log(chalk.green("  Goodbye! Stay safe out there."));
    console.log();
  });

export default logout;