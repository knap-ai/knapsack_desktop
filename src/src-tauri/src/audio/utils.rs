pub fn sanitize_filename(title: String) -> String {
  title
      .replace('/', "_")
      .replace('\\', "_")
      .replace(':', "_")
      .replace('*', "_")
      .replace('?', "_")
      .replace('"', "_")
      .replace('<', "_")
      .replace('>', "_")
      .replace('|', "_")
      .replace(' ', "_")
      .trim()
      .to_string()
}
