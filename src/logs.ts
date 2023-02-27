import ora from "ora";

export const log = console.log;

export function logTask(msg: string) {
  const spinner = ora(msg).start();
  return [
    function () {
      spinner.succeed();
    },
    function () {
      spinner.fail();
    },
  ];
}

export async function logBlock<T>(
  msg: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const [succeed, fail] = logTask(msg);
    fn()
      .then((v) => {
        succeed();
        resolve(v);
      })
      .catch(() => {
        fail();
        reject();
      });
  });
}
