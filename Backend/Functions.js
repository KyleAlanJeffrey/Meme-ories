function throwErrorMessage(component, message, err, DEBUG_MODE = true) {
  if (!DEBUG_MODE) return;
  switch (component) {
    case "db":
      throw console.log(`\n\nDB::::${message} -> ${err}::::\n\n`);
    default:
      throw console.log(`\n\n<-----ERROR: ${message} -> ${err}----->\n\n`);
  }
}

module.exports = {throwErrorMessage};