class DomainExtractor {
  execute(url: string): string | null {
    try {
      if (!url) {
        return null;
      }

      return new URL(url)
        .hostname
        .replace(/^www\./, "")
        .toLowerCase();
    } catch {
      return null;
    }
  }
}

export default DomainExtractor;