// One-time setup: downloads the whisper.cpp binary + small.en model into tools/whisper/.
// Re-run any time tools/whisper is missing (it's gitignored, machine-specific).
import fs from "node:fs";
import path from "node:path";
import { installWhisperCpp, downloadWhisperModel } from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.7.6";
const WHISPER_BIN_DIR = "tools/whisper/bin";
const WHISPER_MODEL_DIR = "tools/whisper/models";

// @remotion/install-whisper-cpp's getWhisperExecutablePath() expects
// whisper-cli at <WHISPER_BIN_DIR>/build/bin/whisper-cli.exe for
// whisperCppVersion >= 1.7.4, but the actual Windows release zip for 1.7.6
// extracts flat into <WHISPER_BIN_DIR>/Release/ instead - mirror it into the
// path the library looks up so transcribe() finds it without a custom fork.
const mirrorReleaseIntoExpectedPath = () => {
  const releaseDir = path.join(WHISPER_BIN_DIR, "Release");
  const expectedDir = path.join(WHISPER_BIN_DIR, "build", "bin");
  if (!fs.existsSync(releaseDir) || fs.existsSync(expectedDir)) {
    return;
  }
  fs.mkdirSync(expectedDir, { recursive: true });
  for (const file of fs.readdirSync(releaseDir)) {
    fs.copyFileSync(path.join(releaseDir, file), path.join(expectedDir, file));
  }
  console.log(`Mirrored ${releaseDir} -> ${expectedDir} (matches getWhisperExecutablePath()'s lookup).`);
};

async function main() {
  // Mirror first: installWhisperCpp() checks getWhisperExecutablePath() up front and
  // throws if the bin dir exists without the executable at that exact path, so this
  // has to happen before we'd ever call installWhisperCpp() again on a rerun.
  mirrorReleaseIntoExpectedPath();

  console.log(`Installing whisper.cpp ${WHISPER_VERSION} into ${WHISPER_BIN_DIR}...`);
  const { alreadyExisted: binExisted } = await installWhisperCpp({
    version: WHISPER_VERSION,
    to: WHISPER_BIN_DIR,
    printOutput: true,
  });
  console.log(binExisted ? "whisper.cpp already existed." : "whisper.cpp installed.");
  mirrorReleaseIntoExpectedPath();

  fs.mkdirSync(WHISPER_MODEL_DIR, { recursive: true });
  console.log(`Downloading small.en model into ${WHISPER_MODEL_DIR}...`);
  const { alreadyExisted: modelExisted } = await downloadWhisperModel({
    model: "small.en",
    folder: WHISPER_MODEL_DIR,
    printOutput: true,
  });
  console.log(modelExisted ? "Model already downloaded." : "Model downloaded.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
