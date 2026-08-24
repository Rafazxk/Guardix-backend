class Logger {

  static info(context, message) {
    console.log(`[${context}] ${message}`);
  }

  static error(context, message) {
    console.error(`[${context}] ERROR: ${message}`);
  }

}

export default Logger;