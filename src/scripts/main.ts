const filename = document.getElementById("filename") as HTMLInputElement;
const ram = document.getElementById("memory") as HTMLInputElement;
const env = document.getElementById("env") as HTMLSelectElement;
const version = document.getElementById("version") as HTMLSelectElement;
const gui = document.getElementById("gui") as HTMLInputElement;
const restart = document.getElementById("restart") as HTMLInputElement;

const copy = document.getElementById("copy") as HTMLButtonElement;
const copy_text = document.getElementById("copy-text") as HTMLButtonElement;
const result = document.getElementById("result") as HTMLElement;

function update() {
  let flags = "";
  switch (version.value) {
    case "21":
      flags = "-XX:+UseZGC -XX:+ZGenerational";
      break;
    case "17":
      if (env.value == "client")
        flags = "-XX:+UseShenandoahGC";
      else
        flags = "-XX:+UseZGC";
      break;
    case "8":
      flags = "-XX:+UseG1GC";
      break;
  }
  const ram_megs = 1024 * ram.valueAsNumber;
  const ram_flag = `-Xms${ram_megs}M -Xmx${ram_megs}M`;
  let command = `java ${ram_flag} ${flags} -jar ${filename.value}`;
  if (!gui.checked) {
    command += " --nogui";
  }

  let script = command;
  switch (env.value) {
    case "linux":
      if (restart.checked) {
        script = `#!/bin/sh

while true; do
    ${command}

    echo Server restarting in 10 seconds...
    echo (Press CTRL + C to stop)
    sleep 5
    echo Server restarting in 5 seconds...
    sleep 5
    echo Server restarting now!
done`;
      } else {
        script = `#!/bin/sh

${command}`;
      }
      break;
    case "windows":
      if (restart.checked) {
        script = `:start
${command}

echo Server restarting in 10 seconds...
echo (Press CTRL + C to stop)
timeout 5
echo Server restarting in 5 seconds...
timeout 5
echo Server restarting now!
goto :start`;
      }
      break;
    case "raw":
      break;
    case "client":
      script = `${ram_flag} ${flags}`;
      break;
  }

  result.textContent = script;
}

filename.addEventListener("change", update);
ram.addEventListener("change", update);
env.addEventListener("change", update);
version.addEventListener("change", update);
gui.addEventListener("change", update);
restart.addEventListener("change", update);

copy.addEventListener("click", async () => {
  update();
  await navigator.clipboard.writeText(result.textContent!!);
  copy_text.textContent = "Copied!";
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  copy_text.textContent = "Copy!";
});

update();
